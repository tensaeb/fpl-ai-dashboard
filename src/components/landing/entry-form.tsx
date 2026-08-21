"use client";

import { ArrowRight, Loader2, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function EntryForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = value.trim();
    if (!/^\d{2,9}$/.test(id)) {
      setError("Enter a valid 2 to 9 digit FPL Entry ID (found in your fantasy.premierleague.com URL).");
      return;
    }
    setError(null);
    setBusy(true);
    router.push(`/dashboard/${id}`);
  };

  const setSample = (sampleId: string) => {
    setValue(sampleId);
    setError(null);
  };

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={submit} className="relative">
        <div className="group relative flex items-center rounded-2xl border border-white/10 bg-[#0d121f]/90 p-1.5 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-neon/50 focus-within:shadow-[0_0_28px_-6px_rgba(0,245,155,0.25)]">
          <div className="flex items-center pl-4 text-mute transition-colors group-focus-within:text-neon">
            <Search className="h-5 w-5" />
          </div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="Enter public FPL Team ID (e.g. 5606232)"
            className="w-full bg-transparent px-3.5 py-3 font-mono text-sm tracking-wide text-ink placeholder:text-faint/70 focus:outline-none sm:py-3.5 sm:text-base"
          />
          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-neon px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#051a10] shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            <span className="hidden sm:inline">{busy ? "Loading…" : "Launch"}</span>
          </button>
        </div>

        {error && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-pulse animate-rise">
            <span className="h-1.5 w-1.5 rounded-full bg-pulse" />
            {error}
          </p>
        )}
      </form>

      {/* Quick sample chips */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-[11px] text-faint">Try examples:</span>
        <button
          type="button"
          onClick={() => setSample("5606232")}
          className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-mute transition-colors hover:border-neon/30 hover:bg-white/[0.06] hover:text-ink"
        >
          <Sparkles className="h-3 w-3 text-neon" />
          ID #5606232
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/demo")}
          className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-mute transition-colors hover:border-glow/30 hover:bg-white/[0.06] hover:text-ink"
        >
          Demo Squad ↗
        </button>
      </div>
    </div>
  );
}
