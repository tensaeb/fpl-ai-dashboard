import { FDR_COLORS, fmtNum, fmtRank } from "@/lib/format";
import type { NormalizedPlayer, TeamFixture } from "@/lib/fpl/normalize";
import type { LeagueStandings } from "@/lib/fpl/types";
import type { OutcomeRow } from "@/lib/report/outcomes";
import type { StoredReport } from "@/lib/report/service";
import { teamColor } from "@/lib/teams";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Minus,
  Repeat,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

/* ---------- KPI strip ---------- */

export function KpiRow({
  items,
}: {
  items: Array<{ label: string; value: string; sub?: string; tone?: "neon" | "pulse" | "gold" | "ink" }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((k) => (
        <div
          key={k.label}
          className="panel panel-hover flex flex-col justify-between rounded-2xl p-4.5"
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {k.label}
          </p>
          <div className="mt-2.5">
            <p
              className={`font-mono text-2xl font-bold tabular tracking-tight ${
                k.tone === "neon"
                  ? "text-[#00f59b]"
                  : k.tone === "pulse"
                  ? "text-rose-400"
                  : k.tone === "gold"
                  ? "text-amber-300"
                  : "text-white"
              }`}
            >
              {k.value}
            </p>
            {k.sub && (
              <p className="mt-1 truncate font-mono text-[10px] text-slate-400">
                {k.sub}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Fixture heatmap ---------- */

/**
 * Heatmap grid: rows = teams sorted by avg difficulty, columns = next 5 GWs.
 * Teams the user owns are pinned to the top and highlighted.
 */
export function FixturesBoard({
  teams,
  fixturesByTeam,
  ownedTeams,
  currentGw,
}: {
  teams: Array<{ id: number; name: string; short: string }>;
  fixturesByTeam: Record<number, TeamFixture[]>;
  ownedTeams: number[];
  currentGw: number;
}) {
  const owned = new Set(ownedTeams);

  // Pin owned teams first, then sort rest by avg difficulty asc
  const sorted = [...teams].sort((a, b) => {
    const aOwned = owned.has(a.id) ? 0 : 1;
    const bOwned = owned.has(b.id) ? 0 : 1;
    if (aOwned !== bOwned) return aOwned - bOwned;
    return avgDiff(fixturesByTeam[a.id]) - avgDiff(fixturesByTeam[b.id]);
  });

  // Collect column GW numbers from owned teams' fixtures
  const gwCols: number[] = Array.from({ length: 5 }, (_, i) => currentGw + i);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/8">
      <table className="w-full min-w-[480px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02]">
            <th className="px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 w-24">
              Team
            </th>
            {gwCols.map((gw) => (
              <th
                key={gw}
                className="px-2 py-2.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
              >
                GW{gw}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {sorted.map((t) => {
            const isOwned = owned.has(t.id);
            const fixtures = fixturesByTeam[t.id] ?? [];

            // Map GW number → fixture for quick lookup
            const byGw = new Map<number, TeamFixture>();
            fixtures.forEach((f) => { if (f.gw != null) byGw.set(f.gw, f); });

            return (
              <tr
                key={`heatmap-${t.id}`}
                className={[
                  "transition-colors",
                  isOwned
                    ? "bg-emerald-50 dark:bg-emerald-500/[0.05] hover:bg-emerald-100/60 dark:hover:bg-emerald-500/10"
                    : "hover:bg-slate-50 dark:hover:bg-white/[0.02]",
                ].join(" ")}
              >
                {/* Team name cell */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: teamColor(t.short) }}
                    />
                    <span
                      className={[
                        "font-display text-sm font-bold",
                        isOwned
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-700 dark:text-slate-300",
                      ].join(" ")}
                    >
                      {t.short}
                    </span>
                    {isOwned && (
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-400/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                        ✓
                      </span>
                    )}
                  </div>
                </td>

                {/* Fixture cells */}
                {gwCols.map((gw) => {
                  const f = byGw.get(gw);
                  if (!f) {
                    return (
                      <td key={gw} className="px-2 py-2.5 text-center">
                        <span className="font-mono text-[10px] text-slate-300 dark:text-slate-600">—</span>
                      </td>
                    );
                  }
                  const c = FDR_COLORS[f.difficulty] ?? FDR_COLORS[3];
                  return (
                    <td key={gw} className="px-2 py-2.5 text-center">
                      <div
                        className="inline-flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 font-mono"
                        style={{ background: `${c.bg}22`, border: `1px solid ${c.ring}` }}
                        title={`${t.short} vs ${f.vs} ${f.home ? "(H)" : "(A)"} — Difficulty ${f.difficulty}/5`}
                      >
                        <span className="text-[11px] font-bold" style={{ color: c.bg }}>
                          {f.vs}
                        </span>
                        <span className="text-[9px] opacity-70" style={{ color: c.bg }}>
                          {f.home ? "H" : "A"}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-4 py-2.5">
        <span className="font-mono text-[10px] text-slate-400">Difficulty:</span>
        {([1, 2, 3, 4, 5] as const).map((d) => {
          const c = FDR_COLORS[d];
          return (
            <span
              key={d}
              className="flex items-center gap-1.5 font-mono text-[10px] font-semibold"
              style={{ color: c.bg }}
            >
              <span className="h-2.5 w-2.5 rounded" style={{ background: c.bg }} />
              {d === 1 ? "Very easy" : d === 2 ? "Easy" : d === 3 ? "Medium" : d === 4 ? "Hard" : "Very hard"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function avgDiff(f?: TeamFixture[]): number {
  const slice = (f ?? []).slice(0, 5);
  if (!slice.length) return 99;
  return slice.reduce((s, x) => s + x.difficulty, 0) / slice.length;
}

/* ---------- Medical bay (compact) ---------- */

export function MedicalBay({ flagged }: { flagged: NormalizedPlayer[] }) {
  if (flagged.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/[0.06] px-4 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400">
          <ShieldAlert className="h-4 w-4" />
        </span>
        <div>
          <p className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">Squad healthy</p>
          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">All 15 players available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 dark:border-rose-500/25 bg-white dark:bg-rose-500/[0.04] overflow-hidden">
      <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-500/15 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            Injury Watch
          </span>
        </div>
        <span className="rounded-full bg-rose-100 dark:bg-rose-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
          {flagged.length} flagged
        </span>
      </div>
      <ul className="divide-y divide-rose-100 dark:divide-rose-500/10">
        {flagged.map((p) => (
          <li key={`flagged-${p.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
              {p.news && (
                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">{p.news}</p>
              )}
            </div>
            <span className="shrink-0 rounded-full bg-rose-100 dark:bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
              {p.chanceOfPlaying != null ? `${p.chanceOfPlaying}%` : p.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FormBoard({
  hot,
  cold,
}: {
  hot: NormalizedPlayer[];
  cold: NormalizedPlayer[];
}) {
  const row = (p: NormalizedPlayer, heat: boolean) => (
    <li
      key={`form-${heat ? "hot" : "cold"}-${p.id}`}
      className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/5"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {heat ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-[#00f59b]">
            <TrendingUp className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-500/15 text-rose-400">
            <TrendingDown className="h-3.5 w-3.5" />
          </span>
        )}
        <span className="truncate font-display text-sm font-semibold text-white">{p.name}</span>
        <span className="font-mono text-[10px] uppercase text-slate-400">{p.teamShort}</span>
      </div>
      <span
        className={`font-mono text-xs font-bold tabular ${
          heat ? "text-[#00f59b]" : "text-rose-400"
        }`}
      >
        {fmtNum(p.form)}
      </span>
    </li>
  );

  return (
    <div className="panel rounded-3xl p-5">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-glow" />
        <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
          Form Watch
        </h4>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="px-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-neon">
            Trending Hot
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {hot.map((p) => row(p, true))}
            {hot.length === 0 && (
              <li className="px-2 py-1 font-mono text-xs text-slate-400">No data</li>
            )}
          </ul>
        </div>

        <div className="border-t border-white/5 pt-3">
          <p className="px-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-rose-400">
            Trending Cold
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {cold.map((p) => row(p, false))}
            {cold.length === 0 && (
              <li className="px-2 py-1 font-mono text-xs text-slate-400">No data</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mini-leagues ---------- */

export function LeaguesBoard({ leagues, myEntry }: { leagues: LeagueStandings[]; myEntry: number }) {
  const [showAll, setShowAll] = useState(false);

  if (!leagues.length) {
    return (
      <div className="panel rounded-3xl p-8 text-center">
        <p className="font-mono text-xs text-slate-400">No classic leagues found for this entry.</p>
      </div>
    );
  }

  const visible = showAll ? leagues : leagues.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {visible.map((l) => (
          <article key={`league-${l.kind}-${l.league.id}`} className="panel overflow-hidden rounded-3xl">
            <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-white/[0.02]">
              <h4 className="truncate font-display text-base font-bold text-white">{l.league.name}</h4>
              <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase ${
                l.kind === "h2h"
                  ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-300"
                  : "border-white/10 bg-white/5 text-slate-400"
              }`}>
                {l.kind === "h2h" ? "H2H" : "Classic"}
              </span>
            </header>
            <div className="max-h-[420px] overflow-y-auto">
              <ul className="divide-y divide-white/5">
                {l.standings.results.map((r) => {
                  const me = r.entry === myEntry;
                  const delta = r.last_rank - r.rank;
                  return (
                    <li
                      key={`league-standing-${l.kind}-${l.league.id}-${r.id}-${r.entry}`}
                      className={`flex items-center gap-2.5 px-4 py-2 transition-colors ${
                        me ? "bg-neon/[0.08]" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <span
                        className={`w-5 shrink-0 font-mono text-xs font-bold tabular ${
                          me ? "text-neon" : "text-slate-400"
                        }`}
                      >
                        {r.rank}
                      </span>
                      {delta > 0 ? (
                        <span className="flex items-center text-neon" title={`Up ${delta} places`}>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </span>
                      ) : delta < 0 ? (
                        <span className="flex items-center text-rose-400" title={`Down ${Math.abs(delta)} places`}>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <Minus className="h-3 w-3 text-slate-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-xs font-semibold ${me ? "text-neon" : "text-white"}`}>
                          {r.entry_name}
                          {me && <span className="ml-1.5 font-mono text-[9px] text-neon">(You)</span>}
                        </p>
                        <p className="truncate font-mono text-[9px] uppercase tracking-wider text-slate-400">
                          {r.player_name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-[11px] font-bold tabular text-white">{fmtRank(r.total)}</p>
                        <p className="font-mono text-[9px] tabular text-emerald-400 dark:text-emerald-300">
                          GW {r.event_total}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </article>
        ))}
      </div>

      {leagues.length > 3 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {showAll ? "Show fewer leagues" : `Show all ${leagues.length} leagues`}
        </button>
      )}
    </div>
  );
}

/* ---------- Accuracy tracker (post-hoc scoring) ---------- */

export function AccuracyBoard({ outcomes }: { outcomes: OutcomeRow[] }) {
  if (!outcomes.length) {
    return (
      <div className="panel rounded-3xl p-8 text-center">
        <p className="font-mono text-xs leading-relaxed text-slate-400">
          No finished gameweeks scored yet. Once each GW closes, the cron engine scores the suggested captain call and transfer moves against actual points.
        </p>
      </div>
    );
  }

  const withCaptain = outcomes.filter((o) => o.captainHit !== null && o.captainPts !== null);
  const hitRate = withCaptain.length
    ? Math.round((withCaptain.filter((o) => o.captainHit).length / withCaptain.length) * 100)
    : 0;
  const avgCap = withCaptain.length
    ? withCaptain.reduce((s, o) => s + (o.captainPts ?? 0), 0) / withCaptain.length
    : 0;
  const avgBest = withCaptain.length
    ? withCaptain.reduce((s, o) => s + (o.captainBestPts ?? 0), 0) / withCaptain.length
    : 0;
  const allDeltas = outcomes.flatMap((o) => o.transferDeltas.map((d) => d.delta));
  const avgDelta = allDeltas.length
    ? allDeltas.reduce((s, d) => s + d, 0) / allDeltas.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [`${hitRate}%`, "Captain Hit-Rate", "Top-3 Starter", hitRate >= 60 ? "neon" : "gold"],
          [`${fmtNum(avgCap)}`, "Avg Captain Pts", `Best: ${fmtNum(avgBest)}`, "ink"],
          [`${outcomes.length}`, "Briefs Evaluated", "Finished Gameweeks", "ink"],
          [`${avgDelta >= 0 ? "+" : ""}${fmtNum(avgDelta)}`, "Avg Transfer Delta", "Net points gained", avgDelta >= 0 ? "neon" : "pulse"],
        ].map(([v, l, s, tone]) => (
          <div key={`accuracy-stat-${l}`} className="panel rounded-2xl p-4.5">
            <p
              className={`font-mono text-2xl font-bold tabular ${
                tone === "neon"
                  ? "text-[#00f59b]"
                  : tone === "pulse"
                  ? "text-rose-400"
                  : tone === "gold"
                  ? "text-amber-300"
                  : "text-white"
              }`}
            >
              {v}
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-300">{l}</p>
            <p className="font-mono text-[9px] text-slate-400">{s}</p>
          </div>
        ))}
      </div>

      <div className="panel overflow-hidden rounded-3xl">
        <ul className="divide-y divide-white/5">
          {outcomes.map((o, idx) => (
            <li
              key={`outcome-row-${o.reportId ?? idx}-${o.gameweek}-${idx}`}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 px-6 py-4 transition-colors hover:bg-white/[0.02]"
            >
              <span className="font-mono text-sm font-bold text-white">GW{o.gameweek}</span>
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                  o.captainHit ? "bg-emerald-500/15 text-[#00f59b]" : "bg-rose-500/15 text-rose-300"
                }`}
              >
                <Target className="h-3 w-3" />
                {o.captainHit ? "Captain hit" : "Captain missed"}
              </span>
              <span className="font-mono text-xs tabular text-slate-400">
                {o.captainPts ?? "—"} pts vs best {o.captainBestPts ?? "—"}
              </span>
              {o.transferDeltas.map((d, i) => (
                <span
                  key={`delta-${o.reportId}-${i}-${d.in}`}
                  className={`rounded-lg px-2 py-0.5 font-mono text-[10px] tabular ${
                    d.delta >= 0 ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"
                  }`}
                  title={`${d.in} (${d.inPts}pts) vs ${d.out} (${d.outPts}pts)`}
                >
                  {d.in} {d.delta >= 0 ? "+" : ""}{d.delta}
                </span>
              ))}
              <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-slate-400">
                {o.engine}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Report history ---------- */

const CONF_DOT: Record<string, string> = { high: "bg-[#00f59b]", medium: "bg-[#fbbf24]", low: "bg-[#f43f5e]" };

export function HistoryBoard({ history }: { history: StoredReport[] }) {
  if (!history.length) {
    return (
      <div className="panel rounded-3xl p-8 text-center">
        <p className="font-mono text-xs text-slate-400">No archived briefs yet — this is the first on record.</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden rounded-3xl">
      <ul className="divide-y divide-white/5">
        {history.map((r, i) => (
          <li
            key={`history-${r.id}-${r.gameweek}-${i}`}
            className={`flex flex-wrap items-center gap-x-5 gap-y-2 px-6 py-4 transition-colors ${
              i === 0 ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
            }`}
          >
            <span className="font-mono text-sm font-bold text-white">GW{r.gameweek}</span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${CONF_DOT[r.confidence] ?? "bg-slate-500"}`} />
              {r.confidence}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              {r.engine}
            </span>
            <span className="hidden font-mono text-xs text-slate-300 md:inline">
              <span className="text-gold font-bold">C:</span> {r.payload.captain_suggestion.player}
            </span>
            {i < history.length - 1 &&
              history[i + 1].payload.captain_suggestion.player !== r.payload.captain_suggestion.player && (
                <span className="hidden items-center gap-1 rounded-full bg-violet/15 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-violet md:flex">
                  <Repeat className="h-3 w-3" /> Changed from {history[i + 1].payload.captain_suggestion.player}
                </span>
              )}
            <span className="hidden font-mono text-xs text-slate-400 lg:inline">
              {r.payload.transfer_suggestions.length
                ? `${r.payload.transfer_suggestions.length} move${r.payload.transfer_suggestions.length > 1 ? "s" : ""} suggested`
                : "Hold recommended"}
            </span>
            <span className="ml-auto font-mono text-[10px] tracking-wider text-slate-400">
              {new Date(r.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
