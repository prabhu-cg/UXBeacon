import type { SpacingResult } from "@uxbeacon/shared-types";

function Gauge({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? "#22c55e" : value >= 55 ? "#84cc16" : value >= 35 ? "#eab308" : "#ef4444";
  return (
    <div className="rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-3xl font-extrabold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">out of 100</p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function SpacingPanel({ data }: { data: SpacingResult }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Spacing & Alignment</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <Gauge label="Gap Consistency" value={data.gapConsistency} />
        <Gauge label="Alignment Score" value={data.alignmentScore} />
      </div>
      {data.findings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Findings</h4>
          {data.findings.map((f, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-[#FFF7E3] px-4 py-3">
              <p className="text-sm text-[#333333] leading-relaxed">{f}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
