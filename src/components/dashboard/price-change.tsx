"use client";

import { TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import type { NormalizedPlayer } from "@/lib/fpl/normalize";
import { useMemo, useState } from "react";

interface PriceChangeBoardProps {
  pool: NormalizedPlayer[];
  squad: NormalizedPlayer[];
  currentGw: number;
}

function predictPriceChange(p: NormalizedPlayer): { direction: "rise" | "fall" | "stable"; confidence: number } {
  const ownership = parseFloat(String(p.ownership)) || 0;
  const form = p.form || 0;
  const minutes = p.minutes || 0;
  const points = p.totalPoints || 0;

  const ownershipNorm = Math.min(ownership / 25, 1);
  const formNorm = Math.min(form / 8, 1);
  const minutesNorm = Math.min(minutes / 1000, 1);
  const pointsNorm = Math.min(points / 100, 1);

  const score = ownershipNorm * 0.35 + formNorm * 0.30 + minutesNorm * 0.20 + pointsNorm * 0.15;

  if (score > 0.5) return { direction: "rise", confidence: Math.round(Math.min(score * 100, 95)) };
  if (score < 0.25) return { direction: "fall", confidence: Math.round(Math.min((1 - score) * 100, 85)) };
  return { direction: "stable", confidence: 50 };
}

export function PriceChangeBoard({ pool, squad, currentGw }: PriceChangeBoardProps) {
  const [search, setSearch] = useState("");
  const ownedIds = useMemo(() => new Set(squad.map((p) => p.id)), [squad]);

  const predictions = useMemo(() => {
    const base = pool
      .filter((p) => p.status === "available")
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.teamShort.toLowerCase().includes(search.toLowerCase()))
      .map((p) => ({ ...p, prediction: predictPriceChange(p) }))
      .sort((a, b) => {
        const aOwned = ownedIds.has(a.id) ? 0 : 1;
        const bOwned = ownedIds.has(b.id) ? 0 : 1;
        if (aOwned !== bOwned) return aOwned - bOwned;
        return b.prediction.confidence - a.prediction.confidence;
      });
    return base;
  }, [pool, ownedIds, search]);

  const rising = predictions.filter((p) => p.prediction.direction === "rise").slice(0, 8);
  const falling = predictions.filter((p) => p.prediction.direction === "fall").slice(0, 8);
  const stable = predictions.filter((p) => p.prediction.direction === "stable").slice(0, 6);

  const row = (p: { id: number; name: string; teamShort: string; price: number; prediction: { direction: string; confidence: number } }) => {
    const conf = p.prediction.confidence;
    const confColor = conf >= 70 ? "text-emerald-400" : conf >= 50 ? "text-amber-400" : "text-slate-400";
    const isOwned = ownedIds.has(p.id);
    return (
      <li key={p.id} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors ${isOwned ? "bg-emerald-500/10" : "hover:bg-white/5"}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-semibold text-white">{p.name}</p>
            {isOwned && (
              <span className="rounded-full bg-emerald-400/15 px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-400 uppercase shrink-0">
                You
              </span>
            )}
          </div>
          <p className="font-mono text-[10px] text-slate-400">{p.teamShort} · £{(p.price / 10).toFixed(1)}m</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-mono text-[10px] font-bold tabular ${confColor}`}>{conf}%</span>
          {p.prediction.direction === "rise" && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
          {p.prediction.direction === "fall" && <TrendingDown className="h-3.5 w-3.5 text-rose-400" />}
          {p.prediction.direction === "stable" && <Minus className="h-3.5 w-3.5 text-slate-500" />}
        </div>
      </li>
    );
  };

  return (
    <div className="panel rounded-3xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-glow" />
        <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
          Price Change Predictions
        </h4>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-slate-400">
          Next 3 GWs
        </span>
      </div>

      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any player or team..."
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-8 pr-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <p className="px-2 mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            Likely to Rise
          </p>
          <ul className="space-y-0.5">
            {rising.map(row)}
            {rising.length === 0 && (
              <li className="px-3 py-2 font-mono text-xs text-slate-400">No strong rise signals</li>
            )}
          </ul>
        </div>

        <div>
          <p className="px-2 mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Likely to Hold
          </p>
          <ul className="space-y-0.5">
            {stable.map(row)}
            {stable.length === 0 && (
              <li className="px-3 py-2 font-mono text-xs text-slate-400">No stable predictions</li>
            )}
          </ul>
        </div>

        <div>
          <p className="px-2 mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-rose-400">
            Likely to Fall
          </p>
          <ul className="space-y-0.5">
            {falling.map(row)}
            {falling.length === 0 && (
              <li className="px-3 py-2 font-mono text-xs text-slate-400">No strong fall signals</li>
            )}
          </ul>
        </div>
      </div>

      <p className="mt-4 px-2 font-mono text-[10px] text-slate-500">
        Based on ownership trends, form, minutes played, and total points. Not guaranteed — actual price changes depend on daily net transfer volume.
      </p>
    </div>
  );
}
