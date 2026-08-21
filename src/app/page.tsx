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
} from "lucide-react";
import Link from "next/link";

const MARQUEE = [
  "No FPL password needed",
  "Hard injury filter",
  "Fixture swing radar",
  "Optimised transfer delta",
  "Captaincy model",
  "Post-hoc accuracy tracker",
  "Public endpoints only",
];

const FEATURES = [
  {
    icon: ShieldCheck,
    tag: "Rule #1",
    title: "Hard availability filter",
    body: "Injured, suspended, or ≤75% doubt? Excluded automatically before any weighting runs — never a recommendation that sits out.",
    badge: "Zero wasted transfers",
  },
  {
    icon: Crown,
    tag: "Gameweek pts",
    title: "Short-horizon armband",
    body: "Captaincy choice weighted heavily on recent form and single-fixture difficulty. A one-week decision gets one-week logic.",
    badge: "Form × difficulty",
  },
  {
    icon: ArrowRightLeft,
    tag: "Strategic",
    title: "Medium-horizon transfers",
    body: "Next-5 fixture runs and price efficiency dominate transfer moves. No knee-jerking on a one-week anomaly haul.",
    badge: "5-GW run analysis",
  },
  {
    icon: Bot,
    tag: "Intelligence",
    title: "Structured AI briefings",
    body: "Every brief gives a clear captain choice, bank-affordable transfer moves with exact £ deltas, and actionable dos & don'ts.",
    badge: "Gemini · Claude · rules",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Enter team ID",
    desc: "Provide the number from your public fantasy.premierleague.com profile URL.",
  },
  {
    step: "02",
    title: "Fetch public data",
    desc: "We pull bootstrap-static, fixtures, picks, transfers, and leagues via cached, rate-limited endpoints.",
  },
  {
    step: "03",
    title: "Squad normalisation",
    desc: "Your squad is parsed for current form, next-5 difficulty run, availability status, and bank budget.",
  },
  {
    step: "04",
    title: "Strategic AI brief",
    desc: "Captaincy choice, transfer moves with financial deltas, and strategic dos/don'ts generated instantly.",
  },
];

