"use client";

import { useState } from "react";
import type { DesignScanResult } from "@uxbeacon/shared-types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreGrade } from "@/components/results/ScoreGrade";
import { HierarchyPanel } from "./panels/HierarchyPanel";
import { ContrastPanel } from "./panels/ContrastPanel";
import { TypographyPanel } from "./panels/TypographyPanel";
import { SpacingPanel } from "./panels/SpacingPanel";
import { DensityPanel } from "./panels/DensityPanel";
import { CtaPanel } from "./panels/CtaPanel";
import { ColorPanel } from "./panels/ColorPanel";
import { GestaltPanel } from "./panels/GestaltPanel";
import { BalancePanel } from "./panels/BalancePanel";
import { GRADE_COLORS, API_BASE_URL } from "@/lib/constants";
import {
  Download, RotateCcw, LayoutDashboard, Layers, Contrast,
  Type, LayoutGrid, Maximize2, MousePointerClick, Palette, Circle, Scale,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const SCORE_ROWS = [
  { key: "hierarchy"  as const, label: "Visual Hierarchy",  weight: "20%" },
  { key: "contrast"   as const, label: "Contrast",          weight: "15%" },
  { key: "typography" as const, label: "Typography",        weight: "15%" },
  { key: "spacing"    as const, label: "Spacing",           weight: "15%" },
  { key: "density"    as const, label: "Layout Density",    weight: "10%" },
  { key: "cta"        as const, label: "CTA Effectiveness", weight: "10%" },
  { key: "color"      as const, label: "Colour Consistency", weight: "10%" },
  { key: "balance"    as const, label: "Visual Balance",    weight: "5%"  },
];

const TABS = [
  { value: "overview",    label: "Overview",    icon: LayoutDashboard,     scoreKey: null                  },
  { value: "hierarchy",   label: "Hierarchy",   icon: Layers,              scoreKey: "hierarchy"   as const },
  { value: "contrast",    label: "Contrast",    icon: Contrast,            scoreKey: "contrast"    as const },
  { value: "typography",  label: "Typography",  icon: Type,                scoreKey: "typography"  as const },
  { value: "spacing",     label: "Spacing",     icon: LayoutGrid,          scoreKey: "spacing"     as const },
  { value: "density",     label: "Density",     icon: Maximize2,           scoreKey: "density"     as const },
  { value: "cta",         label: "CTA",         icon: MousePointerClick,   scoreKey: "cta"         as const },
  { value: "color",       label: "Color",       icon: Palette,             scoreKey: "color"       as const },
  { value: "gestalt",     label: "Gestalt",     icon: Circle,              scoreKey: null                  },
  { value: "balance",     label: "Balance",     icon: Scale,               scoreKey: "balance"     as const },
];

function scoreColor(s: number) {
  return s >= 80 ? "#22c55e" : s >= 60 ? "#84cc16" : s >= 40 ? "#eab308" : "#ef4444";
}

export function DesignResultsView({ result }: { result: DesignScanResult }) {
  const [tab, setTab] = useState("overview");
  const score = result.visualQualityScore!;
  const accentColor = GRADE_COLORS[score.grade] ?? "#EE661D";

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
              {result.filename}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${API_BASE_URL}/api/design-scans/${result.id}/export?format=json`, "_blank")}
              className="hidden sm:flex gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> JSON
            </Button>
            <Link
              href="/design"
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
              <ScoreGrade grade={score.grade} score={score.overall} size="lg" />
              <div>
                <h1 className="text-lg font-bold text-[#333333]">Design Quality Report</h1>
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

            {/* Score breakdown bars */}
            <div className="flex-1 space-y-2.5 sm:ml-8 min-w-0 sm:max-w-sm w-full">
              {SCORE_ROWS.map((row) => {
                const s = score[row.key];
                const c = scoreColor(s);
                return (
                  <div key={row.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">{row.label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-gray-400">{row.weight}</span>
                        <span className="text-sm font-extrabold w-7 text-right" style={{ color: c }}>{Math.round(s)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s}%`, backgroundColor: c }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {result.executiveSummary && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{result.executiveSummary}</p>
            </div>
          )}
        </div>

        {/* Detail tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="mb-6 border-b border-gray-200 bg-white rounded-t-xl overflow-x-auto">
            <div className="flex min-w-max">
              {TABS.map(({ value, label, icon: Icon, scoreKey }) => {
                const active = tab === value;
                const tabScore = scoreKey ? score[scoreKey] : null;
                return (
                  <button
                    key={value}
                    onClick={() => setTab(value)}
                    className={`flex flex-col items-center justify-center gap-0.5 py-3 px-3 border-b-2 transition-all min-w-[64px] ${
                      active ? "border-[#EE661D] text-[#EE661D]" : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] font-semibold">{label}</span>
                    {tabScore !== null && (
                      <span className="text-[10px] font-bold">{Math.round(tabScore)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
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

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-[#333333] mb-4">Top Recommendations</h2>
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

          <TabsContent value="hierarchy">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.hierarchyResult ? <HierarchyPanel data={result.hierarchyResult} /> : <p className="text-sm text-gray-400">No data available.</p>}
            </div>
          </TabsContent>
          <TabsContent value="contrast">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.contrastResult ? <ContrastPanel data={result.contrastResult} /> : <p className="text-sm text-gray-400">No data available.</p>}
            </div>
          </TabsContent>
          <TabsContent value="typography">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.typographyResult ? <TypographyPanel data={result.typographyResult} /> : <p className="text-sm text-gray-400">No data available.</p>}
            </div>
          </TabsContent>
          <TabsContent value="spacing">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.spacingResult ? <SpacingPanel data={result.spacingResult} /> : <p className="text-sm text-gray-400">No data available.</p>}
            </div>
          </TabsContent>
          <TabsContent value="density">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.densityResult ? <DensityPanel data={result.densityResult} /> : <p className="text-sm text-gray-400">No data available.</p>}
            </div>
          </TabsContent>
          <TabsContent value="cta">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.ctaResult ? <CtaPanel data={result.ctaResult} /> : <p className="text-sm text-gray-400">No data available.</p>}
            </div>
          </TabsContent>
          <TabsContent value="color">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.colorResult ? <ColorPanel data={result.colorResult} /> : <p className="text-sm text-gray-400">No data available.</p>}
            </div>
          </TabsContent>
          <TabsContent value="gestalt">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.gestaltResult ? <GestaltPanel data={result.gestaltResult} /> : <p className="text-sm text-gray-400">No data available.</p>}
            </div>
          </TabsContent>
          <TabsContent value="balance">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {result.balanceResult ? <BalancePanel data={result.balanceResult} /> : <p className="text-sm text-gray-400">No data available.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
