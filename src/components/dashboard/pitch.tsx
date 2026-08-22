"use client";

import { fmtNum } from "@/lib/format";
import { isFlagged, captainScore, type NormalizedPlayer } from "@/lib/fpl/normalize";
import { teamColor } from "@/lib/teams";
import { AlertCircle, BarChart2, Crown, List, Shield } from "lucide-react";
import { useState } from "react";
import { PlayerDrawer } from "./player-drawer";

// ─── Player card (pitch view) ────────────────────────────────────────────────

function PitchCard({
  p,
  small = false,
  onClick,
  isCaptainPick = false,
}: {
  p: NormalizedPlayer;
  small?: boolean;
  onClick: (p: NormalizedPlayer) => void;
  isCaptainPick?: boolean;
}) {
  const flagged = isFlagged(p);

  return (
    <button
      onClick={() => onClick(p)}
      title={`${p.name} — click for details`}
      className={[
        "group relative flex flex-col items-center rounded-2xl border p-2 text-center",
        "transition-all duration-150 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
        small ? "w-[76px] sm:w-[88px]" : "w-[80px] sm:w-[100px] lg:w-[108px]",
        flagged
          ? "border-rose-400/50 bg-white/95 dark:bg-rose-950/60 shadow-rose-200 dark:shadow-rose-950/40"
          : "border-slate-200 bg-white/95 dark:border-white/10 dark:bg-slate-900/90 hover:border-emerald-400/60 shadow-slate-100 dark:shadow-black/30",
        "shadow-sm",
      ].join(" ")}
    >
      {/* Captain / VC badge */}
      {(p.isCaptain || p.isViceCaptain) && (
        <span
          className={[
            "absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-extrabold shadow ring-2 ring-white dark:ring-slate-900",
            p.isCaptain ? "bg-amber-400 text-black" : "bg-sky-400 text-black",
          ].join(" ")}
        >
          {p.isCaptain ? "C" : "V"}
        </span>
      )}

      {/* AI captain recommendation badge */}
      {isCaptainPick && !p.isCaptain && (
        <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow ring-2 ring-white dark:ring-slate-900">
          <Crown className="h-2.5 w-2.5 text-white" />
        </span>
      )}

      {/* Injury alert */}
      {flagged && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow ring-2 ring-white dark:ring-slate-900">
          <AlertCircle className="h-3 w-3" />
        </span>
      )}

      {/* Team colour strip */}
      <span
        className="h-0.5 w-8 rounded-full"
        style={{ background: teamColor(p.teamShort) }}
      />

      {/* Player name */}
      <span
        className={[
          "mt-1.5 w-full truncate font-display font-bold leading-tight text-slate-900 dark:text-white",
          "group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors",
          small ? "text-[11px]" : "text-xs sm:text-[13px]",
        ].join(" ")}
      >
        {p.name}
      </span>

      {/* Team short + form */}
      <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {p.teamShort}
      </span>

      {/* Form badge */}
      {!small && (
        <span
          className={[
            "mt-1.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular",
            p.form >= 6
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400"
              : p.form < 3
                ? "bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400"
                : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400",
          ].join(" ")}
        >
          {fmtNum(p.form)}
        </span>
      )}
    </button>
  );
}

// ─── Pitch view ──────────────────────────────────────────────────────────────

