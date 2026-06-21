"use client";

import { Loader2, ScanEye, Flame, Target, AlertTriangle, LayoutGrid } from "lucide-react";

const STEPS = [
  { icon: ScanEye,      label: "Running OCR — detecting text and CTA elements" },
  { icon: Flame,        label: "Building saliency map — edges, contrast, colour" },
  { icon: ScanEye,      label: "Generating attention heatmap overlay" },
  { icon: Target,       label: "Analysing CTA prominence and ranking" },
  { icon: Flame,        label: "Evaluating hero section effectiveness" },
  { icon: AlertTriangle,label: "Detecting attention leakage from decorative elements" },
  { icon: LayoutGrid,   label: "Computing visual clutter score" },
];

export function AttentionProgressView({ filename }: { filename?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF7E3] border-2 border-[#EE661D]/20">
          <Loader2 className="h-7 w-7 text-[#EE661D] animate-spin" />
        </div>

        <h1 className="text-xl font-bold text-[#333333] mb-2">Predicting visual attention</h1>
        {filename && (
          <p className="text-sm text-gray-500 mb-8 truncate max-w-xs mx-auto">{filename}</p>
        )}

        <div className="text-left space-y-2.5 bg-[#FFF7E3] rounded-2xl p-5">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-gray-100 text-gray-300">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-gray-400">{step.label}</span>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Saliency analysis typically takes 20–50 seconds.
        </p>
      </div>
    </div>
  );
}
