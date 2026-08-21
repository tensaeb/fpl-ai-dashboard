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
import { ReportSection, type PlayerMeta } from "@/components/dashboard/report";
import { DashboardTabs, type DashboardTab } from "@/components/dashboard/tabs";
import { TransferSimulator } from "@/components/dashboard/transfer-simulator";
import type { DashboardBundle } from "@/lib/fpl/client";
import { isFlagged, type NormalizedData } from "@/lib/fpl/normalize";
import type { OutcomeRow } from "@/lib/report/outcomes";
import type { StoredReport } from "@/lib/report/service";
import { useState } from "react";

interface DashboardViewProps {
  bundle: DashboardBundle;
  norm: NormalizedData;
  report: StoredReport | null;
  history: StoredReport[];
  outcomes: OutcomeRow[];
  meta: Record<number, PlayerMeta>;
  kpiItems: Array<{ label: string; value: string; sub?: string; tone?: "neon" | "pulse" | "gold" | "ink" }>;
}

export function DashboardView({
  bundle,
  norm,
  report,
  history,
  outcomes,
  meta,
  kpiItems,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("all");

  const flagged = norm.squad.filter(isFlagged);
  const hot = norm.squad
    .filter((p) => !isFlagged(p))
    .sort((a, b) => b.form - a.form)
    .slice(0, 3);
  const cold = norm.squad
    .filter((p) => !isFlagged(p))
    .sort((a, b) => a.form - b.form)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Interactive Feature Tabs */}
      <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* KPI Row (Always visible for fast reference) */}
      <KpiRow items={kpiItems} />

      {/* VIEW: ALL / EXECUTIVE SUMMARY */}
      {activeTab === "all" && (
        <div className="space-y-16">
          {/* Section 01: AI Brief */}
          <section id="report" className="scroll-mt-24 space-y-4">
            <SectionHeading index="01" kicker="AI Gameweek Briefing" title="Strategic Advice" />
            <ReportSection report={report} entryId={bundle.entryId} demo={bundle.mode === "demo"} meta={meta} />
          </section>

          {/* Section 02: Squad Pitch & Health */}
          <section id="squad" className="scroll-mt-24 space-y-4">
            <SectionHeading index="02" kicker="Formation &amp; Availability" title="Starting Lineup &amp; Pitch" />
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 xl:col-span-8">
                <Pitch squad={norm.squad} />
              </div>
              <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
                <MedicalBay flagged={flagged} />
                <FormBoard hot={hot} cold={cold} />
              </div>
            </div>
          </section>

          {/* Section 03: Transfer Simulator */}
          <section className="space-y-4">
            <SectionHeading index="03" kicker="Transfer Lab" title="Budget &amp; Move Simulator" />
            <TransferSimulator
              squad={norm.squad}
              pool={norm.pool}
              bank={norm.bank}
              freeTransfers={norm.freeTransfers}
            />
          </section>

          {/* Section 04: Captaincy Matrix & Differentials */}
          <section className="space-y-8">
            <CaptainMatrix squad={norm.squad} />
            <DifferentialRadar pool={norm.pool} />
            <ChipStrategyAdvisor squad={norm.squad} currentGw={norm.currentEventId} bank={norm.bank} />
          </section>

          {/* Section 05: Fixtures */}
          <section id="fixtures" className="scroll-mt-24 space-y-4">
            <SectionHeading index="04" kicker="Difficulty Radar" title="Fixture Swing Board" />
            <FixturesBoard
              teams={norm.teams}
              fixturesByTeam={norm.fixturesByTeam}
              ownedTeams={[...new Set(norm.squad.map((p) => p.teamId))]}
              currentGw={norm.currentEventId}
            />
          </section>

          {/* Section 06: Leagues */}
          <section id="leagues" className="scroll-mt-24 space-y-4">
            <SectionHeading index="05" kicker="Mini-Leagues" title="Rival Standings" />
            <LeaguesBoard leagues={bundle.leagues} myEntry={bundle.entryId} />
          </section>

          {/* Section 07: History & Accuracy */}
          <section id="history" className="scroll-mt-24 space-y-6">
            <SectionHeading index="06" kicker="Historical Performance" title="Brief Archive &amp; Accuracy" />
            <AccuracyBoard outcomes={outcomes} />
            <HistoryBoard history={history} />
          </section>
        </div>
      )}

      {/* VIEW: STRATEGIC AI BRIEF */}
      {activeTab === "brief" && (
        <div className="space-y-6 animate-rise">
          <SectionHeading index="01" kicker="AI Gameweek Briefing" title="Strategic Advice" />
          <ReportSection report={report} entryId={bundle.entryId} demo={bundle.mode === "demo"} meta={meta} />
        </div>
      )}

      {/* VIEW: THE PITCH */}
      {activeTab === "pitch" && (
        <div className="space-y-6 animate-rise">
          <SectionHeading index="02" kicker="Formation &amp; Availability" title="Starting Lineup &amp; Pitch" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 xl:col-span-8">
              <Pitch squad={norm.squad} />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
              <MedicalBay flagged={flagged} />
              <FormBoard hot={hot} cold={cold} />
            </div>
          </div>
        </div>
      )}

      {/* VIEW: TRANSFER LAB SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="space-y-6 animate-rise">
          <TransferSimulator
            squad={norm.squad}
            pool={norm.pool}
            bank={norm.bank}
            freeTransfers={norm.freeTransfers}
          />
        </div>
      )}

      {/* VIEW: CAPTAINCY MATRIX */}
      {activeTab === "captain" && (
        <div className="space-y-6 animate-rise">
          <CaptainMatrix squad={norm.squad} />
        </div>
      )}

      {/* VIEW: DIFFERENTIALS */}
      {activeTab === "differentials" && (
        <div className="space-y-6 animate-rise">
          <DifferentialRadar pool={norm.pool} />
        </div>
      )}

      {/* VIEW: CHIP ADVISOR */}
      {activeTab === "chips" && (
        <div className="space-y-6 animate-rise">
          <ChipStrategyAdvisor squad={norm.squad} currentGw={norm.currentEventId} bank={norm.bank} />
        </div>
      )}

      {/* VIEW: FIXTURES */}
      {activeTab === "fixtures" && (
        <div className="space-y-6 animate-rise">
          <SectionHeading index="04" kicker="Difficulty Radar" title="Fixture Swing Board" />
          <FixturesBoard
            teams={norm.teams}
            fixturesByTeam={norm.fixturesByTeam}
            ownedTeams={[...new Set(norm.squad.map((p) => p.teamId))]}
            currentGw={norm.currentEventId}
          />
        </div>
      )}

      {/* VIEW: RIVALS */}
      {activeTab === "leagues" && (
        <div className="space-y-6 animate-rise">
          <SectionHeading index="05" kicker="Mini-Leagues" title="Rival Standings" />
          <LeaguesBoard leagues={bundle.leagues} myEntry={bundle.entryId} />
        </div>
      )}

      {/* VIEW: ARCHIVE & ACCURACY */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-rise">
          <SectionHeading index="06" kicker="Historical Performance" title="Brief Archive &amp; Accuracy" />
          <AccuracyBoard outcomes={outcomes} />
          <HistoryBoard history={history} />
        </div>
      )}
    </div>
  );
}
