"use client";

import type { NormalizedPlayer } from "@/lib/fpl/normalize";
import { Award, CheckCircle2, Flame, HelpCircle, Layers, Sparkles, Zap } from "lucide-react";
import { useMemo } from "react";

export function ChipStrategyAdvisor({
  squad,
  currentGw,
  bank,
}: {
  squad: NormalizedPlayer[];
  currentGw: number;
  bank: number;
}) {
  const starters = squad.filter((p) => p.isStarter);
  const bench = squad.filter((p) => !p.isStarter);

  // Analytical scoring for each chip
  const analysis = useMemo(() => {
    const flaggedCount = squad.filter((p) => p.status !== "available").length;
    const benchFormAvg = bench.reduce((sum, p) => sum + p.form, 0) / Math.max(1, bench.length);
    const topCaptainForm = Math.max(...starters.map((p) => p.form), 0);

    return [
      {
        chip: "Triple Captain",
        icon: CrownIcon,
        recommendation: topCaptainForm >= 7.0 ? "HIGH POTENTIAL" : "HOLD",
        statusTone: topCaptainForm >= 7.0 ? "emerald" : "slate",
        score: Math.min(100, Math.round(topCaptainForm * 12)),
        advice:
          topCaptainForm >= 7.0
            ? "Your top asset is in explosive form with a favorable fixture. Prime candidate for the armband multiplier."
            : "Save for an upcoming Double Gameweek where premium assets play twice in one round.",
      },
      {
        chip: "Bench Boost",
        icon: Layers,
        recommendation: benchFormAvg >= 4.0 ? "READY" : "HOLD",
        statusTone: benchFormAvg >= 4.0 ? "emerald" : "slate",
        score: Math.min(100, Math.round(benchFormAvg * 20)),
        advice:
          benchFormAvg >= 4.0
            ? "Your bench has strong starting assets and high form. Favorable week to cash in on substitute points."
            : "Bench assets have lower expected returns. Build bench depth or wait for Double Gameweeks before activating.",
      },
      {
        chip: "Free Hit",
        icon: Zap,
        recommendation: flaggedCount >= 4 ? "STRONGLY RECOMMENDED" : "HOLD",
        statusTone: flaggedCount >= 4 ? "emerald" : "slate",
        score: Math.min(100, flaggedCount * 25),
        advice:
          flaggedCount >= 4
            ? "High injury count in squad. Use Free Hit to field a complete 11 without taking heavy transfer point hits."
            : "Squad is healthy. Preserve Free Hit for major Blank Gameweeks where multiple teams have no fixture.",
      },
      {
        chip: "Wildcard",
        icon: Sparkles,
        recommendation: flaggedCount >= 3 ? "CONSIDER" : "HOLD",
        statusTone: flaggedCount >= 3 ? "amber" : "slate",
        score: Math.min(100, flaggedCount * 20 + 20),
        advice:
          flaggedCount >= 3
            ? "Multiple structural issues identified in squad. A full reset will restructure balance without points deductions."
            : "Squad has good foundational structure. Roll transfers to maintain long-term flexibility.",
      },
    ];
  }, [squad, starters, bench]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          Chip Strategy Advisor
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Gameweek suitability analysis for Wildcard, Free Hit, Bench Boost, and Triple Captain.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analysis.map((item) => (
          <div key={item.chip} className="panel rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-display text-base font-bold text-slate-900 dark:text-white">
                  <item.icon className="h-4 w-4 text-indigo-500" />
                  {item.chip}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase ${
                    item.statusTone === "emerald"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : item.statusTone === "amber"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {item.recommendation}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  <span>Suitability</span>
                  <span className="font-bold text-slate-800 dark:text-white">{item.score}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.score >= 70 ? "bg-emerald-500" : item.score >= 40 ? "bg-amber-500" : "bg-slate-400"
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {item.advice}
              </p>
            </div>

            <div className="mt-5 border-t border-slate-200 dark:border-white/5 pt-3 text-right">
              <span className="font-mono text-[10px] text-slate-400">GW{currentGw} Evaluation</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
