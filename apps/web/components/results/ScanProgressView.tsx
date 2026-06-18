"use client";

import { Loader2, Globe, Eye, Accessibility, FileText, Layout, TrendingUp } from "lucide-react";
import type { ScanStatus } from "@uxbeacon/shared-types";

interface Props {
  url: string;
  status: ScanStatus;
}

const STATUS_STEPS = [
  { id: "crawling", icon: Globe, label: "Crawling pages" },
  { id: "analyzing", icon: Eye, label: "Running heuristics analysis" },
  { id: "analyzing", icon: Accessibility, label: "Scanning accessibility" },
  { id: "analyzing", icon: Layout, label: "Evaluating UX laws" },
  { id: "analyzing", icon: FileText, label: "Checking content quality" },
  { id: "analyzing", icon: TrendingUp, label: "Computing health score" },
];

export function ScanProgressView({ url, status }: Props) {
  const activeIndex =
    status === "crawling" ? 0 : status === "analyzing" ? 3 : STATUS_STEPS.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md text-center">
        {/* Spinner */}
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF7E3] border-2 border-[#EE661D]/20">
          <Loader2 className="h-7 w-7 text-[#EE661D] animate-spin" />
        </div>

        <h1 className="text-xl font-bold text-[#333333] mb-2">Analysing your website</h1>
        <p className="text-sm text-gray-500 mb-8 truncate max-w-xs mx-auto">{url}</p>

        {/* Step list */}
        <div className="text-left space-y-3 bg-[#FFF7E3] rounded-2xl p-5">
          {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={`${step.id}-${idx}`} className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all ${
                    isDone
                      ? "bg-[#EE661D] text-white"
                      : isActive
                        ? "bg-[#EE661D]/20 text-[#EE661D]"
                        : "bg-white text-gray-300 border border-gray-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span
                  className={`text-sm transition-all ${
                    isDone
                      ? "text-gray-400 line-through"
                      : isActive
                        ? "text-[#333333] font-semibold"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                  {isActive && (
                    <span className="ml-2 inline-block animate-pulse text-[#EE661D]">...</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-gray-400">
          This usually takes 30–90 seconds depending on site size.
        </p>
      </div>
    </div>
  );
}
