"use client";

import { Clock, TimerReset } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);

  const target = new Date(deadline).getTime();
  const diff = now === null ? null : Math.max(0, target - now);
  const d = diff === null ? null : Math.floor(diff / 86_400_000);
  const h = diff === null ? null : Math.floor((diff % 86_400_000) / 3_600_000);
  const min = diff === null ? null : Math.floor((diff % 3_600_000) / 60_000);
  const s = diff === null ? null : Math.floor((diff % 60_000) / 1000);

  const cell = (v: number | null, label: string) => (
    <div className="flex flex-col items-center">
      <span className="rounded-lg bg-white/5 px-2.5 py-1 font-mono text-base font-bold tabular text-white sm:text-xl border border-white/5">
        {v === null ? "--" : String(v).padStart(2, "0")}
      </span>
      <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <TimerReset className="hidden h-4 w-4 text-neon sm:block" />
      {cell(d, "days")}
      <span className="font-mono text-sm text-slate-500 font-bold">:</span>
      {cell(h, "hrs")}
      <span className="font-mono text-sm text-slate-500 font-bold">:</span>
      {cell(min, "min")}
      <span className="font-mono text-sm text-slate-500 font-bold">:</span>
      {cell(s, "sec")}
    </div>
  );
}

export function LiveClockBadge({ fetchedAt, mode }: { fetchedAt: string; mode: "live" | "demo" }) {
  const time = new Date(fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-300">
      <span
        className={`relative h-2 w-2 rounded-full ${
          mode === "live" ? "bg-[#00f59b] ping-dot" : "bg-[#fbbf24]"
        }`}
      />
      <span>{mode === "live" ? `Live · Synced ${time}` : "Demo dataset"}</span>
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  right,
  // legacy prop — accepted but ignored so existing call-sites don't break
  index: _index,
}: {
  /** Optional numbered index — kept for API compatibility, no longer rendered */
  index?: string;
  kicker: string;
  title: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
          {kicker}
        </p>
        <h2 className="mt-0.5 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}
