import type { VisualHierarchyResult } from "@uxbeacon/shared-types";

function ScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = pct >= 75 ? "#22c55e" : pct >= 55 ? "#84cc16" : pct >= 35 ? "#eab308" : "#ef4444";
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-[#333333]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function HierarchyPanel({ data }: { data: VisualHierarchyResult }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Visual Hierarchy</h3>

      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <ScoreBar label="Heading Prominence" value={data.headingProminence} />
        <ScoreBar label="CTA Prominence" value={data.ctaProminence} />
        <div className="pt-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dominant Elements</p>
          <p className="text-2xl font-extrabold text-[#333333]">{data.dominantElementCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">focal point{data.dominantElementCount !== 1 ? "s" : ""} detected</p>
        </div>
        <div className="rounded-lg bg-[#FFF7E3] px-4 py-3">
          <p className="text-xs font-semibold text-[#EE661D] mb-1">Attention Flow</p>
          <p className="text-sm text-[#333333]">{data.attentionFlow}</p>
        </div>
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
