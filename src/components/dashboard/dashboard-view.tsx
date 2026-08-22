"use client";

import {
  AccuracyBoard,
  FixturesBoard,
  FormBoard,
  HistoryBoard,
  KpiRow,
  LeaguesBoard,
  MedicalBay,
} from "@/components/dashboard/boards";
import { CaptainMatrix } from "@/components/dashboard/captain-matrix";
import { ChipStrategyAdvisor } from "@/components/dashboard/chip-advisor";
import { SectionHeading } from "@/components/dashboard/chrome";
import { DifferentialRadar } from "@/components/dashboard/differentials";
import { Pitch } from "@/components/dashboard/pitch";
import { PriceChangeBoard } from "@/components/dashboard/price-change";
import { ReportSection, type PlayerMeta } from "@/components/dashboard/report";
import { DashboardTabs, type DashboardTab } from "@/components/dashboard/tabs";
import { TransferSimulator } from "@/components/dashboard/transfer-simulator";
import { ActionCenter } from "@/components/dashboard/action-center";
import type { DashboardBundle } from "@/lib/fpl/client";
import { isFlagged, type NormalizedData } from "@/lib/fpl/normalize";
import type { OutcomeRow } from "@/lib/report/outcomes";
import type { StoredReport } from "@/lib/report/service";

interface DashboardViewProps {
  bundle: DashboardBundle;
  norm: NormalizedData;
  report: StoredReport | null;
  history: StoredReport[];
  outcomes: OutcomeRow[];
  meta: Record<number, PlayerMeta>;
  kpiItems: Array<{ label: string; value: string; sub?: string; tone?: "neon" | "pulse" | "gold" | "ink" }>;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export function DashboardView({
  bundle,
  norm,
  report,
  history,
  outcomes,
  meta,
  kpiItems,
  activeTab,
  onTabChange,
}: DashboardViewProps) {

  const flagged = norm.squad.filter(isFlagged);
  const hot = norm.squad
    .filter((p) => !isFlagged(p))
    .sort((a, b) => b.form - a.form)
    .slice(0, 3);
  const cold = norm.squad
    .filter((p) => !isFlagged(p))
    .sort((a, b) => a.form - b.form)
    .slice(0, 3);

  // Captain pick ID — from report if available
  const captainPickId = report?.payload.captain_suggestion.playerId ?? undefined;

  return (
    <div className="space-y-6">
      <DashboardTabs activeTab={activeTab} onChange={onTabChange} />

      {/* ═══════════════════════════════════════════════════
          DASHBOARD — main overview
      ════════════════════════════════════════════════════ */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-rise">

          {/* 1. Gameweek action cards */}
          <ActionCenter squad={norm.squad} report={report} />

          {/* 2. KPI strip */}
          <KpiRow items={kpiItems} />

          {/* 3. Starting XI */}
          <section id="squad">
            <SectionHeading title="Starting XI" kicker="Formation & Availability" />
            <div className="mt-4">
              <Pitch squad={norm.squad} captainPickId={captainPickId} />
            </div>
          </section>

          {/* 4. AI Brief + Fixtures side-by-side on desktop */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section id="report">
              <SectionHeading title="Gameweek Brief" kicker="AI Intelligence" />
              <div className="mt-4">
                <ReportSection
                  report={report}
                  entryId={bundle.entryId}
                  demo={bundle.mode === "demo"}
                  meta={meta}
                />
              </div>
            </section>

            <section id="fixtures">
              <SectionHeading title="Fixture Heatmap" kicker="Next 5 Gameweeks" />
              <div className="mt-4">
                <FixturesBoard
                  teams={norm.teams}
                  fixturesByTeam={norm.fixturesByTeam}
                  ownedTeams={[...new Set(norm.squad.map((p) => p.teamId))]}
                  currentGw={norm.currentEventId}
                />
              </div>
            </section>
          </div>

          {/* 5. Differentials */}
          <section>
            <SectionHeading title="Differentials" kicker="Low-Owned, High-Form" />
            <div className="mt-4">
              <DifferentialRadar pool={norm.pool} squad={norm.squad} />
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TEAM — squad, medical, form
      ════════════════════════════════════════════════════ */}
      {activeTab === "team" && (
        <div className="space-y-8 animate-rise">
          <section>
            <SectionHeading title="Starting XI" kicker="Formation & Availability" />
            <div className="mt-4">
              <Pitch squad={norm.squad} captainPickId={captainPickId} />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <SectionHeading title="Injury Watch" kicker="Availability" />
              <div className="mt-4">
                <MedicalBay flagged={flagged} />
              </div>
            </section>
            <section>
              <SectionHeading title="Form Watch" kicker="Trending Players" />
              <div className="mt-4">
                <FormBoard hot={hot} cold={cold} />
              </div>
            </section>
          </div>

          <section>
            <SectionHeading title="Captaincy Comparison" kicker="Armband Decision" />
            <div className="mt-4">
              <CaptainMatrix squad={norm.squad} />
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TRANSFERS — simulator + chip advisor
      ════════════════════════════════════════════════════ */}
      {activeTab === "transfers" && (
        <div className="space-y-8 animate-rise">
          <section>
            <SectionHeading title="Transfer Simulator" kicker="Budget & Move Planner" />
            <div className="mt-4">
              <TransferSimulator
                squad={norm.squad}
                pool={norm.pool}
                bank={norm.bank}
                freeTransfers={norm.freeTransfers}
              />
            </div>
          </section>

          <section>
            <SectionHeading title="Chip Strategy" kicker="When to use your chips" />
            <div className="mt-4">
              <ChipStrategyAdvisor
                squad={norm.squad}
                currentGw={norm.currentEventId}
                bank={norm.bank}
              />
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          INSIGHTS — fixtures, differentials, history
      ════════════════════════════════════════════════════ */}
      {activeTab === "insights" && (
        <div className="space-y-8 animate-rise">
          <section>
            <SectionHeading title="Fixture Heatmap" kicker="Next 5 Gameweeks" />
            <div className="mt-4">
              <FixturesBoard
                teams={norm.teams}
                fixturesByTeam={norm.fixturesByTeam}
                ownedTeams={[...new Set(norm.squad.map((p) => p.teamId))]}
                currentGw={norm.currentEventId}
              />
            </div>
          </section>

          <section>
            <SectionHeading title="Differentials" kicker="Low-Owned, High-Form" />
            <div className="mt-4">
              <DifferentialRadar pool={norm.pool} squad={norm.squad} />
            </div>
          </section>

          <section>
            <PriceChangeBoard pool={norm.pool} squad={norm.squad} currentGw={norm.currentEventId} />
          </section>

          <section id="leagues">
            <SectionHeading title="Mini-Leagues" kicker="Rival Standings" />
            <div className="mt-4">
              <LeaguesBoard leagues={bundle.leagues} myEntry={bundle.entryId} />
            </div>
          </section>

          <section id="history">
            <SectionHeading title="AI Accuracy" kicker="Historical Performance" />
            <div className="mt-4 space-y-4">
              <AccuracyBoard outcomes={outcomes} />
              <HistoryBoard history={history} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
