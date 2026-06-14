import type { AccessibilityScore } from "@uxbeacon/shared-types";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, Minus } from "lucide-react";

interface Props {
  data: AccessibilityScore;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    label: "Critical",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  serious: {
    icon: AlertTriangle,
    label: "Serious",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
  },
  moderate: {
    icon: Minus,
    label: "Moderate",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  minor: {
    icon: Info,
    label: "Minor",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export function AccessibilityPanel({ data }: Props) {
  const summary = [
    { severity: "critical" as const, count: data.critical },
    { severity: "serious" as const, count: data.serious },
    { severity: "moderate" as const, count: data.moderate },
    { severity: "minor" as const, count: data.minor },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Accessibility Issues
        </h3>
        <span className="text-sm text-gray-400">
          {data.issues.length} issue{data.issues.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-4 gap-3">
        {summary.map(({ severity, count }) => {
          const cfg = SEVERITY_CONFIG[severity];
          const Icon = cfg.icon;
          return (
            <div
              key={severity}
              className={`rounded-xl border p-3 text-center ${cfg.bg}`}
            >
              <Icon className={`h-4 w-4 mx-auto mb-1 ${cfg.color}`} />
              <div className={`text-lg font-extrabold ${cfg.color}`}>{count}</div>
              <div className="text-[10px] text-gray-500 capitalize">{severity}</div>
            </div>
          );
        })}
      </div>

      {/* Issue list */}
      {data.issues.length === 0 ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="text-green-600 font-semibold text-sm">No accessibility issues found!</div>
        </div>
      ) : (
        <div className="space-y-3">
          {data.issues.map((issue) => {
            const cfg = SEVERITY_CONFIG[issue.severity];
            const Icon = cfg.icon;
            return (
              <div
                key={issue.id}
                className="rounded-xl border border-gray-100 bg-white p-4 hover:border-[#EE661D]/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-[#333333]">
                        {issue.description}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${cfg.badge}`}
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{issue.wcagCriteria}</span>
                      <span>·</span>
                      <span>{issue.affectedElements} element{issue.affectedElements !== 1 ? "s" : ""}</span>
                    </div>
                    {issue.recommendation && (
                      <div className="mt-2 rounded-lg bg-[#FFF7E3] px-3 py-2">
                        <p className="text-xs text-[#333333]">
                          <span className="font-semibold">Fix: </span>
                          {issue.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
