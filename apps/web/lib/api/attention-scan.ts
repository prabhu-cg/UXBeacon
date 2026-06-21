import { API_BASE_URL } from "@/lib/constants";
import { fetchWithRetry } from "./fetch-with-retry";
import type { AttentionScanResult, AttentionScanInitResponse } from "@uxbeacon/shared-types";

export async function uploadAttentionScan(file: File): Promise<AttentionScanInitResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetchWithRetry(`${API_BASE_URL}/api/attention-scans`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Upload failed (${res.status})`);
  }
  return res.json();
}

export async function getAttentionScan(scanId: string): Promise<AttentionScanResult> {
  const res = await fetchWithRetry(`${API_BASE_URL}/api/attention-scans/${scanId}`);
  if (!res.ok) throw new Error(`Failed to fetch attention scan (${res.status})`);
  return res.json();
}

export async function pollAttentionScanUntilComplete(
  scanId: string,
  onProgress: (result: AttentionScanResult) => void,
  intervalMs = 3000,
  maxAttempts = 60,
): Promise<AttentionScanResult> {
  let attempts = 0;
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        attempts++;
        const result = await getAttentionScan(scanId);
        onProgress(result);
        if (result.status === "complete" || result.status === "failed") {
          resolve(result);
          return;
        }
        if (attempts >= maxAttempts) {
          reject(new Error("Analysis timed out. Please try again."));
          return;
        }
        setTimeout(poll, intervalMs);
      } catch (err) {
        // Transient network error — retry instead of aborting the poll
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs * 2);
        } else {
          reject(err);
        }
      }
    };
    poll();
  });
}
