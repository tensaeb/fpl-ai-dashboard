"use client";

import { FDR_COLORS, fmtMoney, fmtNum } from "@/lib/format";
import { isFlagged, type NormalizedPlayer } from "@/lib/fpl/normalize";
import { teamColor } from "@/lib/teams";
import {
  AlertCircle,
  BarChart2,
  Crown,
  Shield,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useEffect } from "react";

interface PlayerDrawerProps {
  player: NormalizedPlayer | null;
  onClose: () => void;
  /** Optional: if the player is the currently recommended captain */
  isCaptainPick?: boolean;
}

/**
 * Slide-in panel that reveals full player intelligence on click/tap.
 * Keeps the main pitch cards clean while surfacing all relevant data here.
 */
export function PlayerDrawer({ player, onClose, isCaptainPick = false }: PlayerDrawerProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = player ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [player]);

  if (!player) return null;

  const flagged = isFlagged(player);
  const formUp = player.form >= 5;
  const formDown = player.form < 3;

  const statRow = (label: string, value: string | number, accent?: boolean) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0">
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={[
          "font-mono text-sm font-bold tabular",
          accent ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal
        aria-label={`${player.name} details`}
        className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[420px] flex-col bg-white dark:bg-[#0e1117] shadow-2xl slide-in-right safe-top safe-bottom"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-slate-200 dark:border-white/8 px-5 py-4"
          style={{ borderTopColor: teamColor(player.teamShort), borderTopWidth: 3 }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar placeholder — replace with <Image> when player photo URLs are available */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400">
              <User className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-extrabold text-slate-900 dark:text-white">
                {player.name}
              </h2>
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {player.teamShort} · {player.position} · {fmtMoney(player.price)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close player details"
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Status / injury alert */}
          {flagged && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  {player.status}
                  {player.chanceOfPlaying != null ? ` · ${player.chanceOfPlaying}% chance` : ""}
                </p>
                {player.news && (
                  <p className="mt-1 text-xs leading-relaxed text-rose-800 dark:text-rose-200">{player.news}</p>
                )}
              </div>
            </div>
          )}

          {/* Captain / VC badges */}
          {(player.isCaptain || player.isViceCaptain || isCaptainPick) && (
            <div className="flex flex-wrap gap-2">
              {player.isCaptain && (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-400/15 px-3 py-1 font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Crown className="h-3.5 w-3.5" /> Captain
                </span>
              )}
              {player.isViceCaptain && (
                <span className="flex items-center gap-1.5 rounded-full bg-sky-100 dark:bg-sky-400/15 px-3 py-1 font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                  <Shield className="h-3.5 w-3.5" /> Vice-Captain
                </span>
              )}
              {isCaptainPick && !player.isCaptain && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-400/15 px-3 py-1 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Crown className="h-3.5 w-3.5" /> AI Captain Pick
                </span>
              )}
            </div>
          )}

          {/* Form indicator */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] p-4">
            <div
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg",
                formUp
                  ? "bg-emerald-100 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400"
                  : formDown
                    ? "bg-rose-100 dark:bg-rose-400/15 text-rose-600 dark:text-rose-400"
                    : "bg-slate-200 dark:bg-white/5 text-slate-500",
              ].join(" ")}
            >
              {formUp ? <TrendingUp className="h-5 w-5" /> : formDown ? <TrendingDown className="h-5 w-5" /> : <BarChart2 className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Form
              </p>
              <p
                className={[
                  "font-mono text-2xl font-extrabold tabular",
                  formUp
                    ? "text-emerald-600 dark:text-emerald-400"
                    : formDown
                      ? "text-rose-500"
                      : "text-slate-900 dark:text-white",
                ].join(" ")}
              >
                {fmtNum(player.form)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-slate-200 dark:border-white/8 px-4">
            <p className="pt-3 pb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Season stats
            </p>
            {statRow("Total Points", player.totalPoints)}
            {statRow("Points per Game", fmtNum(player.ppg), true)}
            {statRow("Goals", player.goals)}
            {statRow("Assists", player.assists)}
            {statRow("Clean Sheets", player.cleanSheets)}
            {statRow("Minutes", player.minutes.toLocaleString())}
            {statRow("Ownership", `${fmtNum(player.ownership)}%`)}
            {statRow("Price", fmtMoney(player.price))}
          </div>

          {/* Next fixtures */}
          {player.nextFixtures.length > 0 && (
            <div>
              <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Next Fixtures
              </p>
              <div className="space-y-2">
                {player.nextFixtures.slice(0, 5).map((f, i) => {
                  const c = FDR_COLORS[f.difficulty] ?? FDR_COLORS[3];
                  return (
                    <div
                      key={`drawer-fix-${i}`}
                      className="flex items-center justify-between rounded-lg px-3.5 py-2.5 font-mono text-xs font-semibold"
                      style={{
                        background: `${c.bg}18`,
                        color: c.bg,
                        border: `1px solid ${c.ring}`,
                      }}
                    >
                      <span>
                        {f.vs} {f.home ? "(H)" : "(A)"}
                      </span>
                      <span className="opacity-70">GW{f.gw ?? "?"} · Diff {f.difficulty}/5</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* News */}
          {player.news && !flagged && (
            <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02] p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Latest News
              </p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{player.news}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
