interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  maxBuckets?: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export const getClientIp = (req: Request) => {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const candidate = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip")?.trim();
  return candidate || "unknown";
};

export const createRateLimiter = ({
  windowMs,
  maxRequests,
  maxBuckets = 5_000,
}: RateLimitOptions) => {
  const buckets = new Map<string, RateLimitBucket>();
  let operations = 0;

  const cleanup = (now: number) => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }

    if (buckets.size <= maxBuckets) return;
    const overflow = buckets.size - maxBuckets;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      removed += 1;
      if (removed >= overflow) break;
    }
  };

  return (req: Request) => {
    const now = Date.now();
    operations += 1;
    if (operations % 100 === 0 || buckets.size > maxBuckets) cleanup(now);

    const key = getClientIp(req);
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    current.count += 1;
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1_000));
    return {
      allowed: current.count <= maxRequests,
      retryAfterSeconds,
    };
  };
};

export const exceedsContentLength = (req: Request, maxBytes: number) => {
  const raw = req.headers.get("content-length");
  if (!raw) return false;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > maxBytes;
};
