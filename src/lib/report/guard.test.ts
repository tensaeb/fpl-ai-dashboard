import { describe, expect, it } from "vitest";
import type { NormalizedPlayer } from "../fpl/normalize";
import { guardReport, resolvePoolPlayer } from "./guard";
import type { Report } from "./types";

let seq = 0;
function mk(over: Partial<NormalizedPlayer> = {}): NormalizedPlayer {
  seq += 1;
  return {
    id: seq,
    name: `Player${seq}`,
    teamId: 1,
    teamShort: "AAA",
    position: "MID",
    elementType: 3,
    price: 80,
    form: 6,
    ppg: 6,
    totalPoints: 120,
    ownership: 12,
    minutes: 1800,
    status: "available",
    statusCode: "a",
    chanceOfPlaying: null,
    news: "",
    code: 0,
    goals: 4,
    assists: 4,
    cleanSheets: 2,
    nextFixtures: [],
    avgDiffNext5: 3,
    pickPosition: null,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    multiplier: 1,
    ...over,
  };
}

const FLAGGED = mk({ id: 500, name: "Hurt Hero", status: "doubtful", chanceOfPlaying: 50 });
const CHEAP = mk({ id: 501, name: "Budget Gem", price: 50 });
const PRICEY = mk({ id: 502, name: "Premium Star", price: 320 });
const OUT = mk({ id: 503, name: "Cold Toe", form: 2 });
const FIT = mk({ id: 504, name: "Form Horse", form: 8 });
const POOL = [FLAGGED, CHEAP, PRICEY, OUT, FIT];

function baseReport(): Report {
  return {
    gameweek: 7,
    captain_suggestion: { player: FIT.name, playerId: FIT.id, reasoning: "form" },
    vice_captain_suggestion: { player: OUT.name, playerId: OUT.id, reasoning: "safe" },
    transfer_suggestions: [],
    dos: ["x"],
    donts: ["y"],
    confidence: "high",
  };
}

describe("guardReport — code-level hard filter for LLM output", () => {
  it("accepts a clean report", () => {
    const r = baseReport();
    r.transfer_suggestions = [{ out: OUT.name, outId: OUT.id, in: CHEAP.name, inId: CHEAP.id, cost_delta: 0, reasoning: "swap" }];
    expect(guardReport(r, POOL, 50).ok).toBe(true);
  });

  it("rejects a captain pick that is flagged — prompt compliance is not trusted", () => {
    const r = baseReport();
    r.captain_suggestion = { player: FLAGGED.name, playerId: FLAGGED.id, reasoning: "risk it" };
    const g = guardReport(r, POOL, 50);
    expect(g.ok).toBe(false);
    expect(g.reason).toMatch(/flagged/i);
  });

  it("rejects transfer-ing a flagged player", () => {
    const r = baseReport();
    r.transfer_suggestions = [{ out: OUT.name, outId: OUT.id, in: FLAGGED.name, inId: FLAGGED.id, cost_delta: 0, reasoning: "gamble" }];
    expect(guardReport(r, POOL, 50).ok).toBe(false);
  });

  it("rejects hallucinated players (unresolvable id and name)", () => {
    const r = baseReport();
    r.captain_suggestion = { player: "Notareal Person", playerId: 999_999, reasoning: "made up" };
    expect(guardReport(r, POOL, 50).ok).toBe(false);
  });

  it("resolves name-only references against the pool (LLM omitted ids)", () => {
    const r = baseReport();
    r.captain_suggestion = { player: FLAGGED.name, reasoning: "no id supplied" };
    expect(guardReport(r, POOL, 50).ok).toBe(false);
    expect(resolvePoolPlayer(POOL, undefined, FLAGGED.name.toLowerCase())?.id).toBe(FLAGGED.id);
  });

  it("enforces affordability — bank plus sale price, per blueprint rule 4", () => {
    const r = baseReport();
    r.transfer_suggestions = [
      { out: OUT.name, outId: OUT.id, in: PRICEY.name, inId: PRICEY.id, cost_delta: 24, reasoning: "stretch" },
    ];
    // PRICEY 320 > OUT 80 + bank 50 → reject
    const g = guardReport(r, POOL, 50);
    expect(g.ok).toBe(false);
    expect(g.reason).toMatch(/unaffordable/i);
  });

  it("passes affordability when the numbers work", () => {
    const r = baseReport();
    r.transfer_suggestions = [
      { out: OUT.name, outId: OUT.id, in: PRICEY.name, inId: PRICEY.id, cost_delta: 24, reasoning: "ok" },
    ];
    // 320 <= 80 + 300 → ok
    expect(guardReport(r, POOL, 300).ok).toBe(true);
  });
});
