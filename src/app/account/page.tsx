import { AccountClient, SignInCard } from "@/components/account/client";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { listSavedEntries } from "@/lib/account";
import { getSession } from "@/lib/auth";
import { mailerConfigured } from "@/lib/notify";

export const dynamic = "force-dynamic";

export const metadata = { title: "Account — FPL//AI" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSession();
  const entries = session ? await listSavedEntries(session.accountId) : [];

  return (
    <main className="relative flex min-h-screen flex-col transition-colors duration-200">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
      <header className="relative z-10 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl safe-top">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Account</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-14">
        {session ? (
          <AccountClient email={session.email} entries={entries} mailerReady={mailerConfigured()} />
        ) : (
          <div className="flex justify-center">
            <SignInCard error={error} />
          </div>
        )}
      </div>

      <footer className="relative z-10 border-t hairline">
        <p className="mx-auto max-w-3xl px-5 py-6 font-mono text-[10px] leading-relaxed tracking-wider text-faint">
          Accounts here are app-level only. Your FPL login is never requested — we store your email, your
          followed public entry IDs, and nothing else. Not affiliated with the Premier League or FPL.
        </p>
      </footer>
    </main>
  );
}
