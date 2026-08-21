/** Approximate club accent colours for ticker dots / player chips. */
export const TEAM_COLORS: Record<string, string> = {
  ARS: "#ef0107",
  AVL: "#670e36",
  BOU: "#da291c",
  BRE: "#e30613",
  BHA: "#0057b8",
  BUR: "#6c1d45",
  CHE: "#034694",
  CRY: "#1b458f",
  EVE: "#003399",
  FUL: "#ccccc3",
  IPS: "#3a64a3",
  LEI: "#003090",
  LIV: "#c8102e",
  MCI: "#6cabdd",
  MUN: "#da291c",
  NEW: "#41b6e6",
  NFO: "#dd0000",
  SHU: "#ee2737",
  SOU: "#d71920",
  SUN: "#eb172b",
  TOT: "#b9b7a5",
  WHU: "#7a263a",
  WOL: "#fdb913",
  LUT: "#f78f1e",
};

export const teamColor = (short: string): string => TEAM_COLORS[short] ?? "#7b3ff2";
