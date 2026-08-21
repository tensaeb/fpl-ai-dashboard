"use client";

import { FDR_COLORS, fmtMoney, fmtNum } from "@/lib/format";
import type { NormalizedPlayer } from "@/lib/fpl/normalize";
import {
  AlertCircle,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Coins,
  Minus,
  Plus,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

interface TransferSimulatorProps {
  squad: NormalizedPlayer[];
  pool: NormalizedPlayer[];
  bank: number; // in 0.1m units
  freeTransfers: number;
}

export function TransferSimulator({ squad, pool, bank, freeTransfers }: TransferSimulatorProps) {
  const [selectedOutId, setSelectedOutId] = useState<number>(squad[0]?.id ?? 0);
  const [selectedInId, setSelectedInId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [posFilter, setPosFilter] = useState<string>("ALL");

  const playerOut = useMemo(() => squad.find((p) => p.id === selectedOutId) ?? squad[0], [squad, selectedOutId]);

  // Filter candidates by position (matching playerOut by default or filter) and search
  const candidates = useMemo(() => {
    const ownedIds = new Set(squad.map((p) => p.id));
    return pool
      .filter((p) => !ownedIds.has(p.id))
      .filter((p) => (posFilter === "ALL" ? true : p.position === posFilter))
      .filter((p) =>
        searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.teamShort.toLowerCase().includes(searchQuery.toLowerCase()) : true,
      )
      .sort((a, b) => b.form - a.form)
      .slice(0, 30);
  }, [pool, squad, posFilter, searchQuery]);

  const playerIn = useMemo(() => {
    if (selectedInId) {
      return pool.find((p) => p.id === selectedInId) ?? candidates[0] ?? null;
    }
    return candidates[0] ?? null;
  }, [pool, selectedInId, candidates]);

  // Financial calculations (in £0.1m units)
  const sellPrice = playerOut ? playerOut.price : 0;
  const buyCost = playerIn ? playerIn.price : 0;
  const netDelta = buyCost - sellPrice;
  const newBank = bank - netDelta;
  const isAffordable = newBank >= 0;
  const formDelta = playerIn && playerOut ? playerIn.form - playerOut.form : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-emerald-500" />
            Interactive Transfer Simulator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate moves before making them official on FPL. Test budget impact, fixture runs, and form deltas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3.5 py-1.5 font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
            Bank: <span className="text-amber-500 font-bold">{fmtMoney(bank)}</span>
          </span>
          <span className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3.5 py-1.5 font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
            FT: <span className="text-emerald-500 font-bold">{freeTransfers}</span>
          </span>
        </div>
      </div>

      {/* Simulator Head-to-Head Comparison Card */}
      <div className="panel rounded-3xl p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          {/* Sell Column (OUT) */}
          <div className="lg:col-span-5 rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-rose-500">
                SELL (OUT)
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                Sale: <strong className="text-slate-800 dark:text-white font-bold">{fmtMoney(sellPrice)}</strong>
              </span>
            </div>

            {/* Select Out Player Dropdown */}
            <div className="mt-4">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Choose squad player to remove
              </label>
              <select
                value={selectedOutId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedOutId(id);
                  const p = squad.find((x) => x.id === id);
                  if (p) setPosFilter(p.position);
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0c101c] px-3.5 py-2.5 font-display text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              >
                {squad.map((p) => (
                  <option key={`opt-out-${p.id}`} value={p.id}>
                    {p.name} ({p.teamShort} · {p.position} · {fmtMoney(p.price)})
                  </option>
                ))}
              </select>
            </div>

            {playerOut && (
              <div className="mt-4 space-y-3 pt-3 border-t border-rose-500/15">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Current Form:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{fmtNum(playerOut.form)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Points:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{playerOut.totalPoints} pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Next 3 Fixtures:</span>
                  <div className="flex gap-1">
                    {playerOut.nextFixtures.slice(0, 3).map((f, i) => {
                      const c = FDR_COLORS[f.difficulty] ?? FDR_COLORS[3];
                      return (
                        <span
                          key={i}
                          className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold"
                          style={{ background: `${c.bg}22`, color: c.bg }}
                        >
                          {f.vs}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Swap Arrow & Financial Status */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 shadow-md">
              <ArrowRight className="h-5 w-5 text-emerald-500 hidden lg:block" />
              <ArrowRightLeft className="h-5 w-5 text-emerald-500 lg:hidden" />
            </div>

            <div className="text-center">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block">
                Net Cost
              </span>
              <span
                className={`font-mono text-sm font-bold ${
                  netDelta > 0 ? "text-amber-500" : "text-emerald-500"
                }`}
              >
                {netDelta > 0 ? `+£${fmtNum(netDelta / 10)}m` : `−£${fmtNum(Math.abs(netDelta) / 10)}m`}
              </span>
            </div>

            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 font-mono text-[11px] font-bold ${
                isAffordable
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
              }`}
            >
              {isAffordable ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {isAffordable ? `Bank Left: £${fmtNum(newBank / 10)}m` : "Over Budget"}
            </div>
          </div>

          {/* Buy Column (IN) */}
          <div className="lg:col-span-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-emerald-500">
                BUY (IN)
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                Cost: <strong className="text-slate-800 dark:text-white font-bold">{fmtMoney(buyCost)}</strong>
              </span>
            </div>

            {/* Candidate Search / Select */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target player candidate
                </label>
                <div className="flex gap-1">
                  {["ALL", "GK", "DEF", "MID", "FWD"].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPosFilter(pos)}
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                        posFilter === pos
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mb-2">
                <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search player or team (e.g. Palmer, Arsenal)"
                  className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0c101c] pl-8 pr-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={playerIn?.id ?? ""}
                onChange={(e) => setSelectedInId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0c101c] px-3.5 py-2.5 font-display text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {candidates.map((p) => (
                  <option key={`opt-in-${p.id}`} value={p.id}>
                    {p.name} ({p.teamShort} · {p.position} · {fmtMoney(p.price)} · Form: {fmtNum(p.form)})
                  </option>
                ))}
              </select>
            </div>

            {playerIn && (
              <div className="mt-4 space-y-3 pt-3 border-t border-emerald-500/15">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Current Form:</span>
                  <span className="font-mono font-bold text-emerald-500 flex items-center gap-1">
                    {fmtNum(playerIn.form)}
                    {formDelta > 0 && <span className="text-[10px] text-emerald-500">(+{fmtNum(formDelta)})</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Points:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{playerIn.totalPoints} pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Next 3 Fixtures:</span>
                  <div className="flex gap-1">
                    {playerIn.nextFixtures.slice(0, 3).map((f, i) => {
                      const c = FDR_COLORS[f.difficulty] ?? FDR_COLORS[3];
                      return (
                        <span
                          key={i}
                          className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold"
                          style={{ background: `${c.bg}22`, color: c.bg }}
                        >
                          {f.vs}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
