import type { TypographyResult } from "@uxbeacon/shared-types";

export function TypographyPanel({ data }: { data: TypographyResult }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Typography</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Font Size Variations</p>
          <p className="text-3xl font-extrabold text-[#333333]">{data.fontSizeVariations}</p>
          <p className="text-xs text-gray-400 mt-1">distinct sizes detected</p>
          <p className="text-xs text-gray-400 mt-2">Ideal range: 3–4 sizes</p>
        </div>

        <div className="rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Weight Variation</p>
          <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
            data.isBoldDetected
              ? "bg-green-50 text-green-700"
              : "bg-yellow-50 text-yellow-700"
          }`}>
            {data.isBoldDetected ? "Bold detected" : "No bold detected"}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {data.isBoldDetected
              ? "Good use of weight contrast for emphasis."
              : "Consider using bold to guide attention."}
          </p>
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
