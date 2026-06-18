"use client";

import { useEffect, useState } from "react";
import { getScanResult, pollUntilComplete } from "@/lib/api/scan";
import type { ScanResult } from "@uxbeacon/shared-types";
import { ScanProgressView } from "@/components/results/ScanProgressView";
import { ScanResultsView } from "@/components/results/ScanResultsView";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  scanId: string;
}

export function ScanPageClient({ scanId }: Props) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        // Initial fetch
        const initial = await getScanResult(scanId);
        if (cancelled) return;

        if (initial.status === "complete" || initial.status === "failed") {
          setResult(initial);
          return;
        }

        setResult(initial);
        const final = await pollUntilComplete(scanId, (r) => {
          if (!cancelled) setResult(r);
        });
        if (!cancelled) setResult(final);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      }
    }

    start();
    return () => {
      cancelled = true;
    };
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
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#EE661D] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#d55518] transition-colors"
          >
            Try another URL
          </Link>
        </div>
      </div>
    );
  }

  if (!result || result.status === "pending" || result.status === "crawling" || result.status === "analyzing") {
    return (
      <ScanProgressView
        url={result?.url ?? "..."}
        status={result?.status ?? "pending"}
      />
    );
  }

  if (result.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-200">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-[#333333] mb-2">Scan failed</h2>
          <p className="text-sm text-gray-500 mb-6">
            {result.error ?? "The website could not be analysed. It may be behind a login or blocking crawlers."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#EE661D] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#d55518] transition-colors"
          >
            Try another URL
          </Link>
        </div>
      </div>
    );
  }

  return <ScanResultsView result={result} />;
}
