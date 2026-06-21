const RETRYABLE_DELAY_MS = 2000;

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 3,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, RETRYABLE_DELAY_MS * (attempt + 1)));
      }
    }
  }
  const msg =
    lastErr instanceof Error && lastErr.message
      ? lastErr.message
      : "Could not reach the analysis server";
  throw new Error(msg);
}