function PitchView({
  rows,
  bench,
  onCardClick,
  captainPickId,
}: {
  rows: NormalizedPlayer[][];
  bench: NormalizedPlayer[];
  onCardClick: (p: NormalizedPlayer) => void;
  captainPickId?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8">
      {/* Pitch surface — flat gradient, no distracting SVG */}
      <div
        className="relative px-3 py-6 sm:px-6"
        style={{
          background: "linear-gradient(180deg, #0d4a1f 0%, #0a3d19 50%, #082f14 100%)",
        }}
      >
        {/* Subtle centre-line */}
        <div className="absolute inset-x-4 top-1/2 h-px bg-white/10" />
        <div
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          aria-hidden
        />

        {/* Formation rows: GK → DEF → MID → FWD */}
        <div className="relative flex flex-col gap-4">
          {/* Render rows in display order: FWD top, GK bottom — reversed visually */}
          {[...rows].reverse().map((row, ri) => (
            <div
              key={`row-${ri}`}
              className="flex items-center justify-center gap-1.5 sm:gap-3"
            >
              {row.map((p) => (
                  <PitchCard
                    key={p.id}
                    p={p}
                    onClick={onCardClick}
                    isCaptainPick={p.id === captainPickId}
                  />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bench */}
      <div className="border-t border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/60 px-3 py-4 sm:px-6">
        <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Substitutes
        </p>
        <div className="grid grid-cols-4 gap-2">
          {bench.map((p) => (
            <div key={p.id} className="flex justify-center">
              <PitchCard p={p} small onClick={onCardClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── List view ───────────────────────────────────────────────────────────────

const POSITION_LABELS: Record<number, string> = {
  1: "Goalkeeper",
  2: "Defenders",
  3: "Midfielders",
  4: "Forwards",
};

function ListView({
  rows,
  bench,
  onCardClick,
}: {
  rows: NormalizedPlayer[][];
  bench: NormalizedPlayer[];
  onCardClick: (p: NormalizedPlayer) => void;
}) {
  const allRows: Array<{ label: string; players: NormalizedPlayer[] }> = rows
    .map((group, i) => ({ label: POSITION_LABELS[i + 1] ?? "Unknown", players: group }))
    .filter((g) => g.players.length > 0);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/8 overflow-hidden">
      {allRows.map(({ label, players }) => (
        <div key={label}>
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-4 py-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              {label}
            </span>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {players.map((p) => {
              const flagged = isFlagged(p);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => onCardClick(p)}
                    className="group flex w-full items-center gap-3.5 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <span
                      className="h-7 w-1 shrink-0 rounded-full"
                      style={{ background: teamColor(p.teamShort) }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-display text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {p.name}
                        </span>
                        {p.isCaptain && (
                          <span className="rounded-full bg-amber-100 dark:bg-amber-400/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-700 dark:text-amber-400">
                            C
                          </span>
                        )}
                        {p.isViceCaptain && (
                          <span className="rounded-full bg-sky-100 dark:bg-sky-400/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-sky-700 dark:text-sky-400">
                            V
                          </span>
                        )}
                        {flagged && (
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                        )}
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        {p.teamShort}
                        {p.nextFixtures[0]
                          ? ` · ${p.nextFixtures[0].vs} ${p.nextFixtures[0].home ? "(H)" : "(A)"}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={[
                          "font-mono text-sm font-bold tabular",
                          p.form >= 6
                            ? "text-emerald-600 dark:text-emerald-400"
                            : p.form < 3
                              ? "text-rose-500"
                              : "text-slate-700 dark:text-slate-300",
                        ].join(" ")}
                      >
                        {fmtNum(p.form)}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">form</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Bench in list view */}
      {bench.length > 0 && (
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-4 py-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Bench
            </span>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {bench.map((p) => {
              const flagged = isFlagged(p);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => onCardClick(p)}
                    className="group flex w-full items-center gap-3.5 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors text-left opacity-70 hover:opacity-100"
                  >
                    <span
                      className="h-7 w-1 shrink-0 rounded-full opacity-50"
                      style={{ background: teamColor(p.teamShort) }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-display text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {p.name}
                        </span>
                        {flagged && <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        {p.teamShort} · {p.position}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-bold tabular text-slate-500 dark:text-slate-400 shrink-0">
                      {fmtNum(p.form)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Analysis view ───────────────────────────────────────────────────────────

function AnalysisView({ starters }: { starters: NormalizedPlayer[] }) {
  const sorted = [...starters].filter((p) => !isFlagged(p)).sort((a, b) => captainScore(b) - captainScore(a));
  const bestCap = sorted[0];
  const weakest = [...starters].sort((a, b) => a.form + a.ppg - (b.form + b.ppg))[0];
  const benchThreat = starters.filter((p) => !isFlagged(p)).sort((a, b) => b.form - a.form).slice(0, 3);
  const injured = starters.filter(isFlagged);

  const row = (label: string, value: string, accent?: "green" | "amber" | "red") => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
      <span
        className={[
          "font-display text-sm font-bold text-right",
          accent === "green"
            ? "text-emerald-600 dark:text-emerald-400"
            : accent === "amber"
              ? "text-amber-600 dark:text-amber-400"
              : accent === "red"
                ? "text-rose-500"
                : "text-slate-900 dark:text-white",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/8 overflow-hidden">
      <div className="bg-slate-50 dark:bg-white/[0.02] px-4 py-3 border-b border-slate-200 dark:border-white/8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Squad Analysis
        </p>
      </div>
      <div className="px-4">
        {bestCap && row("Best captain", `${bestCap.name} — Form ${fmtNum(bestCap.form)}`, "green")}
        {weakest && row("Player to monitor", `${weakest.name} — Form ${fmtNum(weakest.form)}`, "amber")}
        {benchThreat.length > 0 &&
          row("Top form starters", benchThreat.map((p) => p.name).join(", "), "green")}
        {injured.length > 0
          ? row("Injury risk", injured.map((p) => `${p.name} (${p.chanceOfPlaying ?? "?"}%)`).join(", "), "red")
          : row("Injury risk", "None — all available", "green")}
        {row(
          "Avg fixture diff (next)",
          starters.length
            ? `${(starters.reduce((s, p) => s + (p.nextFixtures[0]?.difficulty ?? 3), 0) / starters.length).toFixed(1)} / 5`
            : "—",
        )}
      </div>
    </div>
  );
}

// ─── Public export ───────────────────────────────────────────────────────────

type PitchViewMode = "pitch" | "list" | "analysis";

export function Pitch({
  squad,
  captainPickId,
}: {
  squad: NormalizedPlayer[];
  captainPickId?: number;
}) {
  const [mode, setMode] = useState<PitchViewMode>("pitch");
  const [selected, setSelected] = useState<NormalizedPlayer | null>(null);

  const starters = squad.filter((p) => p.isStarter);
  const bench = squad.filter((p) => !p.isStarter);

  // Group starters into formation rows by elementType (1=GK, 2=DEF, 3=MID, 4=FWD)
  const rows: NormalizedPlayer[][] = [1, 2, 3, 4].map((et) =>
    starters.filter((p) => p.elementType === et),
  );

  const tabs: Array<{ id: PitchViewMode; label: string; icon: React.ElementType }> = [
    { id: "pitch",    label: "Pitch",    icon: Shield },
    { id: "list",     label: "List",     icon: List },
    { id: "analysis", label: "Analysis", icon: BarChart2 },
  ];

  return (
    <>
      {/* View toggle header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Starting XI · {starters.length} players
        </p>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/8 p-0.5 bg-slate-50 dark:bg-white/[0.02]">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all",
                mode === id
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {mode === "pitch" && (
        <PitchView
          rows={rows}
          bench={bench}
          onCardClick={setSelected}
          captainPickId={captainPickId}
        />
      )}
      {mode === "list" && (
        <ListView rows={rows} bench={bench} onCardClick={setSelected} />
      )}
      {mode === "analysis" && (
        <AnalysisView starters={starters} />
      )}

      <PlayerDrawer
        player={selected}
        onClose={() => setSelected(null)}
        isCaptainPick={selected?.id === captainPickId}
      />
    </>
  );
}
