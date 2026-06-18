import type { ColorResult } from "@uxbeacon/shared-types";

function Swatch({ hex }: { hex: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded-md border border-gray-200 shrink-0" style={{ backgroundColor: hex }} />
      <span className="text-xs font-mono text-gray-500">{hex}</span>
    </div>
  );
}

export function ColorPanel({ data }: { data: ColorResult }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Colour Analysis</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dominant Colours</p>
          {data.dominantColors.length > 0 ? (
            <div className="space-y-2">
              {data.dominantColors.map((hex) => <Swatch key={hex} hex={hex} />)}
            </div>
          ) : (
            <p className="text-sm text-gray-400">None detected</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Accent Colours</p>
          {data.accentColors.length > 0 ? (
            <div className="space-y-2">
              {data.accentColors.map((hex) => <Swatch key={hex} hex={hex} />)}
            </div>
          ) : (
            <p className="text-sm text-gray-400">None detected</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 p-4 flex items-center gap-4">
        <div>
          <p className="text-xs text-gray-400">Hue Groups</p>
          <p className="text-2xl font-extrabold text-[#333333]">{data.totalColorGroups}</p>
        </div>
        <p className="text-xs text-gray-400 border-l border-gray-100 pl-4">
          {data.totalColorGroups <= 2 ? "Tight, cohesive palette" : data.totalColorGroups <= 4 ? "Moderate complexity" : "Consider simplifying"}
        </p>
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
