import type { ContentScore } from "@uxbeacon/shared-types";

interface Props {
  data: ContentScore;
}

const DIMENSIONS = [
  { key: "readability" as const, label: "Readability" },
  { key: "headingHierarchy" as const, label: "Heading Hierarchy" },
  { key: "ctaClarity" as const, label: "CTA Clarity" },
  { key: "linkQuality" as const, label: "Link Quality" },
  { key: "contentDensity" as const, label: "Content Density" },
];

export function ContentPanel({ data }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Content Quality
      </h3>

      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
        {DIMENSIONS.map(({ key, label }) => {
          const score = data[key];
          const color =
            score >= 80 ? "#22c55e" : score >= 60 ? "#84cc16" : score >= 40 ? "#eab308" : "#ef4444";
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[#333333]">{label}</span>
                <span className="text-sm font-bold" style={{ color }}>
                  {score}/100
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${score}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {data.findings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Findings
          </h4>
          {data.findings.map((finding, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-100 bg-[#FFF7E3] px-4 py-3"
            >
              <p className="text-sm text-[#333333] leading-relaxed">{finding}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
