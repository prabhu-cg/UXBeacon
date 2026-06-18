import type { DensityResult } from "@uxbeacon/shared-types";

export function DensityPanel({ data }: { data: DensityResult }) {
  const wsColor = data.whiteSpaceRatio >= 35 && data.whiteSpaceRatio <= 65 ? "#22c55e" : "#eab308";
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Layout Density</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Whitespace Ratio</p>
          <p className="text-3xl font-extrabold" style={{ color: wsColor }}>{data.whiteSpaceRatio}<span className="text-base font-normal text-gray-400">%</span></p>
          <p className="text-xs text-gray-400 mt-1">Optimal: 35–65%</p>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-100 relative overflow-hidden">
            <div className="absolute inset-y-0 bg-green-100" style={{ left: "35%", width: "30%" }} />
            <div className="absolute inset-y-0 w-0.5 bg-[#EE661D] transition-all" style={{ left: `${data.whiteSpaceRatio}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-300 mt-1">
            <span>0%</span><span>35%</span><span>65%</span><span>100%</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Content Density</p>
          <p className="text-3xl font-extrabold text-[#333333]">{data.contentDensity}<span className="text-base font-normal text-gray-400">%</span></p>
          <p className="text-xs text-gray-400 mt-1">non-whitespace pixels</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-[#EE661D]" style={{ width: `${data.contentDensity}%` }} />
          </div>
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
