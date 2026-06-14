import type { HeuristicScore } from "@uxbeacon/shared-types";
import { Badge } from "@/components/ui/badge";

interface Props {
  scores: HeuristicScore[];
}

const SEVERITY_COLORS = {
  none: "bg-green-50 text-green-700 border-green-200",
  cosmetic: "bg-blue-50 text-blue-700 border-blue-200",
  minor: "bg-yellow-50 text-yellow-700 border-yellow-200",
  major: "bg-orange-50 text-orange-700 border-orange-200",
  catastrophic: "bg-red-50 text-red-700 border-red-200",
};

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8 ? "#22c55e" : score >= 6 ? "#84cc16" : score >= 4 ? "#eab308" : "#ef4444";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold w-8 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function HeuristicsPanel({ scores }: Props) {
  const avg = scores.reduce((s, h) => s + h.score, 0) / scores.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Nielsen&apos;s 10 Heuristics
        </h3>
        <span className="text-sm font-bold text-[#333333]">
          Avg {avg.toFixed(1)}/10
        </span>
      </div>

      <div className="space-y-3">
        {scores.map((h) => (
          <div
            key={h.id}
            className="rounded-xl border border-gray-100 bg-white p-4 hover:border-[#EE661D]/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#333333] truncate">{h.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 capitalize ${SEVERITY_COLORS[h.severity]}`}
                  >
                    {h.severity}
                  </Badge>
                </div>
                <ScoreBar score={h.score} />
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mt-2">{h.explanation}</p>

            {h.recommendation && h.severity !== "none" && (
              <div className="mt-2 rounded-lg bg-[#FFF7E3] px-3 py-2">
                <p className="text-xs text-[#333333]">
                  <span className="font-semibold">Recommendation: </span>
                  {h.recommendation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
