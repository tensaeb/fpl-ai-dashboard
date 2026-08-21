import { FDR_COLORS, fmtNum, fmtRank } from "@/lib/format";
import type { NormalizedPlayer, TeamFixture } from "@/lib/fpl/normalize";
import type { LeagueStandings } from "@/lib/fpl/types";
import type { OutcomeRow } from "@/lib/report/outcomes";
import type { StoredReport } from "@/lib/report/service";
import { teamColor } from "@/lib/teams";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Minus,
  Repeat,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

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

/* ---------- Fixture swing board ---------- */

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
  const sorted = [...teams].sort((a, b) => {
    const aAvg = avgDiff(fixturesByTeam[a.id]);
    const bAvg = avgDiff(fixturesByTeam[b.id]);
    return aAvg - bAvg;
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {sorted.map((t) => {
        const fixtures = (fixturesByTeam[t.id] ?? []).slice(0, 4);
        const isOwned = owned.has(t.id);
        const avg = avgDiff(fixturesByTeam[t.id]);

        return (
          <div
            key={`fixture-team-${t.id}`}
            className={`rounded-2xl border p-3.5 backdrop-blur-md transition-all ${
              isOwned
                ? "border-neon/40 bg-neon/[0.05] shadow-[0_0_20px_-8px_rgba(0,245,155,0.2)]"
                : "border-white/5 bg-[#0f1422]/80 hover:border-white/15"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-xs"
                  style={{ background: teamColor(t.short) }}
                />
                <span className="font-display text-sm font-bold tracking-wide text-white">{t.short}</span>
              </div>
              {isOwned ? (
                <span className="rounded-full bg-neon/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-neon">
                  In Squad
                </span>
              ) : (
                <span className="font-mono text-[10px] text-slate-400">
                  diff {avg.toFixed(1)}
                </span>
              )}
            </div>

            <div className="mt-3 space-y-1.5">
              {fixtures.map((f, i) => {
                const c = FDR_COLORS[f.difficulty] ?? FDR_COLORS[3];
                return (
                  <div
                    key={`fixture-${t.id}-${f.gw ?? i}-${f.vs}`}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition-transform hover:scale-[1.02]"
                    style={{ background: `${c.bg}18`, color: c.bg, border: `1px solid ${c.ring}` }}
                    title={`GW${f.gw ?? currentGw + i} vs ${f.vs} ${f.home ? "(H)" : "(A)"} — Difficulty ${f.difficulty}/5`}
                  >
                    <span>
                      {f.vs} {f.home ? "(H)" : "(A)"}
                    </span>
                    <span className="opacity-75 text-[10px]">GW{f.gw ?? currentGw + i}</span>
                  </div>
                );
              })}
              {fixtures.length === 0 && (
                <p className="py-2 text-center font-mono text-[10px] text-slate-400">No scheduled matches</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function avgDiff(f?: TeamFixture[]): number {
  const slice = (f ?? []).slice(0, 5);
  if (!slice.length) return 99;
  return slice.reduce((s, x) => s + x.difficulty, 0) / slice.length;
}

/* ---------- Medical bay + form boards ---------- */

export function MedicalBay({ flagged }: { flagged: NormalizedPlayer[] }) {
  return (
    <div className={`panel rounded-3xl p-5 ${flagged.length ? "border-rose-500/30" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-pulse">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
            Medical Bay
          </h4>
        </div>
        <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-slate-400">
          {flagged.length} flagged
        </span>
      </div>

      {flagged.length ? (
        <ul className="mt-4 space-y-2.5">
          {flagged.map((p) => (
            <li
              key={`flagged-${p.id}`}
              className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold text-white">{p.name}</span>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-rose-300">
                  {p.status}
                  {p.chanceOfPlaying != null ? ` · ${p.chanceOfPlaying}%` : ""}
                </span>
              </div>
              {p.news && (
                <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-slate-300">
                  {p.news}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3 text-center">
          <p className="font-mono text-xs text-[#00f59b]">
            ✓ Clean bill of health — all 15 players available.
          </p>
        </div>
      )}
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
  if (!leagues.length) {
    return (
      <div className="panel rounded-3xl p-8 text-center">
        <p className="font-mono text-xs text-slate-400">No classic leagues found for this entry.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {leagues.map((l) => (
        <article key={`league-${l.league.id}`} className="panel overflow-hidden rounded-3xl">
          <header className="flex items-center justify-between border-b border-white/5 px-6 py-4.5 bg-white/[0.02]">
            <h4 className="truncate font-display text-lg font-bold text-white">{l.league.name}</h4>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] uppercase text-slate-400">
              Classic
            </span>
          </header>
          <ul className="divide-y divide-white/5">
            {l.standings.results.slice(0, 8).map((r) => {
              const me = r.entry === myEntry;
              const delta = r.last_rank - r.rank;
              return (
                <li
                  key={`league-standing-${l.league.id}-${r.id}-${r.entry}`}
                  className={`flex items-center gap-3.5 px-6 py-3.5 transition-colors ${
                    me ? "bg-neon/[0.08]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`w-6 font-mono text-sm font-bold tabular ${
                      me ? "text-neon" : "text-slate-400"
                    }`}
                  >
                    {r.rank}
                  </span>
                  {delta > 0 ? (
                    <span className="flex items-center text-neon" title={`Up ${delta} places`}>
                      <ChevronUp className="h-4 w-4" />
                    </span>
                  ) : delta < 0 ? (
                    <span className="flex items-center text-rose-400" title={`Down ${Math.abs(delta)} places`}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  ) : (
                    <Minus className="h-3.5 w-3.5 text-slate-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${me ? "text-neon" : "text-white"}`}>
                      {r.entry_name}
                      {me && <span className="ml-2 font-mono text-[10px] text-neon">(You)</span>}
                    </p>
                    <p className="truncate font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      {r.player_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold tabular text-white">{fmtRank(r.total)}</p>
                    <p className="font-mono text-[10px] tabular text-slate-400">+{r.event_total}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
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
