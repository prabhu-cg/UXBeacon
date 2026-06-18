import type { CTAResult } from "@uxbeacon/shared-types";
import { CheckCircle2, XCircle } from "lucide-react";

export function CtaPanel({ data }: { data: CTAResult }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">CTA Effectiveness</h3>

      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-3">
          {data.primaryCTAFound ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400 shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold text-[#333333]">
              {data.primaryCTAFound ? "Primary CTA detected" : "No primary CTA detected"}
            </p>
            {data.primaryCTAText && (
              <p className="text-xs text-gray-400 mt-0.5">"{data.primaryCTAText}"</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Total CTAs</p>
            <p className="text-2xl font-extrabold text-[#333333]">{data.ctaCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Ideal</p>
            <p className="text-sm font-semibold text-gray-500">1 primary, 0–2 secondary</p>
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
