"use client";

import { useState } from "react";
import type { ScanResult } from "@uxbeacon/shared-types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGrade } from "./ScoreGrade";
import { HeuristicsPanel } from "./HeuristicsPanel";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { UXLawsPanel } from "./UXLawsPanel";
import { ContentPanel } from "./ContentPanel";
import { Download, ExternalLink, RotateCcw, LayoutDashboard, ListChecks, Accessibility, Scale, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GRADE_COLORS } from "@/lib/constants";

interface Props {
  result: ScanResult;
}

function scoreColor(s: number) {
  return s >= 80 ? "#22c55e" : s >= 60 ? "#84cc16" : s >= 40 ? "#eab308" : "#ef4444";
}

const SCORE_ROWS = [
  { key: "accessibility" as const, label: "Accessibility", weight: "25%" },
  { key: "heuristics" as const, label: "UX Heuristics", weight: "25%" },
  { key: "uxLaws" as const, label: "UX Laws", weight: "20%" },
  { key: "contentQuality" as const, label: "Content Quality", weight: "15%" },
  { key: "navigation" as const, label: "Navigation", weight: "15%" },
];

export function ScanResultsView({ result }: Props) {
  const [tab, setTab] = useState("overview");
  const health = result.uxHealthScore!;
  const accentColor = GRADE_COLORS[health.grade] ?? "#EE661D";

  function handleDownload(format: "json" | "csv") {
    const url = `/api/scans/${result.id}/export?format=${format}`;
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="shrink-0 flex items-center gap-2">
              <Image src="/logo.svg" alt="UXBeacon" width={22} height={26} />
              <span className="text-base font-bold text-[#333333] hidden sm:block">UXBeacon</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-sm">
              {result.url}
            </span>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-[#EE661D]" />
            </a>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload("json")}
              className="hidden sm:flex gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload("csv")}
              className="hidden sm:flex gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EE661D] hover:bg-[#d55518] text-white text-xs font-medium px-3 h-7 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New scan
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Score header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex items-center gap-5">
              <ScoreGrade grade={health.grade} score={health.overall} size="lg" />
              <div>
                <h1 className="text-lg font-bold text-[#333333]">UX Health Report</h1>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-[#EE661D] transition-colors flex items-center gap-1"
                  >
                    {result.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs text-gray-500">
                    {result.pageCount} pages analyzed
                  </Badge>
                  <Badge variant="outline" className="text-xs text-gray-500">
                    {new Date(result.startedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Score breakdown bars */}
            <div className="flex-1 space-y-3 sm:ml-8 min-w-0 sm:max-w-sm w-full">
              {SCORE_ROWS.map((row) => {
                const score = health[row.key];
                const color = scoreColor(score);
                return (
                  <div key={row.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">{row.label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-gray-400">{row.weight}</span>
                        <span className="text-sm font-extrabold w-7 text-right" style={{ color }}>
                          {Math.round(score)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${score}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Executive summary */}
          {result.executiveSummary && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{result.executiveSummary}</p>
            </div>
          )}
        </div>

        {/* Detail tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          {/* Underline tab bar */}
          <div className="mb-6 border-b border-gray-200 bg-white rounded-t-xl">
            <div className="flex">
              {[
                { value: "overview",      label: "Overview",      icon: LayoutDashboard, score: null },
                { value: "heuristics",    label: "Heuristics",    icon: ListChecks,      score: health.heuristics },
                { value: "accessibility", label: "Accessibility", icon: Accessibility,   score: health.accessibility },
                { value: "ux-laws",       label: "UX Laws",       icon: Scale,           score: health.uxLaws },
                { value: "content",       label: "Content",       icon: FileText,        score: health.contentQuality },
              ].map(({ value, label, icon: Icon, score }) => {
                const active = tab === value;
                return (
                  <button
                    key={value}
                    onClick={() => setTab(value)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 px-2 border-b-2 transition-all ${
                      active
                        ? "border-[#EE661D] text-[#EE661D]"
                        : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold">{label}</span>
                    {score !== null && (
                      <span className="text-[11px] font-bold">{Math.round(score)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Key findings */}
              {result.keyFindings && result.keyFindings.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-[#333333] mb-4">Key Findings</h2>
                  <ul className="space-y-2">
                    {result.keyFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-[#EE661D]/10 flex items-center justify-center text-[10px] font-bold text-[#EE661D]">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-600 leading-relaxed">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-[#333333] mb-4">Top Recommendations</h2>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span
                          className="shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: accentColor }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-600 leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Screenshots */}
              {result.screenshots && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
                  <h2 className="font-bold text-[#333333] mb-4">Screenshots</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {Object.entries(result.screenshots).map(([viewport, src]) =>
                      src ? (
                        <div key={viewport} className="space-y-2">
                          <div className="rounded-xl overflow-hidden border border-gray-100 aspect-video bg-gray-50">
                            <img
                              src={src}
                              alt={`${viewport} screenshot`}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <p className="text-xs text-center text-gray-400 capitalize">{viewport}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="heuristics">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.heuristicScores ? (
                <HeuristicsPanel scores={result.heuristicScores} />
              ) : (
                <p className="text-sm text-gray-400">No heuristics data available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="accessibility">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.accessibilityScore ? (
                <AccessibilityPanel data={result.accessibilityScore} />
              ) : (
                <p className="text-sm text-gray-400">No accessibility data available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ux-laws">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.uxLawScores ? (
                <UXLawsPanel scores={result.uxLawScores} />
              ) : (
                <p className="text-sm text-gray-400">No UX laws data available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.contentScore ? (
                <ContentPanel data={result.contentScore} />
              ) : (
                <p className="text-sm text-gray-400">No content quality data available.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
