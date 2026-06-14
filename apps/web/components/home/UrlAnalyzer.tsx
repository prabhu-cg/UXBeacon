"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initiateScan } from "@/lib/api/scan";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function UrlAnalyzer() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);

    if (!normalized) {
      setError("Please enter a website URL.");
      return;
    }
    if (!isValidUrl(normalized)) {
      setError("Please enter a valid URL, e.g. example.com");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const { scanId } = await initiateScan(normalized);
        router.push(`/analyze/${scanId}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to start analysis.";
        setError(message);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-0 rounded-2xl border-2 border-gray-200 bg-white p-1.5 shadow-lg shadow-gray-100 transition-all focus-within:border-[#EE661D] focus-within:shadow-[#EE661D]/10 focus-within:shadow-xl">
          <div className="flex items-center pl-3 pr-2">
            <Globe className="h-5 w-5 text-gray-400 shrink-0" />
          </div>
          <Input
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            placeholder="Enter any website URL to analyze..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            className="flex-1 border-0 shadow-none focus-visible:ring-0 text-base text-[#333333] placeholder:text-gray-400 bg-transparent"
            disabled={isPending}
            aria-label="Website URL"
            aria-describedby={error ? "url-error" : undefined}
          />
          <Button
            type="submit"
            disabled={isPending || !url.trim()}
            className="shrink-0 rounded-xl bg-[#EE661D] hover:bg-[#d55518] text-white h-11 px-5 text-sm font-600 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>

      {error && (
        <p id="url-error" role="alert" className="mt-3 text-sm text-red-500 text-center">
          {error}
        </p>
      )}

      <p className="mt-4 text-center text-xs text-gray-400">
        Free · No account required · Up to 25 pages per scan
      </p>
    </div>
  );
}
