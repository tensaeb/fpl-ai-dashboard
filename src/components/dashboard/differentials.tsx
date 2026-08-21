"use client";

import { FDR_COLORS, fmtMoney, fmtNum } from "@/lib/format";
import type { NormalizedPlayer } from "@/lib/fpl/normalize";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";

export function DifferentialRadar({ pool }: { pool: NormalizedPlayer[] }) {
  const [maxOwnership, setMaxOwnership] = useState<number>(10);

  // Filter pool for low ownership, good form (>= 4.0), and active availability
  const differentials = useMemo(() => {
    return pool
      .filter((p) => p.status === "available")
      .filter((p) => p.form >= 3.5)
      .sort((a, b) => b.form - a.form)
      .slice(0, 8);
  }, [pool]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Differential Radar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Low-owned explosive players to help you break away from rival template squads in your mini-leagues.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {differentials.map((p, idx) => (
          <div
            key={`diff-${p.id}`}
            className="panel panel-hover rounded-3xl p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  Top Differential
                </span>
                <span className="font-mono text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Form {fmtNum(p.form)}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white truncate">
                  {p.name}
                </h4>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {p.teamShort} · {p.position} · {fmtMoney(p.price)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Points:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{p.totalPoints} pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Upcoming Match:</span>
                  {p.nextFixtures[0] && (
                    <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white">
                      {p.nextFixtures[0].vs} {p.nextFixtures[0].home ? "(H)" : "(A)"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex gap-1">
              {p.nextFixtures.slice(0, 4).map((f, i) => {
                const c = FDR_COLORS[f.difficulty] ?? FDR_COLORS[3];
                return (
                  <div
                    key={i}
                    className="flex-1 text-center rounded py-1 font-mono text-[9px] font-bold"
                    style={{ background: `${c.bg}20`, color: c.bg }}
                    title={`GW vs ${f.vs} - Difficulty ${f.difficulty}/5`}
                  >
                    {f.vs}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
