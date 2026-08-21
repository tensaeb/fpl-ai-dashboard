/** Formatting helpers shared across the dashboard. */

export const fmtRank = (n: number | null | undefined): string =>
  n == null ? "—" : n.toLocaleString("en-GB");

/** FPL money values are stored in 0.1m units. */
export const fmtMoney = (tenths: number | null | undefined): string =>
  tenths == null ? "—" : `£${(tenths / 10).toFixed(1)}m`;

export const fmtMoneySigned = (tenths: number): string => {
  const v = tenths / 10;
  const sign = v > 0 ? "+" : v < 0 ? "−" : "±";
  return `${sign}£${Math.abs(v).toFixed(1)}m`;
};

export const fmtNum = (n: number, digits = 1): string => n.toFixed(digits);

export const POSITIONS = ["GK", "DEF", "MID", "FWD"] as const;
export type PositionName = (typeof POSITIONS)[number];

export const positionName = (elementType: number): PositionName =>
  POSITIONS[Math.min(Math.max(elementType - 1, 0), 3)];

/** Map FPL status codes to human labels. */
export function statusLabel(
  status: string,
  chance: number | null,
): "available" | "injured" | "suspended" | "doubtful" | "unavailable" {
  if (status === "a") return "available";
  if (status === "i") return "injured";
  if (status === "s") return "suspended";
  // FPL uses 'd' exclusively for ≤75% doubt flags — anything above that
  // would ship as 'a' with 100%.
  if (status === "d") return "doubtful";
  return "unavailable";
}

/** FDR chip palette (FPL-style 1..5 difficulty). */
export const FDR_COLORS: Record<number, { bg: string; fg: string; ring: string }> = {
  1: { bg: "#00ff87", fg: "#032117", ring: "rgba(0,255,135,.35)" },
  2: { bg: "#7ad84b", fg: "#0c2407", ring: "rgba(122,216,75,.35)" },
  3: { bg: "#8d94ad", fg: "#10131f", ring: "rgba(141,148,173,.35)" },
  4: { bg: "#ff72ac", fg: "#2b0a18", ring: "rgba(255,114,172,.35)" },
  5: { bg: "#ff3d5e", fg: "#ffffff", ring: "rgba(255,61,94,.4)" },
};
