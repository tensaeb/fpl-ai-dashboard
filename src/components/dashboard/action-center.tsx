"use client";

import { fmtNum } from "@/lib/format";
import type { NormalizedPlayer } from "@/lib/fpl/normalize";
import { isFlagged } from "@/lib/fpl/normalize";
import { captainScore } from "@/lib/fpl/normalize";
import type { StoredReport } from "@/lib/report/service";
import { AlertTriangle, ArrowRightLeft, ChevronDown, ChevronUp, Crown, ShieldAlert } from "lucide-react";
import { useState } from "react";

interface ActionCenterProps {
  squad: NormalizedPlayer[];
  report: StoredReport | null;
}

const CONF_LABEL: Record<string, { text: string; pct: number }> = {
  high:   { text: "High", pct: 85 },
  medium: { text: "Medium", pct: 60 },
  low:    { text: "Low", pct: 35 },
};

function ClickableCard({
  title,
  icon,
  accent,
  children,
  footer,
}: {
  title: string;
  icon: React.ReactNode;
  accent: "amber" | "indigo" | "emerald" | "rose";
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const border =
    accent === "amber"
      ? "border-amber-400/30 bg-amber-400/5 dark:border-amber-400/20 dark:bg-amber-400/[0.06]"
      : accent === "indigo"
        ? "border-indigo-400/30 bg-indigo-400/5 dark:border-indigo-400/20 dark:bg-indigo-400/[0.06]"
        : accent === "rose"
          ? "border-rose-400/30 bg-rose-400/5 dark:border-rose-400/20 dark:bg-rose-400/[0.06]"
          : "border-emerald-400/30 bg-emerald-400/5 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]";
  const iconBg =
    accent === "amber"
      ? "bg-amber-400/15 text-amber-500"
      : accent === "indigo"
        ? "bg-indigo-400/15 text-indigo-500"
        : accent === "rose"
          ? "bg-rose-400/15 text-rose-500"
          : "bg-emerald-400/15 text-emerald-500";
  const titleColor =
    accent === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : accent === "indigo"
        ? "text-indigo-600 dark:text-indigo-400"
        : accent === "rose"
          ? "text-rose-600 dark:text-rose-400"
          : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className={`rounded-2xl border ${border} overflow-hidden`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-4 p-4 text-left"
      >
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${titleColor}`}>
            {title}
          </p>
          <div className="mt-0.5 truncate font-display text-lg font-extrabold text-slate-900 dark:text-white">
            {children}
          </div>
          {footer && <div className="mt-1">{footer}</div>}
        </div>
        <span className="shrink-0 text-slate-400 mt-1">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <div className="border-t border-white/5 bg-white/[0.02] px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

export function ActionCenter({ squad, report }: ActionCenterProps) {
  // --- Captain ---
  const reportCap = report?.payload.captain_suggestion;
  const heuristicCap = [...squad]
    .filter((p) => p.isStarter)
    .sort((a, b) => captainScore(b) - captainScore(a))[0];

  const captainName = reportCap?.player ?? heuristicCap?.name ?? "—";
  const captainConf = report?.confidence
    ? CONF_LABEL[report.confidence] ?? CONF_LABEL.low
    : null;
  const captainReasoning = reportCap?.reasoning;

  // --- Transfer ---
  const topTransfer = report?.payload.transfer_suggestions?.[0] ?? null;
  const transferLabel = topTransfer ? `${topTransfer.out} → ${topTransfer.in}` : null;
  const transferSub = topTransfer
    ? topTransfer.cost_delta > 0
      ? `−£${fmtNum(topTransfer.cost_delta)}m cost`
      : `+£${fmtNum(Math.abs(topTransfer.cost_delta))}m freed`
    : null;
  const transferGw = topTransfer?.gameweek;
  const transferReasoning = topTransfer?.reasoning;

  // --- Risks ---
  const flagged = squad.filter(isFlagged);
  const riskLabel =
    flagged.length === 0
      ? "Squad healthy"
      : flagged.length === 1
        ? flagged[0].name
        : `${flagged.length} players flagged`;
  const riskSub =
    flagged.length === 0
      ? "All 15 available"
      : flagged
          .slice(0, 2)
          .map((p) => `${p.name}${p.chanceOfPlaying != null ? ` ${p.chanceOfPlaying}%` : ""}`)
          .join(", ");

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <ClickableCard
        title="Captain"
        icon={<Crown className="h-5 w-5" />}
        accent="amber"
        footer={
          captainReasoning ? (
            <div>
              {captainConf && (
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-400/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  {captainConf.text} confidence · {captainConf.pct}%
                </span>
              )}
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{captainReasoning}</p>
            </div>
          ) : undefined
        }
      >
        {captainName}
      </ClickableCard>

      <ClickableCard
        title={`Transfer${transferGw && transferGw > 0 ? ` · GW${transferGw}` : ""}`}
        icon={<ArrowRightLeft className="h-5 w-5" />}
        accent="indigo"
        footer={
          transferReasoning ? (
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{transferReasoning}</p>
          ) : undefined
        }
      >
        {transferLabel ?? "Hold free transfer"}
      </ClickableCard>

      <ClickableCard
        title={flagged.length > 0 ? "Watch" : "Squad Health"}
        icon={
          flagged.length > 0 ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <ShieldAlert className="h-5 w-5" />
          )
        }
        accent={flagged.length > 0 ? "rose" : "emerald"}
        footer={
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {flagged.length === 0
              ? "All 15 players are available and fit to start."
              : flagged
                  .slice(0, 3)
                  .map((p) => `${p.name}${p.chanceOfPlaying != null ? ` (${p.chanceOfPlaying}%)` : ""}`)
                  .join(", ")}
          </p>
        }
      >
        {riskLabel}
      </ClickableCard>
    </div>
  );
}
