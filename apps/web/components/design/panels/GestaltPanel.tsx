import type { GestaltResult } from "@uxbeacon/shared-types";

function PrincipleBar({ label, description, value }: { label: string; description: string; value: number }) {
  const color = value >= 75 ? "#22c55e" : value >= 55 ? "#84cc16" : value >= 35 ? "#eab308" : "#ef4444";
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-[#333333]">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        <span className="text-lg font-extrabold ml-4 shrink-0" style={{ color }}>{value}</span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function GestaltPanel({ data }: { data: GestaltResult }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Gestalt Principles</h3>
      <p className="text-xs text-gray-400">Scores derived from OCR text clustering and spatial analysis.</p>

      <div className="space-y-3">
        <PrincipleBar label="Proximity" description="Related elements are visually grouped" value={data.proximity} />
        <PrincipleBar label="Similarity" description="Consistent visual treatment for same-type elements" value={data.similarity} />
        <PrincipleBar label="Continuity" description="Elements align along consistent reading axes" value={data.continuity} />
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
