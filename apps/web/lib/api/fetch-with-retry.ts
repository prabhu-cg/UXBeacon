// 502/503 = Render cold-starting or restarting — worth retrying
const RETRYABLE_STATUSES = [502, 503];

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 5,
  delayMs = 6000,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (RETRYABLE_STATUSES.includes(res.status) && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  const msg =
    lastErr instanceof Error && lastErr.message
      ? lastErr.message
      : "Could not reach the analysis server";
  throw new Error(msg);
}
