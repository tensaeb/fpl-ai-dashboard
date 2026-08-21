"use client";

import {
  Bell,
  BellOff,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/* ---------------- Sign-in ---------------- */

export function SignInCard({ error }: { error?: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setDevLink(null);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      if (data.delivered) {
        setMsg("Link sent! Check your inbox. Valid for 15 minutes.");
      } else {
        setMsg("Email delivery not configured in this environment — your sign-in link is ready below.");
        setDevLink(data.devLink ?? null);
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel rise w-full max-w-md rounded-3xl p-8 sm:p-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/30 bg-neon/10 text-neon shadow-[0_0_20px_-4px_rgba(0,245,155,0.3)]">
        <KeyRound className="h-6 w-6" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold text-white">Sign In with Magic Link</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        No passwords. Enter your email and we&apos;ll send you a secure one-time link.
      </p>

      {error === "expired" && (
        <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 font-mono text-xs text-amber-300">
          That link has expired or was already used. Request a fresh one below.
        </p>
      )}

      <form onSubmit={submit} className="mt-6 space-y-3.5">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 focus-within:border-neon/50 transition-colors">
          <Mail className="h-4 w-4 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full bg-transparent py-3.5 font-mono text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#051a10] transition-all hover:brightness-110 disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Sending link…" : "Send Magic Link"}
        </button>
      </form>

      {msg && (
        <p className="mt-4 flex items-start gap-2 font-mono text-xs leading-relaxed text-slate-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neon" /> {msg}
        </p>
      )}

      {devLink && (
        <a
          href={devLink}
          className="mt-3 block break-all rounded-xl border border-neon/40 bg-neon/10 px-4 py-3 font-mono text-xs text-neon underline-offset-4 hover:underline"
        >
          {devLink}
        </a>
      )}
    </div>
  );
}

/* ---------------- Signed-in manager ---------------- */

export interface SavedEntryVM {
  entryId: number;
  teamName: string;
  notify: boolean;
}

export function AccountClient({
  email,
  entries,
  mailerReady,
}: {
  email: string;
  entries: SavedEntryVM[];
  mailerReady: boolean;
}) {
  const router = useRouter();
  const [newId, setNewId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => router.refresh();

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: newId.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Could not save entry.");
      setNewId("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save entry.");
    } finally {
      setBusy(false);
    }
  };

  const toggleNotify = async (entryId: number, notify: boolean) => {
    await fetch("/api/account/entries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, notify: !notify }),
    });
    refresh();
  };

  const remove = async (entryId: number) => {
    await fetch(`/api/account/entries?entryId=${entryId}`, { method: "DELETE" });
    refresh();
  };

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Identity Banner */}
      <div className="panel flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5 sm:px-6">
        <div className="flex items-center gap-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neon/15 font-mono text-base font-bold text-neon border border-neon/30">
            {email.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="font-mono text-sm font-semibold text-white">{email}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Authenticated Session</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-slate-300 transition-colors hover:border-rose-500/50 hover:text-rose-400"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>

      {/* Weekly Automation Notice */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-glow/30 bg-glow/[0.04] p-4.5">
        <CalendarClock className="h-5 w-5 shrink-0 text-glow" />
        <p className="font-mono text-xs leading-relaxed text-slate-300">
          <strong className="text-glow font-semibold">Weekly Brief Automation Active.</strong> Followed squads receive updated AI briefings generated automatically before each gameweek deadline.
        </p>
      </div>

      {/* Add Entry Form */}
      <div>
        <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-slate-300">
          Follow a Squad
        </h3>
        <form onSubmit={add} className="flex items-stretch gap-2.5">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 focus-within:border-neon/50 transition-colors">
            <Plus className="h-4 w-4 text-slate-400" />
            <input
              value={newId}
              onChange={(e) => setNewId(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="Enter public FPL Team ID (e.g. 5606232)"
              className="w-full bg-transparent py-3.5 font-mono text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !/^\d{2,9}$/.test(newId.trim())}
            className="flex items-center gap-2 rounded-xl bg-neon px-5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#051a10] transition-all hover:brightness-110 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Follow"}
          </button>
        </form>
        {error && <p className="mt-2 font-mono text-xs text-rose-400">{error}</p>}
      </div>

      {/* Tracked Squads List */}
      <div>
        <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-slate-300">
          Followed Squads ({entries.length})
        </h3>

        {entries.length === 0 ? (
          <div className="panel rounded-3xl p-8 text-center font-mono text-xs text-slate-400">
            No squads followed yet. Add an entry ID above to receive weekly strategic updates.
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((en) => (
              <li
                key={`saved-entry-${en.entryId}`}
                className="panel panel-hover flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-bold text-white">
                    {en.teamName || `Team #${en.entryId}`}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400">ID #{en.entryId}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/dashboard/${en.entryId}`}
                    className="flex items-center gap-1.5 rounded-xl border border-neon/40 bg-neon/10 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-neon transition-colors hover:bg-neon hover:text-[#051a10]"
                  >
                    War Room <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => toggleNotify(en.entryId, en.notify)}
                    title={en.notify ? "Weekly notification: Active" : "Weekly notification: Muted"}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs transition-colors ${
                      en.notify
                        ? "border-glow/40 bg-glow/10 text-glow"
                        : "border-white/10 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {en.notify ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => remove(en.entryId)}
                    title="Remove squad"
                    className="rounded-xl border border-white/10 p-2 text-slate-500 transition-colors hover:border-rose-500/50 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
