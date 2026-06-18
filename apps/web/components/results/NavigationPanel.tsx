import type { NavigationScore, SitemapNode } from "@uxbeacon/shared-types";

interface Props {
  data: NavigationScore;
  siteStructure?: SitemapNode;
}

function SitemapTree({ node, depth = 0 }: { node: SitemapNode; depth?: number }) {
  return (
    <li>
      <div
        className="flex items-center gap-2 py-1"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#EE661D] shrink-0" />
        <a
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#333333] hover:text-[#EE661D] truncate transition-colors"
        >
          {node.title || node.url}
        </a>
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <SitemapTree key={child.url} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function NavigationPanel({ data, siteStructure }: Props) {
  const color =
    data.score >= 80
      ? "#22c55e"
      : data.score >= 60
        ? "#84cc16"
        : data.score >= 40
          ? "#eab308"
          : "#ef4444";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Navigation
      </h3>

      {/* Score bar */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#333333]">Navigation Score</span>
          <span className="text-sm font-bold" style={{ color }}>
            {data.score}/100
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${data.score}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Findings */}
      {data.findings.length > 0 ? (
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
      ) : (
        <div className="rounded-lg border border-gray-100 bg-[#FFF7E3] px-4 py-3">
          <p className="text-sm text-[#333333]">No navigation issues found.</p>
        </div>
      )}

      {/* Site structure */}
      {siteStructure && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Site Structure
          </h4>
          <div className="rounded-xl border border-gray-100 bg-white p-4 overflow-auto max-h-80">
            <ul>
              <SitemapTree node={siteStructure} />
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
