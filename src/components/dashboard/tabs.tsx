"use client";

import {
  ArrowRightLeft,
  BarChart2,
  LayoutDashboard,
  Users,
} from "lucide-react";

export type DashboardTab =
  | "dashboard"
  | "team"
  | "transfers"
  | "insights";

/**
 * Legacy tab IDs used internally by view sections.
 * Keeping these as a union so any existing code that checks them still compiles.
 */
export type LegacyTab =
  | "all"
  | "brief"
  | "pitch"
  | "simulator"
  | "captain"
  | "differentials"
  | "chips"
  | "fixtures"
  | "leagues"
  | "history";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const TABS: Array<{ id: DashboardTab; label: string; icon: React.ElementType }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "team",      label: "Team",      icon: Users },
  { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { id: "insights",  label: "Insights",  icon: BarChart2 },
];

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  return (
    <nav
      aria-label="Dashboard sections"
      className="hidden lg:flex items-center gap-1 border-b border-slate-200 dark:border-white/5"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex items-center gap-2 px-4 py-2.5 font-display text-sm font-semibold",
              "border-b-2 -mb-px transition-colors",
              isActive
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
