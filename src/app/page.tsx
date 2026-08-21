import { EntryForm } from "@/components/landing/entry-form";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  ArrowRight,
  ArrowRightLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  Crown,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MARQUEE = [
  "No FPL password needed",
  "Hard injury filter",
  "Fixture swing radar",
  "Optimized transfer delta",
  "Captaincy model",
  "Post-hoc accuracy tracker",
  "Public endpoints only",
];

const FEATURES = [
  {
    icon: ShieldCheck,
    tag: "Rule #1",
    title: "Hard Availability Filter",
    body: "Injured, suspended, or ≤75% doubt? Excluded automatically before any weighting runs — never a recommendation that sits out.",
    badge: "Zero wasted transfers",
  },
  {
    icon: Crown,
    tag: "Gameweek Pts",
    title: "Short-Horizon Armband",
    body: "Captaincy choice weighted heavily on explosive recent form and single-fixture difficulty. A 1-week decision gets 1-week logic.",
    badge: "Form × Difficulty",
  },
  {
    icon: ArrowRightLeft,
    tag: "Strategic",
    title: "Medium-Horizon Transfers",
    body: "Next-5 fixture runs and price efficiency dominate transfer moves. Avoid knee-jerking on one-week anomaly hauls.",
    badge: "5-GW Run Analysis",
  },
  {
    icon: Bot,
    tag: "Intelligence",
    title: "Structured AI Briefings",
    body: "Every brief delivers clear captain choices, bank-affordable transfer moves with exact £ deltas, and actionable dos & don'ts.",
    badge: "Gemini / Claude / Rules",
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-radial from-emerald-500/10 via-indigo-500/5 to-transparent blur-3xl" />
        <div className="grid-bg absolute inset-0 opacity-60" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo size="md" />
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 md:flex">
            <a href="#features" className="transition-colors hover:text-emerald-500">Features</a>
            <a href="#how" className="transition-colors hover:text-emerald-500">How It Works</a>
            <Link href="/account" className="transition-colors hover:text-emerald-500">Account</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard/demo"
              className="flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-2 font-mono text-xs text-slate-800 dark:text-white shadow-sm transition-all hover:border-emerald-500 hover:text-emerald-500"
            >
              <Play className="h-3 w-3 fill-current text-emerald-500" />
              <span className="hidden sm:inline">Live Demo</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 pt-8 sm:px-8 sm:pt-16 lg:pt-20">
        {/* Kicker badge */}
        <div className="rise flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/30 bg-neon/10 px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-neon shadow-[0_0_16px_-2px_rgba(0,245,155,0.3)]">
            <Sparkles className="h-3.5 w-3.5" />
            Next-Gen Gameweek Intelligence
          </span>
          <span className="hidden font-mono text-xs text-slate-500 sm:inline">· Free & Open</span>
        </div>

        {/* Main Hero Grid */}
        <div className="rise rise-1 mt-6 grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Heading & Input */}
          <div className="lg:col-span-7">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-[4.25rem] lg:leading-[1.08]">
              Win your FPL mini-league with <span className="text-gradient">data, not vibes.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Paste your public FPL entry ID to receive structured weekly briefings: ruthless injury checks, captaincy picks, affordable transfer recommendations, and fixture swing radars.
            </p>

            {/* Input form */}
            <div className="mt-8">
              <EntryForm />
            </div>

            {/* Trust points */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-neon" />
                Zero passwords stored
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-neon" />
                100% public FPL data
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-neon" />
                Works on iOS & Android
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="rise rise-2 lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-neon/20 via-violet/20 to-glow/20 blur-xl opacity-60" />

              {/* Main Card */}
              <div className="panel relative overflow-hidden rounded-3xl p-6 sm:p-7">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-neon ping-dot" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                      Sample Brief Preview
                    </span>
                  </div>
                  <span className="rounded-full border border-neon/30 bg-neon/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-neon">
                    GW27 Live
                  </span>
                </div>

                {/* Captain Suggestion Box */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                      <Crown className="h-3.5 w-3.5" /> Captaincy Armband
                    </span>
                    <span className="font-mono text-[10px] text-neon">94% Confidence</span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <h4 className="font-display text-2xl font-bold text-white">Haaland</h4>
                      <p className="font-mono text-xs text-slate-400">MCI · FWD · £15.2m</p>
                    </div>
                    <span className="rounded-lg bg-[#00f59b]/15 px-2.5 py-1 font-mono text-xs font-bold text-[#00f59b]">
                      Form 8.4
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                    Optimal single-fixture difficulty (IPS Home). Expected goal involvement dominates all squad alternatives.
                  </p>
                </div>

                {/* Mini Transfer Move */}
                <div className="mt-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1 text-violet font-bold">
                      <ArrowRightLeft className="h-3.5 w-3.5" /> Top Transfer Move
                    </span>
                    <span className="text-neon font-bold">+£0.4m bank</span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2">
                      <span className="font-mono text-[9px] font-bold uppercase text-pulse">OUT</span>
                      <p className="font-display font-semibold text-white truncate">Gordon</p>
                      <p className="font-mono text-[9px] text-slate-400">NEW · Mid</p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                      <span className="font-mono text-[9px] font-bold uppercase text-neon">IN</span>
                      <p className="font-display font-semibold text-white truncate">Palmer</p>
                      <p className="font-mono text-[9px] text-slate-400">CHE · Mid</p>
                    </div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="mt-5 flex items-center justify-between pt-2">
                  <span className="font-mono text-[10px] text-slate-400">Next-5 fixture swing verified</span>
                  <Link
                    href="/dashboard/demo"
                    className="flex items-center gap-1 font-mono text-xs font-bold text-neon hover:underline"
                  >
                    Open war room <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stat Ribbon */}
        <div className="rise rise-3 mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
          {[
            ["748ms", "Brief generation", "Real-time parsing"],
            ["0", "Passwords required", "Public ID only"],
            ["5-GW", "Planning horizon", "Anti-kneejerk"],
            ["100%", "Hard injury filter", "No benchwarmers"],
          ].map(([val, label, sub]) => (
            <div key={label} className="bg-[#0b0e17]/90 px-6 py-5 backdrop-blur-md">
              <p className="font-mono text-2xl font-bold text-neon tabular">{val}</p>
              <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">{label}</p>
              <p className="font-mono text-[10px] text-slate-400">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Marquee Ticker */}
      <div className="relative z-10 mt-16 border-y border-white/5 bg-[#0b0e17]/60 py-3.5 backdrop-blur-md">
        <div className="flex w-max animate-marquee gap-10">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Analytical Rigor</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Engineered advice, <span className="text-gradient">not guesswork.</span>
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Every gameweek decision is calculated across multiple time horizons with deterministic fallback rules.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="panel panel-hover flex flex-col justify-between rounded-3xl p-6.5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon/25 bg-neon/10 text-neon">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{f.body}</p>
              </div>
              <div className="mt-6 border-t border-white/5 pt-4">
                <span className="font-mono text-[11px] font-semibold text-neon">{f.badge}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Pipeline / How It Works */}
      <section id="how" className="relative z-10 border-t border-white/5 bg-[#0b0e17]/80 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-glow">Under The Hood</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              From public ID to strategic briefing.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Enter Team ID",
                desc: "Provide the numerical ID from your public fantasy.premierleague.com profile URL.",
              },
              {
                step: "02",
                title: "Fetch Public Data",
                desc: "We pull bootstrap-static, fixtures, picks, transfers, and leagues via non-intrusive cached endpoints.",
              },
              {
                step: "03",
                title: "Squad Normalization",
                desc: "Your squad is parsed with current form, next-5 difficulty run, availability status, and bank budget.",
              },
              {
                step: "04",
                title: "Strategic AI Brief",
                desc: "Captaincy choice, transfer moves with financial deltas, and strategic dos/donts generated instantly.",
              },
            ].map((s) => (
              <div key={s.step} className="panel rounded-3xl p-6">
                <span className="font-mono text-4xl font-extrabold text-white/10">{s.step}</span>
                <h3 className="mt-4 font-display text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-neon/20 bg-linear-to-r from-neon/[0.08] to-transparent p-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Ready to inspect your squad?</h3>
              <p className="mt-1 text-sm text-slate-400">Launch the live war room in one click without creating an account.</p>
            </div>
            <Link
              href="/dashboard/demo"
              className="flex items-center gap-2 rounded-xl bg-neon px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#051a10] transition-all hover:brightness-110"
            >
              Tour Demo Squad <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#07090e] py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Logo size="sm" />
              <p className="mt-3 max-w-md text-xs leading-relaxed text-slate-400">
                Unofficial Fantasy Premier League analytical dashboard. Unaffiliated with the Premier League or FPL. All advice is informational.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs text-slate-300 transition-colors hover:border-neon/40 hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>
              <Link
                href="/account"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs text-slate-300 transition-colors hover:border-neon/40 hover:text-white"
              >
                Account
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-6 text-center font-mono text-[11px] text-slate-400">
            © {new Date().getFullYear()} FPL//AI · Unofficial Fantasy Premier League Analytics
          </div>
        </div>
      </footer>
    </main>
  );
}
