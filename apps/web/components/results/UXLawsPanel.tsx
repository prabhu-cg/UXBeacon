import type { UXLawScore } from "@uxbeacon/shared-types";

interface Props {
  scores: UXLawScore[];
}

const LAW_DESCRIPTIONS: Record<string, string> = {
  "hicks-law": "The time to make a decision increases with the number and complexity of choices.",
  "fitts-law": "The time to acquire a target is a function of the distance to and size of the target.",
  "jakobs-law": "Users spend most time on other sites and expect your site to work the same way.",
  "millers-law": "People can hold ~7 (±2) items in working memory at one time.",
  "doherty-threshold": "Productivity soars when computer and user interact at <400ms.",
  "pareto-principle": "80% of effects come from 20% of causes — focus on the vital few.",
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 8 ? "#22c55e" : score >= 6 ? "#84cc16" : score >= 4 ? "#eab308" : "#ef4444";
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${(score / 10) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold w-10 text-right shrink-0" style={{ color }}>
        {score}/10
      </span>
    </div>
  );
}

export function UXLawsPanel({ scores }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        UX Laws Evaluation
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {scores.map((law) => (
          <div
            key={law.id}
            className="rounded-xl border border-gray-100 bg-white p-4 hover:border-[#EE661D]/30 transition-colors"
          >
            <div className="font-semibold text-sm text-[#333333] mb-0.5">{law.name}</div>
            <div className="text-[11px] text-gray-400 leading-relaxed mb-2">
              {LAW_DESCRIPTIONS[law.id]}
            </div>

            <ScoreBar score={law.score} />

            {law.finding && (
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">{law.finding}</p>
            )}

            {law.recommendation && (
              <div className="mt-2 rounded-lg bg-[#FFF7E3] px-3 py-2">
                <p className="text-xs text-[#333333]">
                  <span className="font-semibold">Tip: </span>
                  {law.recommendation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
