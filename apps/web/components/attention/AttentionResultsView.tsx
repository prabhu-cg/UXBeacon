"use client";

import { useState } from "react";
import type { AttentionScanResult, AttentionRegion } from "@uxbeacon/shared-types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGrade } from "@/components/results/ScoreGrade";
import { GRADE_COLORS, API_BASE_URL } from "@/lib/constants";
import {
  Download, RotateCcw, LayoutDashboard, Target, Flame,
  AlertTriangle, LayoutGrid, CheckCircle2, XCircle, Info,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const SCORE_ROWS = [
  { key: "ctaAttention"  as const, label: "CTA Attention",   weight: "35%" },
  { key: "heroAttention" as const, label: "Hero Dominance",  weight: "25%" },
  { key: "leakage"       as const, label: "Leakage Control", weight: "25%" },
  { key: "clutter"       as const, label: "Visual Clarity",  weight: "15%" },
];

const TABS = [
  { value: "overview",  label: "Overview",  icon: LayoutDashboard },
  { value: "cta",       label: "CTA",       icon: Target          },
  { value: "hero",      label: "Hero",      icon: Flame           },
  { value: "leakage",   label: "Leakage",   icon: AlertTriangle   },
  { value: "clutter",   label: "Clutter",   icon: LayoutGrid      },
];

function scoreColor(s: number) {
  return s >= 80 ? "#22c55e" : s >= 60 ? "#84cc16" : s >= 40 ? "#eab308" : "#ef4444";
}

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  const color = scoreColor(score);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-gray-400">{weight}</span>
          <span className="text-sm font-extrabold w-7 text-right" style={{ color }}>{Math.round(score)}</span>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function FindingsList({ findings, icon: Icon, color }: { findings: string[]; icon: React.ElementType; color: string }) {
  if (!findings.length) return null;
  return (
    <ul className="space-y-2">
      {findings.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <Icon className="h-4 w-4 shrink-0 mt-0.5" style={{ color }} />
          <span className="text-sm text-gray-600 leading-relaxed">{f}</span>
        </li>
      ))}
    </ul>
  );
}

