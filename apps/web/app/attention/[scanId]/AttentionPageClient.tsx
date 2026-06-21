"use client";

import { useEffect, useState } from "react";
import { getAttentionScan, pollAttentionScanUntilComplete } from "@/lib/api/attention-scan";
import type { AttentionScanResult } from "@uxbeacon/shared-types";
import { AttentionProgressView } from "@/components/attention/AttentionProgressView";
import { AttentionResultsView } from "@/components/attention/AttentionResultsView";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function AttentionPageClient({ scanId }: { scanId: string }) {
  const [result, setResult] = useState<AttentionScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const initial = await getAttentionScan(scanId);
        if (cancelled) return;
        if (initial.status === "complete" || initial.status === "failed") {
          setResult(initial);
          return;
        }
        setResult(initial);
        const final = await pollAttentionScanUntilComplete(scanId, (r) => {
          if (!cancelled) setResult(r);
        });
        if (!cancelled) setResult(final);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    }
    start();
    return () => { cancelled = true; };
  }, [scanId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-200">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-[#333333] mb-2">Analysis failed</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Link href="/attention" className="inline-flex items-center justify-center rounded-full bg-[#EE661D] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#d55518] transition-colors">
            Try another screenshot
          </Link>
        </div>
      </div>
    );
  }

  if (!result || result.status === "pending" || result.status === "analyzing") {
    return <AttentionProgressView filename={result?.filename} />;
  }

  if (result.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-200">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-[#333333] mb-2">Analysis failed</h2>
          <p className="text-sm text-gray-500 mb-6">{result.error ?? "The image could not be analysed."}</p>
          <Link href="/attention" className="inline-flex items-center justify-center rounded-full bg-[#EE661D] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#d55518] transition-colors">
            Try another screenshot
          </Link>
        </div>
      </div>
    );
  }

  return <AttentionResultsView result={result} />;
}
