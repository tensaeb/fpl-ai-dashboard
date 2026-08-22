"use client";

import type { DashboardTab } from "@/components/dashboard/tabs";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import type { DashboardBundle } from "@/lib/fpl/client";
import type { NormalizedData } from "@/lib/fpl/normalize";
import type { OutcomeRow } from "@/lib/report/outcomes";
import type { StoredReport } from "@/lib/report/service";
import { useState } from "react";

interface DashboardClientProps {
  bundle: DashboardBundle;
  norm: NormalizedData;
  report: StoredReport | null;
  history: StoredReport[];
  outcomes: OutcomeRow[];
  meta: Record<number, { team: string; pos: string; price: number }>;
  kpiItems: Array<{ label: string; value: string; sub?: string; tone?: "neon" | "pulse" | "gold" | "ink" }>;
}

export function DashboardClient({
  bundle,
  norm,
  report,
  history,
  outcomes,
  meta,
  kpiItems,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");

  return (
    <>
      <MobileNav activeTab={activeTab} onChange={setActiveTab} />
      <DashboardView
        bundle={bundle}
        norm={norm}
        report={report}
        history={history}
        outcomes={outcomes}
        meta={meta}
        kpiItems={kpiItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </>
  );
}
