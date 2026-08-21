"use client";

import { RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PHASES = [
  "Pulling public endpoints…",
  "Applying hard injury filter…",
  "Scoring next-5 fixture runs…",
  "Balancing bank + sale prices…",
  "Validating structured output…",
];

export function RegenerateButton({ entryId, demo }: { entryId: number; demo: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "working" | "error" | "limited">("idle");
  const [phase, setPhase] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (state !== "working") return;
    const t = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 1300);
    return () => clearInterval(t);
  }, [state]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const run = async () => {
    setState("working");
    setPhase(0);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, demo }),
      });
      if (res.status === 429) {
        const data = (await res.json().catch(() => ({}))) as { retryAfterSec?: number };
        setCooldown(Math.max(3, Math.min(data.retryAfterSec ?? 60, 300)));
        setState("limited");
        return;
      }
      if (!res.ok) throw new Error();
      router.refresh();
      setState("idle");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  const label =
    state === "working"
      ? "Building"
      : state === "limited"
        ? `Cooling down · ${cooldown}s`
        : state === "error"
          ? "Retry"
          : "Regenerate brief";

  return (
    <div className="flex items-center gap-3">
      {state === "working" && (
        <span className="sweep-text font-mono text-[11px] tracking-wider">{PHASES[phase]}</span>
      )}
      <button
        onClick={run}
        disabled={state === "working" || (state === "limited" && cooldown > 0)}
        className="group flex items-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-neon transition-all hover:bg-neon hover:text-[#032117] active:scale-[0.97] disabled:opacity-70 sm:px-5"
      >
        {state === "working" ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : state === "limited" ? (
          <ShieldAlert className="h-3.5 w-3.5 text-gold" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {label}
      </button>
    </div>
  );
}
