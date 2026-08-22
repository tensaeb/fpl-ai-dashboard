import { z } from "zod";

/**
 * Structured output contract — mirrors the blueprint schema. The frontend
 * renders these as distinct cards, so prose is not allowed at this layer.
 */
export const pickSchema = z.object({
  player: z.string(),
  playerId: z.number().int().optional(),
  reasoning: z.string(),
});

export const transferSchema = z.object({
  out: z.string(),
  outId: z.number().int().optional(),
  in: z.string(),
  inId: z.number().int().optional(),
  cost_delta: z.number(),
  reasoning: z.string(),
  gameweek: z.number().int().optional(),
});

export const reportSchema = z.object({
  gameweek: z.number().int(),
  headline: z.string().optional(),
  league_note: z.string().optional(),
  captain_suggestion: pickSchema,
  vice_captain_suggestion: pickSchema,
  transfer_suggestions: z.array(transferSchema).max(4),
  dos: z.array(z.string()).min(1).max(6),
  donts: z.array(z.string()).min(1).max(6),
  confidence: z.enum(["high", "medium", "low"]),
});

export type Report = z.infer<typeof reportSchema>;
export type Confidence = Report["confidence"];

/** Strip accidental prose/markdown fences and validate against the schema. */
export function parseReportText(text: string): Report | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = reportSchema.safeParse(JSON.parse(text.slice(start, end + 1)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
