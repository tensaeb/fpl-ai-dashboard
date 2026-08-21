import { Countdown, LiveClockBadge } from "@/components/dashboard/chrome";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import type { PlayerMeta } from "@/components/dashboard/report";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { fmtMoney, fmtRank } from "@/lib/format";
import { getDashboardBundle } from "@/lib/fpl/client";
import { normalizeBundle } from "@/lib/fpl/normalize";
import { EntryNotFoundError } from "@/lib/fpl/types";
import { listOutcomes } from "@/lib/report/outcomes";
import { getOrCreateReport, listReportHistory, upsertEntry } from "@/lib/report/service";
import { ArrowLeft, CircleOff, Info, UserRound } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  return { title: `Entry ${entryId} · War Room — FPL//AI` };
}

/**
 * All data-fetching for the war room.
 */
async function loadPageData(id: number, isDemo: boolean) {
  const bundle = await getDashboardBundle(id, isDemo);
  const norm = normalizeBundle(bundle);
  await upsertEntry(bundle);
  const report = await getOrCreateReport(bundle, norm);
  const history = await listReportHistory(bundle.entryId);
  const outcomes = await listOutcomes(bundle.entryId);
  return { bundle, norm, report, history, outcomes };
}

export default async function DashboardPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId: raw } = await params;
  const isDemoSlug = raw === "demo";
  const id = isDemoSlug ? 0 : Number(raw);

  if (!isDemoSlug && (!Number.isInteger(id) || id <= 0 || id > 99_999_999)) {
    return <EntryError kind="invalid" raw={raw} />;
  }

  let data: Awaited<ReturnType<typeof loadPageData>>;
  try {
    data = await loadPageData(id, isDemoSlug);
  } catch (e) {
    if (e instanceof EntryNotFoundError) return <EntryError kind="not-found" raw={raw} />;
    throw e;
  }

  const { bundle, norm, report, history, outcomes } = data;

  const event = bundle.bootstrap.events.find((e) => e.id === bundle.currentEventId);
  const manager = `${bundle.entry.player_first_name} ${bundle.entry.player_last_name}`.trim() || "Unknown manager";

  // Meta lookup so report cards can show team/pos/price context
  const meta: Record<number, PlayerMeta> = {};
  const poolById = new Map(norm.pool.map((p) => [p.id, p]));
  const ids = new Set<number>();
  if (report) {
    const r = report.payload;
    [r.captain_suggestion.playerId, r.vice_captain_suggestion.playerId].forEach((x) => x != null && ids.add(x));
    r.transfer_suggestions.forEach((t) => {
      if (t.outId != null) ids.add(t.outId);
      if (t.inId != null) ids.add(t.inId);
    });
  }
  ids.forEach((pid) => {
    const p = poolById.get(pid);
    if (p) meta[pid] = { team: p.teamShort, pos: p.position, price: p.price };
  });

  // Rank trend from history
  const histRows = (bundle.history?.current ?? []).slice().sort((a, b) => b.event - a.event);
  const rankNow = histRows[0]?.overall_rank ?? bundle.entry.summary_overall_rank;
  const rankPrev = histRows[1]?.overall_rank ?? null;
  const rankDelta = rankPrev != null ? rankPrev - rankNow : null;

  const chipLabel: Record<string, string> = {
    wildcard: "Wildcard",
    freehit: "Free Hit",
    bboost: "Bench Boost",
    "3xc": "Triple Captain",
  };

  const kpiItems = [
    {
      label: "Overall Rank",
      value: fmtRank(bundle.entry.summary_overall_rank),
      tone: rankDelta != null ? (rankDelta >= 0 ? ("neon" as const) : ("pulse" as const)) : ("ink" as const),
      sub:
        rankDelta != null
          ? rankDelta >= 0
            ? `▲ ${fmtRank(Math.abs(rankDelta))} places`
            : `▼ ${fmtRank(Math.abs(rankDelta))} places`
          : "First tracked GW",
    },
    {
      label: `${event?.name ?? "GW"} Points`,
      value: String(bundle.picks.entry_history.points ?? 0),
      sub: event?.average_entry_score != null ? `Avg: ${event.average_entry_score}` : undefined,
    },
    { label: "Total Points", value: fmtRank(bundle.entry.summary_overall_points) },
    { label: "Bank Budget", value: fmtMoney(norm.bank), tone: "gold" as const, sub: "Spendable funds" },
    { label: "Squad Value", value: fmtMoney(norm.squadValue) },
    {
      label: "Free Transfers",
      value: `~${norm.freeTransfers}`,
      tone: norm.freeTransfers >= 2 ? ("neon" as const) : ("ink" as const),
      sub: norm.activeChip ? `Chip: ${chipLabel[norm.activeChip] ?? norm.activeChip}` : "Standard",
    },
  ];

  return (
    <main className="relative min-h-screen transition-colors duration-200">
      {/* Top ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-radial from-emerald-500/10 dark:from-emerald-500/15 via-transparent to-transparent blur-3xl" />
        <div className="grid-bg absolute inset-0 opacity-40" />
      </div>

      {/* Top sticky navigation bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-white/5 bg-white/85 dark:bg-[#090d16]/85 backdrop-blur-xl safe-top">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-700 dark:text-slate-300 transition-colors hover:border-emerald-500/40 sm:flex"
            >
              <UserRound className="h-3.5 w-3.5 text-emerald-500" />
              <span>Account</span>
            </Link>
            <ThemeToggle />
            <LiveClockBadge fetchedAt={bundle.fetchedAt} mode={bundle.mode} />
            <MobileNav />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1440px] space-y-8 px-5 pb-24 pt-6 sm:px-8">
        {/* Manager Header & Overview Banner */}
        <section>
          {bundle.mode === "demo" && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-amber-900 dark:text-amber-200">
              <Info className="h-4 w-4 shrink-0 text-amber-500" />
              <p className="font-mono text-xs leading-relaxed">
                Demo dataset active
                {isDemoSlug
                  ? " — viewing simulation squad."
                  : ` — live data unavailable, fallback simulation rendered.`}{" "}
                <Link href="/" className="underline underline-offset-4 font-bold hover:text-emerald-500">
                  Switch to your real entry ID
                </Link>
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-6 pb-2">
            <div className="rise">
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                <span>{event?.name ?? "Gameweek"}</span>
                <span>·</span>
                <span>Team #{bundle.entryId || raw}</span>
              </div>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {bundle.entry.name}
              </h1>
              <p className="mt-1 font-mono text-xs tracking-wide text-slate-500 dark:text-slate-400">
                Manager: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{manager}</strong>
                {bundle.entry.summary_overall_rank ? (
                  <>
                    {" "}· Rank: <span className="font-bold text-slate-900 dark:text-white">#{fmtRank(bundle.entry.summary_overall_rank)}</span> Overall
                  </>
                ) : null}
              </p>
            </div>

            {norm.deadline && (
              <div className="panel rise rise-1 rounded-2xl p-3.5 sm:px-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Transfer Deadline
                </p>
                <div className="mt-1">
                  <Countdown deadline={norm.deadline} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Dynamic Feature Tabs & Dashboard View Coordinator */}
        <DashboardView
          bundle={bundle}
          norm={norm}
          report={report}
          history={history}
          outcomes={outcomes}
          meta={meta}
          kpiItems={kpiItems}
        />

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-white/5 pt-10 mt-16">
          <div className="flex flex-col gap-3 font-mono text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            <p>
              Unofficial Fantasy Premier League intelligence platform. Data retrieved via public endpoints. Advice is informational; team management is executed exclusively on fantasy.premierleague.com.
            </p>
            <p>No passwords or credentials stored. Public entry IDs only.</p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 transition-colors hover:text-emerald-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Analyse Another Team
            </Link>
            <span className="font-mono text-[11px] text-slate-400">
              © {new Date().getFullYear()} FPL//AI
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function EntryError({ kind, raw }: { kind: "invalid" | "not-found"; raw: string }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-5">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="panel rise relative max-w-md rounded-3xl p-8 sm:p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <CircleOff className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {kind === "invalid" ? "Invalid Team ID" : "Team Not Found"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {kind === "invalid" ? (
            <>
              <span className="font-mono text-rose-500 font-bold">{raw}</span> is not a valid entry ID. Find your numerical ID in your FPL URL (e.g. <span className="font-mono text-emerald-500">/entry/5606232/event/…</span>).
            </>
          ) : (
            <>
              The official FPL API returned 404 for team <span className="font-mono text-rose-500 font-bold">{raw}</span>. Check your ID or view the demo squad.
            </>
          )}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-emerald-500 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-emerald-600"
          >
            Enter ID
          </Link>
          <Link
            href="/dashboard/demo"
            className="rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-900 dark:text-white transition-colors hover:border-emerald-500/50 hover:text-emerald-500"
          >
            Demo Squad
          </Link>
        </div>
      </div>
    </main>
  );
}
