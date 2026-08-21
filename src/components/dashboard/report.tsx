import { fmtNum } from "@/lib/format";
import type { StoredReport } from "@/lib/report/service";
import {
  ArrowRightLeft,
  BadgeCheck,
  CheckCircle2,
  CircleSlash2,
  Cpu,
  Crown,
  Sparkles,
  Swords,
  XCircle,
  Zap,
} from "lucide-react";
import { ExportBrief } from "./export-brief";
import { RegenerateButton } from "./regenerate";

export interface PlayerMeta {
  team: string;
  pos: string;
  price: number; // £0.1m
}

const CONFIDENCE_STYLE: Record<string, { dot: string; label: string; text: string }> = {
  high: { dot: "bg-[#00f59b]", label: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", text: "High" },
  medium: { dot: "bg-[#fbbf24]", label: "border-amber-500/30 bg-amber-500/10 text-amber-300", text: "Medium" },
  low: { dot: "bg-[#f43f5e]", label: "border-rose-500/30 bg-rose-500/10 text-rose-300", text: "Low" },
};

function MetaLine({ name, id, meta }: { name: string; id?: number; meta: Record<number, PlayerMeta> }) {
  const m = id != null ? meta[id] : undefined;
  return (
    <div className="min-w-0">
      <p className="truncate font-display text-sm font-bold text-white">{name}</p>
      {m && (
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
          {m.team} · {m.pos} · £{fmtNum(m.price / 10)}m
        </p>
      )}
    </div>
  );
}

export function ReportSection({
  report,
  entryId,
  demo,
  meta,
}: {
  report: StoredReport | null;
  entryId: number;
  demo: boolean;
  meta: Record<number, PlayerMeta>;
}) {
  if (!report) {
    return (
      <div className="panel rounded-3xl p-10 text-center">
        <p className="font-mono text-sm text-slate-400">Report unavailable for this gameweek.</p>
        <div className="mt-5 flex justify-center">
          <RegenerateButton entryId={entryId} demo={demo} />
        </div>
      </div>
    );
  }

  const r = report.payload;
  const conf = CONFIDENCE_STYLE[r.confidence] ?? CONFIDENCE_STYLE.low;
  const cap = r.captain_suggestion;
  const vice = r.vice_captain_suggestion;

  return (
    <div className="space-y-5">
      {/* Control / Metadata Strip */}
      <div className="panel flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${conf.label}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
            {conf.text} Confidence
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-slate-300">
            <Cpu className="h-3 w-3 text-slate-400" />
            {report.engine}
          </span>
          <span className="hidden sm:inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] tracking-wider text-slate-400">
            {new Date(report.createdAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <ExportBrief report={report} />
          <RegenerateButton entryId={entryId} demo={demo} />
        </div>
      </div>

      {/* Strategic Headline */}
      {r.headline && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3.5">
          <p className="font-display text-lg font-bold text-white sm:text-xl">
            &ldquo;{r.headline}&rdquo;
          </p>
        </div>
      )}

      {/* League Intel Note if available */}
      {r.league_note && (
        <div className="panel flex items-start gap-3.5 rounded-2xl border-violet/30 bg-violet/[0.04] p-4.5">
          <Swords className="h-5 w-5 shrink-0 text-violet mt-0.5" />
          <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
            <strong className="font-mono text-[10px] font-bold uppercase tracking-widest text-violet block mb-1">
              Mini-League Intel
            </strong>
            {r.league_note}
          </p>
        </div>
      )}

      {/* Captaincy Decisions Row */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Main Captain Card */}
        <article className="panel panel-hover relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:col-span-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-300">
              <Crown className="h-4 w-4" /> Captaincy Armband
            </span>
            <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-300 border border-amber-400/20">
              Short-Horizon
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h3 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {cap.player}
              </h3>
              {cap.playerId != null && meta[cap.playerId] && (
                <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-slate-400">
                  {meta[cap.playerId].team} · {meta[cap.playerId].pos} · £{fmtNum(meta[cap.playerId].price / 10)}m
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-neon/15 px-3 py-1.5 font-mono text-xs font-bold text-neon border border-neon/30">
              <Sparkles className="h-3.5 w-3.5" /> Optimal Pick
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-[15px] border-t border-white/5 pt-4">
            {cap.reasoning}
          </p>
        </article>

        {/* Vice-Captain & Filter Note */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          <article className="panel panel-hover flex-1 rounded-3xl p-6">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-glow">
              Vice-Captain
            </span>
            <h4 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {vice.player}
            </h4>
            {vice.playerId != null && meta[vice.playerId] && (
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-slate-400">
                {meta[vice.playerId].team} · {meta[vice.playerId].pos} · £{fmtNum(meta[vice.playerId].price / 10)}m
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-slate-300">{vice.reasoning}</p>
          </article>

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
            <BadgeCheck className="h-5 w-5 shrink-0 text-neon" />
            <p className="font-mono text-[11px] leading-relaxed text-slate-300">
              <span className="font-bold text-neon">Hard Filter Active.</span> Injured, suspended, and ≤75% doubtful assets were excluded prior to scoring.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Transfer Moves */}
      <div>
        <h4 className="mb-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
          Transfer Strategy
        </h4>

        {r.transfer_suggestions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {r.transfer_suggestions.map((t, i) => (
              <article
                key={`transfer-move-${i}-${t.out}-${t.in}`}
                className="panel panel-hover flex flex-col justify-between rounded-3xl p-5"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-violet">
                      <ArrowRightLeft className="h-3.5 w-3.5" /> Move {i + 1}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold tabular ${
                        t.cost_delta > 0
                          ? "bg-amber-400/15 text-amber-300 border border-amber-400/20"
                          : "bg-emerald-400/15 text-emerald-300 border border-emerald-400/20"
                      }`}
                    >
                      {t.cost_delta > 0 ? `+£${fmtNum(t.cost_delta)}m` : `−£${fmtNum(Math.abs(t.cost_delta))}m`}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5">
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-pulse">
                        OUT
                      </span>
                      <MetaLine name={t.out} id={t.outId} meta={meta} />
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5">
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-neon">
                        IN
                      </span>
                      <MetaLine name={t.in} id={t.inId} meta={meta} />
                    </div>
                  </div>

                  <p className="mt-3.5 text-xs leading-relaxed text-slate-300">{t.reasoning}</p>
                </div>

                <div className="mt-4 border-t border-white/5 pt-2 text-right">
                  <span className="font-mono text-[10px] text-slate-400">Budget verified</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel flex items-center gap-4 rounded-3xl border-emerald-500/25 p-6">
            <CheckCircle2 className="h-7 w-7 shrink-0 text-neon" />
            <div>
              <p className="font-display text-base font-bold text-white">Hold free transfer recommended.</p>
              <p className="mt-0.5 text-xs text-slate-400">
                No transfer candidates provide sufficient expected return over cost this gameweek. Bank the roll for next week.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Do & Don't Guidelines */}
      <div className="grid gap-5 md:grid-cols-2">
        <article className="panel rounded-3xl p-6">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#00f59b]">
            <CheckCircle2 className="h-4 w-4" /> Recommended Moves (Do)
          </div>
          <ul className="mt-4 space-y-3">
            {r.dos.map((d, i) => (
              <li key={`do-item-${i}`} className="flex items-start gap-3 text-xs leading-relaxed text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00f59b]" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel rounded-3xl p-6">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-rose-400">
            <XCircle className="h-4 w-4" /> Pitfalls To Avoid (Don&apos;t)
          </div>
          <ul className="mt-4 space-y-3">
            {r.donts.map((d, i) => (
              <li key={`dont-item-${i}`} className="flex items-start gap-3 text-xs leading-relaxed text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
