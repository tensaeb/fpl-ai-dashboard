"use client";

import { fmtMoney, fmtNum } from "@/lib/format";
import type { NormalizedPlayer } from "@/lib/fpl/normalize";
import { Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

export function DifferentialRadar({ pool, squad }: { pool: NormalizedPlayer[]; squad: NormalizedPlayer[] }) {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");

  const ownedIds = useMemo(() => new Set(squad.map((p) => p.id)), [squad]);

  const differentials = useMemo(() => {
    const base = pool
      .filter((p) => p.status === "available" && p.form >= 3.5)
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.teamShort.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const aOwned = ownedIds.has(a.id) ? 0 : 1;
        const bOwned = ownedIds.has(b.id) ? 0 : 1;
        if (aOwned !== bOwned) return aOwned - bOwned;
        return b.form - a.form;
      });
    return base.slice(0, showAll ? base.length : 8);
  }, [pool, ownedIds, search, showAll]);

  if (differentials.length === 0) {
    return (
      <p className="font-mono text-xs text-slate-400 py-4">No differential data available.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowAll(true); }}
            placeholder="Search any player or team..."
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-8 pr-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          {differentials.filter((p) => ownedIds.has(p.id)).length} in your squad
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/8 overflow-hidden">
        <ul className="divide-y divide-slate-100 dark:divide-white/5">
          {differentials.map((p) => {
            const next = p.nextFixtures[0];
            const formHot = p.form >= 6;
            const isOwned = ownedIds.has(p.id);
            return (
              <li
                key={`diff-${p.id}`}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  isOwned ? "bg-emerald-50/60 dark:bg-emerald-500/[0.06]" : "hover:bg-white/5"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                    {isOwned && (
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-400/15 px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-slate-400">{p.teamShort} · {p.position} · {fmtMoney(p.price)}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`font-mono text-xs font-bold tabular ${formHot ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}>
                    {fmtNum(p.form)}
                  </span>
                  {next && (
                    <span className="font-mono text-[10px] text-slate-400">
                      {next.vs} {next.home ? "(H)" : "(A)"}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-slate-400 tabular w-12 text-right">
                    {fmtNum(p.ownership)}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {!showAll && differentials.length > 8 && (
        <button
          onClick={() => setShowAll(true)}
          className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Show all {differentials.length}
        </button>
      )}
    </div>
  );
}
