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
      setError("Enter a valid 2–9 digit FPL entry ID (the number in your fantasy.premierleague.com URL).");
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
        <div className="group relative flex items-center rounded-2xl border hairline bg-card p-1.5 shadow-sm transition-colors duration-200 focus-within:border-neon">
          <div className="flex items-center pl-4 text-faint transition-colors group-focus-within:text-neon">
            <Search className="h-5 w-5" />
          </div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="Enter your public FPL entry ID (e.g. 5606232)"
            className="w-full bg-transparent px-3.5 py-3 font-mono text-sm tracking-wide text-ink placeholder:text-faint focus:outline-none sm:py-3.5 sm:text-base"
          />
          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-neon px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-void shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            <span className="hidden sm:inline">{busy ? "Loading…" : "Analyse"}</span>
          </button>
        </div>

        {error && (
          <p className="rise mt-2.5 flex items-center gap-1.5 text-xs text-pulse">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pulse" />
            {error}
          </p>
        )}
      </form>

      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-[11px] text-faint">Try it:</span>
        <button
          type="button"
          onClick={() => setSample("5606232")}
          className="flex items-center gap-1 rounded-lg border hairline bg-surface px-2.5 py-1 font-mono text-[11px] text-mute transition-colors hover:border-neon hover:text-ink"
        >
          <Sparkles className="h-3 w-3 text-neon" />
          ID #5606232
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/demo")}
          className="rounded-lg border hairline bg-surface px-2.5 py-1 font-mono text-[11px] text-mute transition-colors hover:border-glow hover:text-ink"
        >
          Demo squad ↗
        </button>
      </div>
    </div>
  );
}
