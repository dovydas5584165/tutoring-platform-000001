/**
 * Small server-side security helpers: constant-time compare, client IP and a best-effort rate limiter.
 */

/** Compares two strings in constant time (for secrets), so timing doesn't leak how much matched. */
export function safeEqual(a: string, b: string) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** Caller's IP as seen by Vercel (first entry of x-forwarded-for). */
export function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const buckets = new Map<string, number[]>();

/**
 * Sliding-window limiter: true if `key` may do one more action (max `limit` per `windowMs`).
 * In memory, so it's per server instance: it stops naive brute force / spam bursts, not a
 * distributed attack. For that, put Vercel Firewall rate-limit rules in front of these routes.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return true;
}

/** True if `key` is still under `limit` in the window, without recording anything. */
export function underLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  return (buckets.get(key) || []).filter((t) => now - t < windowMs).length < limit;
}

/** Standard 429 body. */
export const tooMany = () =>
  Response.json({ error: "Per daug bandymų. Pabandykite po kelių minučių." }, { status: 429 });
