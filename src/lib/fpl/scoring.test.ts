import { describe, expect, it } from "vitest";
import {
  candidateScore,
  captainScore,
  isFlagged,
  outScore,
  type NormalizedPlayer,
  type TeamFixture,
} from "./normalize";

let seq = 0;
function fix(difficulty: number, home = true): TeamFixture {
  return { gw: 1, vs: "BBB", vsTeamId: 2, home, difficulty, kickoff: null };
}

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
    form: 5,
    ppg: 5,
    totalPoints: 100,
    ownership: 10,
    minutes: 1800,
    status: "available",
    statusCode: "a",
    chanceOfPlaying: null,
    news: "",
    code: 0,
    goals: 5,
    assists: 5,
    cleanSheets: 2,
    nextFixtures: [fix(3)],
    avgDiffNext5: 3,
    pickPosition: 1,
    isStarter: true,
    isCaptain: false,
    isViceCaptain: false,
    multiplier: 1,
    ...over,
  };
}

describe("isFlagged — the hard filter", () => {
  it("flags every non-available status", () => {
    expect(isFlagged(mk({ status: "injured" }))).toBe(true);
    expect(isFlagged(mk({ status: "suspended" }))).toBe(true);
    expect(isFlagged(mk({ status: "doubtful" }))).toBe(true);
    expect(isFlagged(mk({ status: "unavailable" }))).toBe(true);
  });

  it("respects the 75% boundary exactly (blueprint: 75 or less)", () => {
    expect(isFlagged(mk({ status: "available", chanceOfPlaying: 75 }))).toBe(true);
    expect(isFlagged(mk({ status: "available", chanceOfPlaying: 50 }))).toBe(true);
    expect(isFlagged(mk({ status: "available", chanceOfPlaying: 76 }))).toBe(false);
    expect(isFlagged(mk({ status: "available", chanceOfPlaying: 100 }))).toBe(false);
  });

  it("treats available players with no chance data as clean", () => {
    expect(isFlagged(mk())).toBe(false);
  });
});

describe("captainScore — short-horizon weighting", () => {
  it("excludes flagged players outright with -Infinity", () => {
    expect(captainScore(mk({ status: "injured" }))).toBe(-Infinity);
    expect(captainScore(mk({ chanceOfPlaying: 25 }))).toBe(-Infinity);
  });

  it("rewards single-fixture difficulty being easier", () => {
    const tough = captainScore(mk({ nextFixtures: [fix(5)] }));
    const easy = captainScore(mk({ nextFixtures: [fix(2)] }));
    expect(easy).toBeGreaterThan(tough);
  });

  it("weights recent form positively", () => {
    expect(captainScore(mk({ form: 9 }))).toBeGreaterThan(captainScore(mk({ form: 2 })));
  });

  it("prefers home fixtures for the armband", () => {
    expect(captainScore(mk({ nextFixtures: [fix(3, true)] }))).toBeGreaterThan(
      captainScore(mk({ nextFixtures: [fix(3, false)] })),
    );
  });

  it("survives empty fixture lists", () => {
    expect(Number.isFinite(captainScore(mk({ nextFixtures: [] })))).toBe(true);
  });
});

describe("candidateScore — medium-horizon weighting", () => {
  it("excludes flagged players outright", () => {
    expect(candidateScore(mk({ status: "suspended" }), 10)).toBe(-Infinity);
  });

  it("rewards a kinder next-5 run over a brutal one", () => {
    const kindRun = candidateScore(mk({ avgDiffNext5: 2 }), 10);
    const brutalRun = candidateScore(mk({ avgDiffNext5: 4.6 }), 10);
    expect(kindRun).toBeGreaterThan(brutalRun);
  });

  it("punishes bench-warmers via the minutes factor", () => {
    expect(candidateScore(mk({ minutes: 90 }), 10)).toBeLessThan(
      candidateScore(mk({ minutes: 2000 }), 10),
    );
  });
});

describe("outScore — dispensability ranking", () => {
  it("marks flagged assets as the most dispensable", () => {
    const fit = mk({ form: 3, ppg: 3 });
    const hurt = mk({ form: 8, ppg: 6, status: "injured" });
    expect(outScore(hurt)).toBeLessThan(outScore(fit));
  });

  it("ranks a bad fixture run as more dispensable than decent form", () => {
    const inFormButBrutalRun = mk({ form: 6, avgDiffNext5: 4.6 });
    const quietWithKindRun = mk({ form: 5, avgDiffNext5: 2 });
    expect(outScore(inFormButBrutalRun)).toBeLessThan(outScore(quietWithKindRun));
  });
});