// Heatmap with numbered region markers overlaid as HTML
function HeatmapView({ dataUri, regions }: { dataUri: string; regions?: AttentionRegion[] }) {
  const RANK_COLORS = ["#EE661D", "#e53e3e", "#dd6b20", "#d69e2e", "#38a169", "#3182ce", "#805ad5"];
  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUri} alt="Attention heatmap" className="w-full h-auto block" />
      {regions?.map((r) => (
        <div
          key={r.rank}
          className="absolute"
          style={{
            left: `${r.x * 100}%`,
            top: `${r.y * 100}%`,
            width: `${r.width * 100}%`,
            height: `${r.height * 100}%`,
          }}
        >
          <div
            className="absolute -top-3 -left-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: RANK_COLORS[(r.rank - 1) % RANK_COLORS.length] }}
          >
            {r.rank}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AttentionResultsView({ result }: { result: AttentionScanResult }) {
  const [tab, setTab] = useState("overview");
  const accentColor = GRADE_COLORS[result.grade ?? "F"] ?? "#EE661D";

  const scoreValues = {
    ctaAttention:  result.ctaAttention?.score  ?? 0,
    heroAttention: result.heroAttention?.score ?? 0,
    leakage:       result.leakage?.score       ?? 0,
    clutter:       result.clutter?.score       ?? 0,
  };

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
            <span className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-sm">{result.filename}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${API_BASE_URL}/api/attention-scans/${result.id}/export?format=json`, "_blank")}
              className="hidden sm:flex gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> JSON
            </Button>
            <Link
              href="/attention"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EE661D] hover:bg-[#d55518] text-white text-xs font-medium px-3 h-7 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> New scan
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Score header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex items-center gap-5">
              <ScoreGrade grade={result.grade ?? "F"} score={result.overallScore ?? 0} size="lg" />
              <div>
                <h1 className="text-lg font-bold text-[#333333]">Visual Attention Report</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs text-gray-500">{result.filename}</Badge>
                  <Badge variant="outline" className="text-xs text-gray-500">
                    {(result.fileSize / 1024).toFixed(0)} KB
                  </Badge>
                  <Badge variant="outline" className="text-xs text-gray-500">
                    {new Date(result.startedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 sm:ml-8 min-w-0 sm:max-w-sm w-full">
              {SCORE_ROWS.map((row) => (
                <ScoreBar key={row.key} label={row.label} score={scoreValues[row.key]} weight={row.weight} />
              ))}
            </div>
          </div>

          {result.executiveSummary && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{result.executiveSummary}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="mb-6 border-b border-gray-200 bg-white rounded-t-xl overflow-x-auto">
            <div className="flex min-w-max">
              {TABS.map(({ value, label, icon: Icon }) => {
                const active = tab === value;
                return (
                  <button
                    key={value}
                    onClick={() => setTab(value)}
                    className={`flex flex-col items-center justify-center gap-0.5 py-3 px-4 border-b-2 transition-all min-w-[80px] ${
                      active ? "border-[#EE661D] text-[#EE661D]" : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Overview ── */}
          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Heatmap */}
              {result.heatmapDataUri && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-[#333333]">Attention Heatmap</h2>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" /> Low
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-400 ml-1" /> Medium
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-yellow-400 ml-1" /> High
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-500 ml-1" />
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500 ml-0.5" /> Highest
                    </div>
                  </div>
                  <HeatmapView dataUri={result.heatmapDataUri} regions={result.attentionRegions} />
                  <p className="mt-3 text-xs text-gray-400 text-center">
                    Numbered markers indicate predicted attention order. Red = highest attention, blue = lowest.
                  </p>
                </div>
              )}

              {/* Focus order */}
              {result.attentionRegions && result.attentionRegions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-[#333333] mb-4">Predicted Focus Order</h2>
                  <ol className="space-y-3">
                    {result.attentionRegions.map((r) => (
                      <li key={r.rank} className="flex items-center gap-3">
                        <span
                          className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: "#EE661D" }}
                        >
                          {r.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-[#333333] truncate">{r.label}</span>
                            <span className="text-xs text-gray-400 shrink-0">{r.weight}% weight</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#EE661D]"
                              style={{ width: `${r.weight}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Key findings */}
              {result.keyFindings && result.keyFindings.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-[#333333] mb-4">Key Findings</h2>
                  <ul className="space-y-2">
                    {result.keyFindings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-[#EE661D]/10 flex items-center justify-center text-[10px] font-bold text-[#EE661D]">{i + 1}</span>
                        <span className="text-sm text-gray-600 leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
                  <h2 className="font-bold text-[#333333] mb-4">Recommendations</h2>
                  <ul className="space-y-2">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: accentColor }}>{i + 1}</span>
                        <span className="text-sm text-gray-600 leading-relaxed">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── CTA Attention ── */}
          <TabsContent value="cta">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.ctaAttention ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-6 flex-wrap">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold" style={{ color: scoreColor(result.ctaAttention.score) }}>
                        {result.ctaAttention.score}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">CTA Score</div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4 min-w-[260px]">
                      {[
                        { label: "Attention Rank", value: result.ctaAttention.ctaRank !== null ? `#${result.ctaAttention.ctaRank}` : "N/A" },
                        { label: "Visual Weight",  value: `${result.ctaAttention.ctaWeight}%`  },
                        { label: "Visibility",     value: `${result.ctaAttention.visibility}%` },
                      ].map((m) => (
                        <div key={m.label} className="rounded-xl bg-gray-50 p-4 text-center">
                          <div className="text-xl font-extrabold text-[#333333]">{m.value}</div>
                          <div className="text-xs text-gray-400 mt-1">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#333333] mb-3">Findings</h3>
                    <FindingsList findings={result.ctaAttention.findings} icon={Info} color="#EE661D" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No CTA attention data available.</p>
              )}
            </div>
          </TabsContent>

          {/* ── Hero Analysis ── */}
          <TabsContent value="hero">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.heroAttention ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-6 flex-wrap">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold" style={{ color: scoreColor(result.heroAttention.score) }}>
                        {result.heroAttention.score}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Hero Score</div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4 min-w-[260px]">
                      {[
                        { label: "Hero Dominance",     value: `${result.heroAttention.heroDominance}%`      },
                        { label: "Headline Prominence",value: `${result.heroAttention.headlineProminence}%` },
                        { label: "Message Visibility", value: `${result.heroAttention.messageVisibility}%`  },
                      ].map((m) => (
                        <div key={m.label} className="rounded-xl bg-gray-50 p-4 text-center">
                          <div className="text-xl font-extrabold text-[#333333]">{m.value}</div>
                          <div className="text-xs text-gray-400 mt-1">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#333333] mb-3">Findings</h3>
                    <FindingsList findings={result.heroAttention.findings} icon={Info} color="#EE661D" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No hero analysis data available.</p>
              )}
            </div>
          </TabsContent>

          {/* ── Leakage ── */}
          <TabsContent value="leakage">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.leakage ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold" style={{ color: scoreColor(result.leakage.score) }}>
                        {result.leakage.score}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Leakage Score</div>
                    </div>
                    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${result.leakage.leakageDetected ? "bg-red-50" : "bg-green-50"}`}>
                      {result.leakage.leakageDetected
                        ? <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                        : <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                      <span className={`text-sm font-semibold ${result.leakage.leakageDetected ? "text-red-700" : "text-green-700"}`}>
                        {result.leakage.leakageDetected ? "Attention leakage detected" : "No leakage detected"}
                      </span>
                    </div>
                  </div>

                  {result.leakage.leakingRegions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-[#333333] mb-3">Leaking Regions</h3>
                      <ul className="space-y-1.5">
                        {result.leakage.leakingRegions.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-[#333333] mb-3">Findings</h3>
                    <FindingsList findings={result.leakage.findings} icon={Info} color="#EE661D" />
                  </div>

                  {result.leakage.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-[#333333] mb-3">Recommendations</h3>
                      <FindingsList findings={result.leakage.recommendations} icon={CheckCircle2} color="#22c55e" />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No leakage data available.</p>
              )}
            </div>
          </TabsContent>

          {/* ── Clutter ── */}
          <TabsContent value="clutter">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.clutter ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-6 flex-wrap">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold" style={{ color: scoreColor(result.clutter.score) }}>
                        {result.clutter.score}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Clarity Score</div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4 min-w-[260px]">
                      {[
                        { label: "Clutter Index",      value: `${result.clutter.clutterScore}%`           },
                        { label: "Focal Points",        value: `${result.clutter.competingFocalPoints}`   },
                        { label: "Edge Density",        value: `${Math.round(result.clutter.edgeDensity * 100)}%` },
                      ].map((m) => (
                        <div key={m.label} className="rounded-xl bg-gray-50 p-4 text-center">
                          <div className="text-xl font-extrabold text-[#333333]">{m.value}</div>
                          <div className="text-xs text-gray-400 mt-1">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#333333] mb-3">Findings</h3>
                    <FindingsList findings={result.clutter.findings} icon={Info} color="#EE661D" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No clutter data available.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
