"use client";

import { ArrowRightLeft, BarChart2, LayoutDashboard, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { type DashboardTab } from "./tabs";

interface MobileNavProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const NAV_ITEMS: Array<{ id: DashboardTab; label: string; icon: React.ElementType }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "team",      label: "Team",      icon: Users },
  { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { id: "insights",  label: "Insights",  icon: BarChart2 },
];

export function MobileNav({ activeTab, onChange }: MobileNavProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      className={[
        "fixed bottom-0 inset-x-0 z-50 lg:hidden",
        "border-t border-slate-200 dark:border-white/8",
        "bg-white/95 dark:bg-[#0c101c]/95 backdrop-blur-xl",
        "safe-bottom",
      ].join(" ")}
    >
      <ul className="flex items-stretch">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onChange(id)}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col items-center justify-center gap-1 py-2.5 px-1",
                  "font-mono text-[10px] font-semibold uppercase tracking-wider",
                  "transition-colors",
                  active
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
                {active && <span className="h-0.5 w-4 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-0.5" />}
              </button>
            </li>
          );
        })}

        {/* Account link — 5th slot */}
        <li className="flex-1">
          <Link
            href="/account"
            className={[
              "flex flex-col items-center justify-center gap-1 py-2.5 px-1",
              "font-mono text-[10px] font-semibold uppercase tracking-wider",
              "text-slate-500 dark:text-slate-400",
              "hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors",
            ].join(" ")}
          >
            <UserRound className="h-5 w-5" aria-hidden />
            <span>Account</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
