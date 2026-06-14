import { API_BASE_URL } from "@/lib/constants";
import type { ScanResult, ScanInitResponse } from "@uxbeacon/shared-types";

export async function initiateScan(url: string, guestToken?: string): Promise<ScanInitResponse> {
  const res = await fetch(`${API_BASE_URL}/api/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, guestToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Failed to start scan (${res.status})`);
  }
  return res.json();
}

export async function getScanResult(scanId: string): Promise<ScanResult> {
  const res = await fetch(`${API_BASE_URL}/api/scans/${scanId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch scan result (${res.status})`);
  }
  return res.json();
}

export async function pollUntilComplete(
  scanId: string,
  onProgress: (result: ScanResult) => void,
  intervalMs = 2500,
  maxAttempts = 120,
): Promise<ScanResult> {
  let attempts = 0;
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        attempts++;
        const result = await getScanResult(scanId);
        onProgress(result);
        if (result.status === "complete" || result.status === "failed") {
          resolve(result);
          return;
        }
        if (attempts >= maxAttempts) {
          reject(new Error("Scan timed out. Please try again."));
          return;
        }
        setTimeout(poll, intervalMs);
      } catch (err) {
        reject(err);
      }
    };
    poll();
  });
}
