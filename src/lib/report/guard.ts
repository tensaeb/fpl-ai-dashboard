import { isFlagged, type NormalizedPlayer } from "../fpl/normalize";
import type { Report } from "./types";

/**
 * Code-level enforcement of the blueprint's hard filter for LLM output.
 * The prompt asks Claude not to recommend flagged players; this pass makes
 * "asks nicely" irrelevant — a report that references a flagged (or
 * hallucinated) player is rejected wholesale and the caller falls back to
 * the deterministic engine. Shape validation alone (zod) can't do this.
 */

export interface GuardResult {
  ok: boolean;
  reason?: string;
}

/** Resolve a reference to a real pool player — by id, then by exact name. */
export function resolvePoolPlayer(
  pool: NormalizedPlayer[],
  id: number | undefined,
  name: string,
): NormalizedPlayer | null {
  if (id != null) {
    const byId = pool.find((p) => p.id === id);
    if (byId) return byId;
  }
  const lower = name.trim().toLowerCase();
  return pool.find((p) => p.name.trim().toLowerCase() === lower) ?? null;
}

function flaggedLabel(p: NormalizedPlayer): string {
  return p.chanceOfPlaying != null ? `${p.status} (${p.chanceOfPlaying}%)` : p.status;
}

export function guardReport(
  report: Report,
  pool: NormalizedPlayer[],
  bank: number,
): GuardResult {
  // Captain / vice must be squad-eligible and unflagged.
  for (const [label, ref] of [
    ["captain", report.captain_suggestion],
    ["vice-captain", report.vice_captain_suggestion],
  ] as const) {
    const p = resolvePoolPlayer(pool, ref.playerId, ref.player);
    if (!p) return { ok: false, reason: `${label} references unknown player "${ref.player}"` };
    if (isFlagged(p)) {
      return { ok: false, reason: `${label} ${p.name} is flagged (${flaggedLabel(p)})` };
    }
  }

  for (const t of report.transfer_suggestions) {
    const incoming = resolvePoolPlayer(pool, t.inId, t.in);
    const outgoing = resolvePoolPlayer(pool, t.outId, t.out);
    if (!incoming) return { ok: false, reason: `transfer-in references unknown player "${t.in}"` };
    if (!outgoing) return { ok: false, reason: `transfer-out references unknown player "${t.out}"` };
    if (isFlagged(incoming)) {
      return {
        ok: false,
        reason: `transfer-in ${incoming.name} is flagged (${flaggedLabel(incoming)})`,
      };
    }
    // Blueprint rule 4 — affordability is checked, not requested.
    if (incoming.price > bank + outgoing.price) {
      return {
        ok: false,
        reason: `${incoming.name} is unaffordable (£${(incoming.price / 10).toFixed(1)}m vs. £${((bank + outgoing.price) / 10).toFixed(1)}m available)`,
      };
    }
  }

  return { ok: true };
}
