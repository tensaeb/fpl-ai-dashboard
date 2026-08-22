import type { ReportInput } from "./input";
import { parseReportText, type Report } from "./types";

/**
 * Optional ML paths — Gemini (free tier) or Claude. API keys live server-side
 * only; when none is configured (or a call fails validation even after one
 * retry) we silently fall back to the deterministic rules engine — the
 * blueprint's "report unavailable" fallback, minus the dead end.
 *
 * Provider order: Gemini (if GEMINI_API_KEY is set) is tried before Claude.
 * The engine actually stored on a report is decided by *what survived
 * validation*, never by which key happens to be present (review #2).
 */

const SYSTEM_PROMPT = `You are a Fantasy Premier League analyst producing a weekly report for a
single manager. You will be given a JSON payload describing their current
squad, bank balance, free transfers, and league context. Use only the data
provided — do not invent statistics, fixtures, or injury news not present
in the payload.

Weighting rules, in priority order:
1. HARD FILTER — never recommend transferring in, or captaining, any player
   flagged "injured", "suspended", or "doubtful" (75% or less chance of
   playing) in the payload's status field or chance_of_playing_pct field.
   This overrides all other signals.
2. Captaincy choice: weight recent form and single-fixture difficulty most
   heavily. This is a short-horizon decision.
3. Transfer suggestions: weight next-5-fixture difficulty run and price
   more heavily than single-gameweek form. This is a medium-horizon
   decision — do not suggest transfers based on one good or bad recent
   game alone.
4. Any suggested transfer must be affordable within the manager's stated
   bank balance plus the selling price of the outgoing player. Do not
   suggest transfers that would leave a negative bank balance.
5. Ownership percentage and differential value are a secondary note only —
   mention them if relevant to a template/rank-chasing strategy, but do not
   let them override rules 1-4.

Output format: respond ONLY with valid JSON matching this schema, no
preamble, no markdown fences:

{
  "gameweek": <int>,
  "headline": <string, max 12 words>,
  "captain_suggestion": {"player": <string>, "playerId": <int>, "reasoning": <string>},
  "vice_captain_suggestion": {"player": <string>, "playerId": <int>, "reasoning": <string>},
  "transfer_suggestions": [
    {"out": <string>, "outId": <int>, "in": <string>, "inId": <int>, "cost_delta": <float>, "gameweek": <int>, "reasoning": <string>}
  ],
  "dos": [<string>, ...],
  "donts": [<string>, ...],
  "confidence": "high" | "medium" | "low"
}

Include transfer suggestions for the current gameweek and the next two gameweeks (if relevant). Set gameweek to the target gameweek number for each suggestion.

playerId / outId / inId must be copied from the payload's id fields.
If the payload lacks enough information to responsibly recommend a
transfer, return an empty transfer_suggestions array rather than guessing.`;

type LlmProvider = "gemini" | "claude";

/** Gemini key can live in either var; both are read. */
function geminiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

interface GeminiPart {
  text?: string;
  [k: string]: unknown;
}
interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  output_text?: string;
}

async function callGemini(input: ReportInput, strict: boolean): Promise<Report | null> {
  const apiKey = geminiKey();
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    (strict
                      ? "REMINDER: respond with valid JSON only — no markdown, no commentary.\n\n"
                      : "") + JSON.stringify(input),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            maxOutputTokens: 1800,
          },
        }),
        signal: AbortSignal.timeout(35_000),
      },
    );
    if (!res.ok) {
      console.warn(`[llm] Gemini ${model} http ${res.status} — falling back`);
      return null;
    }
    const data = (await res.json()) as GeminiResponse;
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
      data.output_text ??
      "";
    if (!text.trim()) return null;
    return parseReportText(text);
  } catch {
    return null;
  }
}

const callFor = (provider: LlmProvider) => (provider === "gemini" ? callGemini : callClaude);

async function callClaude(input: ReportInput, strict: boolean): Promise<Report | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey, timeout: 28_000, maxRetries: 0 });
    const res = await client.messages.create({
      // Default model is a moving target — set ANTHROPIC_MODEL at deploy
      // time to pin a specific snapshot. Any failure (including a stale
      // default returning 404) falls back to the rules engine, loudly in
      // the engine field of the stored report.
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: 1800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            (strict
              ? "REMINDER: respond with valid JSON only — no markdown, no commentary.\n\n"
              : "") + JSON.stringify(input),
        },
      ],
    });
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    return parseReportText(text);
  } catch {
    return null;
  }
}

/** One strict retry on validation failure, per the blueprint. */
export async function generateWithAI(
  input: ReportInput,
): Promise<{ report: Report; provider: LlmProvider } | null> {
  const order: LlmProvider[] = [];
  if (geminiKey()) order.push("gemini");
  if (process.env.ANTHROPIC_API_KEY) order.push("claude");
  for (const provider of order) {
    const call = callFor(provider);
    const relaxed = await call(input, false);
    if (relaxed) return { report: relaxed, provider };
    const strict = await call(input, true);
    if (strict) return { report: strict, provider };
  }
  return null;
}

export const llmAvailable = (): boolean =>
  Boolean(geminiKey() || process.env.ANTHROPIC_API_KEY);

/** Human label for the dashboard chrome. */
export const aiProviderLabel = (): string | null => {
  if (geminiKey()) return "Gemini";
  if (process.env.ANTHROPIC_API_KEY) return "Claude";
  return null;
};
