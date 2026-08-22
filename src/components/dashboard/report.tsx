"use client";

import { fmtNum } from "@/lib/format";
import type { StoredReport } from "@/lib/report/service";
import {
  ArrowRightLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  Shield,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { ExportBrief } from "./export-brief";
import { RegenerateButton } from "./regenerate";

export interface PlayerMeta {
  team: string;
  pos: string;
  price: number; // £0.1m units
}

const CONFIDENCE_CONFIG = {
  high:   { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "High", pct: 85 },
  medium: { bar: "bg-amber-400",   text: "text-amber-600 dark:text-amber-400",     label: "Medium", pct: 60 },
  low:    { bar: "bg-rose-500",    text: "text-rose-600 dark:text-rose-400",        label: "Low", pct: 35 },
} as const;

// ─── Collapsible reasoning block ─────────────────────────────────────────────

function Reasoning({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? "Hide reasoning" : "Why?"}
      </button>
      {open && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 border-l-2 border-slate-200 dark:border-white/10 pl-3">
          {text}
        </p>
      )}
    </div>
  );
}

// ─── Meta sub-line ────────────────────────────────────────────────────────────

function MetaSub({ id, meta }: { id?: number; meta: Record<number, PlayerMeta> }) {
  const m = id != null ? meta[id] : undefined;
  if (!m) return null;
  return (
    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-400">
      {m.team} · {m.pos} · £{fmtNum(m.price / 10)}m
    </p>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ReportSection({
  report,
  entryId,
  demo,
  meta,
}: {
  report: StoredReport | null;
  entryId: number;
  demo: boolean;
  meta: Record<number, PlayerMeta>;
}) {
  if (!report) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-8 text-center">
        <p className="font-mono text-sm text-slate-400">No brief available for this gameweek.</p>
        <div className="mt-5 flex justify-center">
          <RegenerateButton entryId={entryId} demo={demo} />
        </div>
      </div>
    );
  }

  const r = report.payload;
  const conf = CONFIDENCE_CONFIG[r.confidence as keyof typeof CONFIDENCE_CONFIG] ?? CONFIDENCE_CONFIG.low;
  const cap  = r.captain_suggestion;
  const vice = r.vice_captain_suggestion;

  return (
    <div className="space-y-4">

      {/* ── Top bar: confidence + controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Confidence bar */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${conf.bar}`}
                style={{ width: `${conf.pct}%` }}
              />
            </div>
            <span className={`font-mono text-xs font-bold ${conf.text}`}>
              {conf.label} confidence
            </span>
          </div>

          <span className="hidden h-3.5 w-px bg-slate-200 dark:bg-white/10 sm:block" />

          <span className="hidden font-mono text-[11px] text-slate-400 sm:block">
            {new Date(report.createdAt).toLocaleString("en-GB", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ExportBrief report={report} />
          <RegenerateButton entryId={entryId} demo={demo} />
        </div>
      </div>

      {/* ── Headline ── */}
      {r.headline && (
        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Gameweek Summary
            </span>
          </div>
          <p className="font-display text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            &ldquo;{r.headline}&rdquo;
          </p>
        </div>
      )}

      {/* ── Captain + Vice side-by-side ── */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Captain */}
        <div className="rounded-xl border border-amber-300/50 dark:border-amber-400/25 bg-amber-50 dark:bg-amber-400/[0.05] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">
              <Crown className="h-3.5 w-3.5" /> Captain
            </span>
            <span className="rounded-full bg-amber-100 dark:bg-amber-400/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
              Recommended
            </span>
          </div>
          <h3 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {cap.player}
          </h3>
          <MetaSub id={cap.playerId} meta={meta} />
          <Reasoning text={cap.reasoning} />
        </div>

        {/* Vice-Captain */}
        <div className="rounded-xl border border-sky-300/50 dark:border-sky-400/25 bg-sky-50 dark:bg-sky-400/[0.05] p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Shield className="h-3.5 w-3.5 text-sky-500" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Vice-Captain
            </span>
          </div>
          <h3 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {vice.player}
          </h3>
          <MetaSub id={vice.playerId} meta={meta} />
          <Reasoning text={vice.reasoning} />
        </div>
      </div>

      {/* ── Transfers ── */}
      <div>
        <h4 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Transfer Strategy
        </h4>

        {r.transfer_suggestions.length > 0 ? (
          <div className="space-y-4">
            {(() => {
              const grouped = new Map<number, typeof r.transfer_suggestions>();
              r.transfer_suggestions.forEach((t) => {
                const gw = t.gameweek ?? 0;
                if (!grouped.has(gw)) grouped.set(gw, []);
                grouped.get(gw)!.push(t);
              });
              return Array.from(grouped.entries()).sort(([a], [b]) => a - b).map(([gw, moves]) => (
                <div key={gw} className="space-y-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-400 dark:text-indigo-300">
                    {gw === 0 ? "Current GW" : `Gameweek ${gw}`}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {moves.map((t, i) => (
                      <div
                        key={`transfer-${gw}-${i}-${t.out}-${t.in}`}
                        className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-4"
                      >
                        {/* Out → In */}
                        <div className="flex items-stretch gap-2">
                          <div className="flex-1 rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-3 py-2.5">
                            <span className="font-mono text-[9px] font-bold uppercase text-rose-500">Out</span>
                            <p className="mt-0.5 font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                              {t.out}
                            </p>
                            {t.outId && meta[t.outId] && (
                              <p className="font-mono text-[10px] text-slate-400">{meta[t.outId].team} · {meta[t.outId].pos}</p>
                            )}
                          </div>

                          <div className="flex items-center text-slate-300 dark:text-slate-600">
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                          </div>

                          <div className="flex-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5">
                            <span className="font-mono text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">In</span>
                            <p className="mt-0.5 font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                              {t.in}
                            </p>
                            {t.inId && meta[t.inId] && (
                              <p className="font-mono text-[10px] text-slate-400">{meta[t.inId].team} · {meta[t.inId].pos}</p>
                            )}
                          </div>
                        </div>

                        {/* Cost delta */}
                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className={[
                              "rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold",
                              t.cost_delta > 0
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
                            ].join(" ")}
                          >
                            {t.cost_delta > 0 ? `−£${fmtNum(t.cost_delta)}m` : `+£${fmtNum(Math.abs(t.cost_delta))}m freed`}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {moves.length > 1 ? `Move ${i + 1}` : "Suggested"}
                          </span>
                        </div>

                        <Reasoning text={t.reasoning} />
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="flex items-center gap-3.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/[0.06] px-4 py-3.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white">Hold — no move recommended</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Bank the free transfer for next week.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Do / Don't ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
              Do
            </span>
          </div>
          <ul className="space-y-2.5">
            {r.dos.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-rose-500" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-rose-600 dark:text-rose-400">
              Avoid
            </span>
          </div>
          <ul className="space-y-2.5">
            {r.donts.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── League note ── */}
      {r.league_note && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-400/20 bg-indigo-50 dark:bg-indigo-400/[0.05] px-4 py-3.5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-500 dark:text-indigo-400 mb-1.5">
            Mini-League Intel
          </p>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{r.league_note}</p>
        </div>
      )}

    </div>
  );
}
