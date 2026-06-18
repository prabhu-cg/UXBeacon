import type { ContrastResult } from "@uxbeacon/shared-types";
import { Badge } from "@/components/ui/badge";

function PassBadge({ pass }: { pass: boolean }) {
  return (
    <Badge variant="outline" className={`text-xs ${pass ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
      {pass ? "PASS" : "FAIL"}
    </Badge>
  );
}

export function ContrastPanel({ data }: { data: ContrastResult }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contrast & WCAG Compliance</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#333333]">WCAG AA (4.5:1)</span>
            <PassBadge pass={data.wcagAAPassRate >= 75} />
          </div>
          <p className="text-3xl font-extrabold text-[#333333]">{data.wcagAAPassRate}<span className="text-base font-normal text-gray-400">%</span></p>
          <p className="text-xs text-gray-400 mt-1">of text regions passing</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-[#EE661D]" style={{ width: `${data.wcagAAPassRate}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#333333]">WCAG AAA (7:1)</span>
            <PassBadge pass={data.wcagAAAPassRate >= 50} />
          </div>
          <p className="text-3xl font-extrabold text-[#333333]">{data.wcagAAAPassRate}<span className="text-base font-normal text-gray-400">%</span></p>
          <p className="text-xs text-gray-400 mt-1">of text regions passing</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-[#EE661D]" style={{ width: `${data.wcagAAAPassRate}%` }} />
          </div>
        </div>
      </div>

      {data.issueCount > 0 && (
        <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl font-extrabold text-orange-600">{data.issueCount}</span>
          <span className="text-sm text-orange-700">low-contrast region{data.issueCount !== 1 ? "s" : ""} detected</span>
        </div>
      )}

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
