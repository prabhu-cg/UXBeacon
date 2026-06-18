"use client";

import { useEffect, useState } from "react";
import { getDesignScan, pollDesignScanUntilComplete } from "@/lib/api/design-scan";
import type { DesignScanResult } from "@uxbeacon/shared-types";
import { DesignProgressView } from "@/components/design/DesignProgressView";
import { DesignResultsView } from "@/components/design/DesignResultsView";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function DesignPageClient({ scanId }: { scanId: string }) {
  const [result, setResult] = useState<DesignScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const initial = await getDesignScan(scanId);
        if (cancelled) return;
        if (initial.status === "complete" || initial.status === "failed") {
          setResult(initial);
          return;
        }
        setResult(initial);
        const final = await pollDesignScanUntilComplete(scanId, (r) => {
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
          <Link href="/design" className="inline-flex items-center justify-center rounded-full bg-[#EE661D] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#d55518] transition-colors">
            Try another screenshot
          </Link>
        </div>
      </div>
    );
  }

  if (!result || result.status === "pending" || result.status === "analyzing") {
    return <DesignProgressView filename={result?.filename} />;
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
          <Link href="/design" className="inline-flex items-center justify-center rounded-full bg-[#EE661D] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#d55518] transition-colors">
            Try another screenshot
          </Link>
        </div>
      </div>
    );
  }

  return <DesignResultsView result={result} />;
}
