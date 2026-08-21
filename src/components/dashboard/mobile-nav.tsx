"use client";

import {
  Activity,
  AlignRight,
  Archive,
  ArrowRightLeft,
  Award,
  Crown,
  LayoutGrid,
  Sparkles,
  Swords,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#report", label: "Strategic AI Brief", icon: Sparkles, desc: "Captaincy & transfer advice" },
  { href: "#squad", label: "Squad & Lineup", icon: Activity, desc: "Formation pitch + medical bay" },
  { href: "#fixtures", label: "Fixture Radar", icon: LayoutGrid, desc: "Next 4 GW difficulty grid" },
  { href: "#leagues", label: "Mini-Leagues", icon: Swords, desc: "Rival manager standings" },
  { href: "#history", label: "Archive & Accuracy", icon: Archive, desc: "Historical evaluation record" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 shadow-sm transition-colors hover:border-emerald-500 lg:hidden"
      >
        <AlignRight className="h-4 w-4" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Slide-in drawer */}
      <nav
        aria-label="Mobile navigation"
        className={`fixed right-0 top-0 z-50 flex h-full w-80 flex-col bg-white dark:bg-[#0c101c] safe-top safe-bottom border-l border-slate-200 dark:border-white/10 shadow-2xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 px-6 py-4">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            FPL//AI Navigation
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Links */}
        <ul className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          {NAV_LINKS.map(({ href, label, icon: Icon, desc }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors group-hover:bg-emerald-500/15 group-hover:text-emerald-500">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {label}
                  </p>
                  <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-white/5 px-6 py-4 space-y-3">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-emerald-600"
          >
            My Account
          </Link>
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Gameweek Intelligence
          </p>
        </div>
      </nav>
    </>
  );
}
