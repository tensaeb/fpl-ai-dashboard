"use client";

import {
  Activity,
  ArrowRightLeft,
  Award,
  Crown,
  History,
  LayoutGrid,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export type DashboardTab =
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
  { id: "all", label: "Executive View", icon: LayoutGrid },
  { id: "brief", label: "AI Brief", icon: Sparkles },
  { id: "pitch", label: "The Pitch", icon: Activity },
  { id: "simulator", label: "Transfer Lab", icon: ArrowRightLeft },
  { id: "captain", label: "Captaincy", icon: Crown },
  { id: "differentials", label: "Differentials", icon: Zap },
  { id: "chips", label: "Chip Advisor", icon: Award },
  { id: "fixtures", label: "Fixtures", icon: History },
  { id: "leagues", label: "Mini-Leagues", icon: Swords },
  { id: "history", label: "Archive & Accuracy", icon: Trophy },
];

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-white/5 py-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 font-display text-xs font-semibold transition-all ${
              isActive
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
