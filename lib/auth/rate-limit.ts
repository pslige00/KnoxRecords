import "server-only";

/**
 * In-memory fixed-window rate limiter. Good enough for a single-instance
 * deployment; on multi-instance/serverless hosting each instance has its
 * own counters, so this is a best-effort throttle, not a hard guarantee.
 * For real multi-instance production traffic, swap this for a shared store
 * (e.g. Upstash Redis) behind the same `checkRateLimit` signature.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