const STATS: Array<[string, string, string]> = [
  ["24h", "Ahead of deadline", "Scheduled brief"],
  ["0", "Passwords required", "Public ID only"],
  ["5-GW", "Planning horizon", "Anti-kneejerk"],
  ["100%", "Hard injury filter", "No benchwarmers"],
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-neon/10 blur-3xl" />
        <div className="grid-bg absolute inset-0" />
      </div>

      {/* Nav */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo size="md" />
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-[0.2em] text-mute md:flex">
            <a href="#features" className="transition-colors hover:text-neon">Features</a>
            <a href="#how" className="transition-colors hover:text-neon">How it works</a>
            <Link href="/account" className="transition-colors hover:text-neon">Account</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard/demo"
              className="flex items-center gap-1.5 rounded-full border hairline bg-card px-4 py-2 font-mono text-xs text-ink shadow-sm transition-all hover:border-neon hover:text-neon"
            >
              <Play className="h-3 w-3 fill-current text-neon" />
              <span className="hidden sm:inline">Live demo</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 pt-8 sm:px-8 sm:pt-16 lg:pt-20">
        <div className="rise flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/30 bg-neon/10 px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-neon">
            <Sparkles className="h-3.5 w-3.5" />
            Gameweek intelligence, automated
          </span>
          <span className="hidden font-mono text-xs text-faint sm:inline">· Free & open</span>
        </div>

        <div className="rise rise-1 mt-6 grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-[4.25rem] lg:leading-[1.08]">
              Win your FPL mini-league with <span className="text-gradient">data, not vibes.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-mute sm:text-lg">
              Paste your public FPL entry ID to get a structured weekly briefing: a ruthless injury check,
              a captaincy pick, affordable transfer moves, and a fixture swing radar.
            </p>

            <div className="mt-8">
              <EntryForm />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-mute">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-neon" /> Zero passwords stored
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-neon" /> 100% public FPL data
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-neon" /> Works on iOS & Android
              </span>
            </div>
          </div>

          {/* Hero visual: sample brief card */}
          <div className="rise rise-2 lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-neon/15 via-violet/15 to-glow/15 opacity-70 blur-xl" />

              <div className="panel relative overflow-hidden rounded-3xl p-6 sm:p-7">
                <div className="flex items-center justify-between border-b hairline pb-4">
                  <div className="flex items-center gap-2">
                    <span className="ping-dot h-2 w-2 rounded-full bg-neon" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-mute">
                      Sample brief preview
                    </span>
                  </div>
                  <span className="rounded-full border border-neon/30 bg-neon/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-neon">
                    GW27 live
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border hairline bg-surface p-4.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                      <Crown className="h-3.5 w-3.5" /> Captaincy armband
                    </span>
                    <span className="font-mono text-[10px] text-neon">94% confidence</span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <h4 className="font-display text-2xl font-bold text-ink">Haaland</h4>
                      <p className="font-mono text-xs text-mute">MCI · FWD · £15.2m</p>
                    </div>
                    <span className="rounded-lg bg-neon/15 px-2.5 py-1 font-mono text-xs font-bold text-neon">
                      Form 8.4
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-mute">
                    Strongest single-fixture difficulty in the XI (home). Expected goal involvement leads every
                    squad alternative.
                  </p>
                </div>

                <div className="mt-3.5 rounded-2xl border hairline bg-surface p-4">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-mute">
                    <span className="flex items-center gap-1 font-bold text-violet">
                      <ArrowRightLeft className="h-3.5 w-3.5" /> Top transfer move
                    </span>
                    <span className="font-bold text-neon">+£0.4m bank</span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-pulse/20 bg-pulse/10 px-3 py-2">
                      <span className="font-mono text-[9px] font-bold uppercase text-pulse">Out</span>
                      <p className="truncate font-display font-semibold text-ink">Gordon</p>
                      <p className="font-mono text-[9px] text-mute">NEW · Mid</p>
                    </div>
                    <div className="rounded-xl border border-neon/20 bg-neon/10 px-3 py-2">
                      <span className="font-mono text-[9px] font-bold uppercase text-neon">In</span>
                      <p className="truncate font-display font-semibold text-ink">Palmer</p>
                      <p className="font-mono text-[9px] text-mute">CHE · Mid</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-2">
                  <span className="font-mono text-[10px] text-mute">Next-5 fixture swing verified</span>
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

        <div className="rise rise-3 mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline bg-[var(--color-border)] sm:grid-cols-4">
          {STATS.map(([val, label, sub]) => (
            <div key={label} className="bg-card px-6 py-5">
              <p className="tabular font-mono text-2xl font-bold text-neon">{val}</p>
              <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-wider text-ink">{label}</p>
              <p className="font-mono text-[10px] text-mute">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee */}
      <div className="relative z-10 mt-16 border-y hairline bg-surface py-3.5">
        <div className="flex w-max animate-marquee gap-10">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-mute">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon">Analytical rigor</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Engineered advice, <span className="text-gradient">not guesswork.</span>
          </h2>
          <p className="mt-4 text-base text-mute">
            Every gameweek decision is scored across multiple time horizons, with a deterministic fallback
            when no AI provider is configured.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article key={f.title} className="panel panel-hover flex flex-col justify-between rounded-3xl p-6.5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon/25 bg-neon/10 text-neon">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border hairline bg-surface px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mute">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-mute">{f.body}</p>
              </div>
              <div className="mt-6 border-t hairline pt-4">
                <span className="font-mono text-[11px] font-semibold text-neon">{f.badge}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 border-t hairline bg-surface py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-glow">Under the hood</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              From public ID to strategic briefing.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.step} className="panel rounded-3xl p-6">
                <span className="font-mono text-4xl font-extrabold text-faint/40">{s.step}</span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-neon/20 bg-linear-to-r from-neon/[0.08] to-transparent p-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-ink">Ready to inspect your squad?</h3>
              <p className="mt-1 text-sm text-mute">Launch the live war room in one click — no account needed.</p>
            </div>
            <Link
              href="/dashboard/demo"
              className="flex items-center gap-2 rounded-xl bg-neon px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-void transition-all hover:brightness-110"
            >
              Tour demo squad <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t hairline bg-void py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Logo size="sm" />
              <p className="mt-3 max-w-md text-xs leading-relaxed text-mute">
                Unofficial Fantasy Premier League analytics dashboard. Not affiliated with the Premier League
                or FPL. All advice is informational.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                className="flex items-center gap-2 rounded-xl border hairline bg-surface px-4 py-2.5 font-mono text-xs text-mute transition-colors hover:border-neon hover:text-ink"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>
              <Link
                href="/account"
                className="rounded-xl border hairline bg-surface px-4 py-2.5 font-mono text-xs text-mute transition-colors hover:border-neon hover:text-ink"
              >
                Account
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t hairline pt-6 text-center font-mono text-[11px] text-faint">
            © {new Date().getFullYear()} FPL//AI · Unofficial Fantasy Premier League analytics
          </div>
        </div>
      </footer>
    </main>
  );
}
