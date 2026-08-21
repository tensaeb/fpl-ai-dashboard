"use client";

import { FDR_COLORS, fmtMoney, fmtNum } from "@/lib/format";
import type { NormalizedPlayer } from "@/lib/fpl/normalize";
import { Crown, Sparkles, TrendingUp, Trophy, Zap } from "lucide-react";
import { useMemo } from "react";

export function CaptainMatrix({ squad }: { squad: NormalizedPlayer[] }) {
  const starters = squad.filter((p) => p.isStarter);

  // Top 3 candidates sorted by form & total points
  const topCandidates = useMemo(() => {
    return starters
      .filter((p) => p.status === "available")
      .sort((a, b) => b.form * 1.5 + b.totalPoints * 0.05 - (a.form * 1.5 + a.totalPoints * 0.05))
      .slice(0, 3);
  }, [starters]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          Captaincy Decision Matrix
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Head-to-head analytical comparison of top armband candidates in your starting 11.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {topCandidates.map((p, idx) => {
          const next = p.nextFixtures[0];
          const fdr = next ? FDR_COLORS[next.difficulty] ?? FDR_COLORS[3] : FDR_COLORS[3];
          const isPrimary = idx === 0;

          return (
            <div
              key={`cap-candidate-${p.id}`}
              className={`panel rounded-3xl p-6 relative overflow-hidden transition-all ${
                isPrimary
                  ? "border-amber-400/50 shadow-[0_0_30px_-8px_rgba(251,191,36,0.2)] bg-amber-400/[0.03]"
                  : ""
              }`}
            >
              {isPrimary && (
                <span className="absolute top-4 right-4 rounded-full bg-amber-400 px-3 py-1 font-mono text-[10px] font-extrabold uppercase text-slate-950 shadow-md">
                  ★ Recommended
                </span>
              )}

              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                    isPrimary ? "bg-amber-400 text-black" : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  #{idx + 1}
                </span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Option {idx + 1}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {p.name}
                </h4>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {p.teamShort} · {p.position} · {fmtMoney(p.price)}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] p-3">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Current Form</span>
                  <p className="font-mono text-lg font-bold text-emerald-500 mt-0.5">{fmtNum(p.form)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] p-3">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Season Pts</span>
                  <p className="font-mono text-lg font-bold text-slate-900 dark:text-white mt-0.5">{p.totalPoints}</p>
                </div>
              </div>

              {/* Upcoming Fixture Card */}
              {next && (
                <div
                  className="mt-4 rounded-xl p-3 flex items-center justify-between font-mono text-xs font-bold"
                  style={{ background: `${fdr.bg}18`, color: fdr.bg, border: `1px solid ${fdr.ring}` }}
                >
                  <span>
                    vs {next.vs} {next.home ? "(H)" : "(A)"}
                  </span>
                  <span className="text-[10px] opacity-80">Difficulty {next.difficulty}/5</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
