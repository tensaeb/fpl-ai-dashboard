import { fmtNum } from "@/lib/format";
import { isFlagged, type NormalizedPlayer } from "@/lib/fpl/normalize";
import { teamColor } from "@/lib/teams";
import { AlertCircle, AlertTriangle } from "lucide-react";

/**
 * Football-pitch squad view. Starters are slotted into formation rows on an
 * SVG pitch; the bench sits underneath. Flagged players pulse amber/red.
 */

function PlayerCard({ p, small = false }: { p: NormalizedPlayer; small?: boolean }) {
  const flagged = isFlagged(p);
  const next = p.nextFixtures[0];

  return (
    <div
      title={`${p.name} — ${p.teamShort} ${p.position} · Form ${fmtNum(p.form)} · £${fmtNum(p.price / 10)}m${
        p.news ? ` · ${p.news}` : ""
      }`}
      className={`group relative flex ${
        small ? "w-[80px] sm:w-[94px]" : "w-[78px] sm:w-[104px] lg:w-[110px]"
      } flex-col items-center rounded-2xl border p-2 text-center backdrop-blur-md transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl ${
        flagged
          ? "border-rose-500/50 bg-[#160b14]/90 shadow-rose-950/30"
          : "border-white/15 bg-[#0a101d]/85 hover:border-neon/60 shadow-black/40"
      }`}
    >
      {/* Captain / Vice Captain Badge */}
      {(p.isCaptain || p.isViceCaptain) && (
        <span
          className={`absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-extrabold shadow-md ${
            p.isCaptain
              ? "bg-amber-400 text-black ring-2 ring-[#07090e]"
              : "bg-sky-400 text-black ring-2 ring-[#07090e]"
          }`}
        >
          {p.isCaptain ? "C" : "V"}
        </span>
      )}

      {/* Flag / Injury Alert Badge */}
      {flagged && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-md ring-2 ring-[#07090e]">
          <AlertCircle className="h-3 w-3" />
        </span>
      )}

      {/* Team Color Ribbon */}
      <span
        className="h-1 w-7 rounded-full shadow-xs"
        style={{ background: teamColor(p.teamShort) }}
      />

      {/* Player Name */}
      <span
        className={`mt-1.5 w-full truncate font-display ${
          small ? "text-[11px]" : "text-xs sm:text-sm"
        } font-bold leading-tight text-white group-hover:text-neon transition-colors`}
      >
        {p.name}
      </span>

      {/* Team & Form */}
      <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
        {p.teamShort} · {fmtNum(p.form)}
      </span>

      {/* Next Fixture Pill */}
      {next && !small && (
        <span className="mt-1 rounded-md border border-white/5 bg-white/5 px-1.5 py-0.5 font-mono text-[8.5px] font-semibold tracking-wider text-slate-300">
          {next.vs} {next.home ? "(H)" : "(A)"}
        </span>
      )}
    </div>
  );
}

export function Pitch({ squad }: { squad: NormalizedPlayer[] }) {
  const starters = squad.filter((p) => p.isStarter);
  const bench = squad.filter((p) => !p.isStarter);
  const rows: NormalizedPlayer[][] = [1, 2, 3, 4].map((et) =>
    starters.filter((p) => p.elementType === et),
  );

  return (
    <div className="panel relative overflow-hidden rounded-3xl p-3.5 sm:p-6">
      <div className="relative">
        <svg viewBox="0 0 640 860" className="w-full rounded-2xl" aria-hidden>
          <defs>
            <linearGradient id="grass-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a2318" />
              <stop offset="50%" stopColor="#081e14" />
              <stop offset="100%" stopColor="#06170f" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="640" height="860" rx="20" fill="url(#grass-bg)" />

          {/* Grass mowed stripes */}
          {Array.from({ length: 10 }).map((_, i) => (
            <rect
              key={`stripe-${i}`}
              x="0"
              y={i * 86}
              width="640"
              height="43"
              fill="#ffffff"
              opacity={i % 2 ? 0.02 : 0}
            />
          ))}

          {/* Field Lines */}
          <g stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2" fill="none">
            <rect x="30" y="30" width="580" height="800" rx="6" />
            <line x1="30" y1="430" x2="610" y2="430" />
            <circle cx="320" cy="430" r="80" />
            <circle cx="320" cy="430" r="4" fill="#ffffff" fillOpacity="0.25" />

            {/* Top Penalty Area */}
            <rect x="160" y="30" width="320" height="130" />
            <rect x="240" y="30" width="160" height="50" />
            <circle cx="320" cy="130" r="3.5" fill="#ffffff" fillOpacity="0.25" />
            <path d="M 250 210 A 85 85 0 0 0 390 210" />

            {/* Bottom Penalty Area */}
            <rect x="160" y="700" width="320" height="130" />
            <rect x="240" y="780" width="160" height="50" />
            <circle cx="320" cy="700" r="3.5" fill="#ffffff" fillOpacity="0.25" />
            <path d="M 250 650 A 85 85 0 0 1 390 650" />
          </g>
        </svg>

        {/* Formation rows overlay */}
        <div className="absolute inset-0 flex flex-col justify-between py-[5%]">
          {[3, 2, 1, 0].map((row) => (
            <div
              key={`formation-row-${row}`}
              className="flex items-center justify-center gap-2 px-[5%] sm:gap-3.5"
            >
              {rows[row].map((p) => (
                <PlayerCard key={`player-card-${p.id}`} p={p} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bench Row */}
      <div className="mt-5 border-t border-white/5 pt-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Substitutes &amp; Bench
          </span>
          <span className="font-mono text-[10px] text-slate-400">Order left to right</span>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {bench.map((p) => (
            <div key={`bench-wrapper-${p.id}`} className="flex justify-center">
              <PlayerCard p={p} small />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
