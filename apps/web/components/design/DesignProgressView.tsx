"use client";

import { Loader2, Layers, Contrast, Type, LayoutGrid, Maximize2, MousePointerClick, Palette, Circle, Scale } from "lucide-react";

const STEPS = [
  { icon: Layers,             label: "Analysing visual hierarchy" },
  { icon: Contrast,           label: "Checking contrast & WCAG compliance" },
  { icon: Type,               label: "Evaluating typography consistency" },
  { icon: LayoutGrid,         label: "Measuring spacing & alignment" },
  { icon: Maximize2,          label: "Computing layout density" },
  { icon: MousePointerClick,  label: "Detecting CTA effectiveness" },
  { icon: Palette,            label: "Extracting color palette" },
  { icon: Circle,             label: "Evaluating Gestalt principles" },
  { icon: Scale,              label: "Computing visual balance score" },
];

export function DesignProgressView({ filename }: { filename?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF7E3] border-2 border-[#EE661D]/20">
          <Loader2 className="h-7 w-7 text-[#EE661D] animate-spin" />
        </div>

        <h1 className="text-xl font-bold text-[#333333] mb-2">Analysing your design</h1>
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
          OCR + pixel analysis typically takes 20–60 seconds.
        </p>
      </div>
    </div>
  );
}
