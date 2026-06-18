import { API_BASE_URL } from "@/lib/constants";
import type { DesignScanResult, DesignScanInitResponse } from "@uxbeacon/shared-types";

export async function uploadDesignScan(file: File): Promise<DesignScanInitResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/design-scans`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Upload failed (${res.status})`);
  }
  return res.json();
}

export async function getDesignScan(scanId: string): Promise<DesignScanResult> {
  const res = await fetch(`${API_BASE_URL}/api/design-scans/${scanId}`);
  if (!res.ok) throw new Error(`Failed to fetch design scan (${res.status})`);
  return res.json();
}

export async function pollDesignScanUntilComplete(
  scanId: string,
  onProgress: (result: DesignScanResult) => void,
  intervalMs = 3000,
  maxAttempts = 60,
): Promise<DesignScanResult> {
  let attempts = 0;
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        attempts++;
        const result = await getDesignScan(scanId);
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
        reject(err);
      }
    };
    poll();
  });
}
