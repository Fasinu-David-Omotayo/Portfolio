// Simple in-memory rate limiter.
//
// NOTE: this resets whenever the server restarts, and on serverless hosts
// (like Vercel) each function instance has its own memory, so this limiter
// doesn't share state across instances. It still stops casual abuse and
// basic brute-force attempts. For strict production-grade rate limiting
// across a serverless fleet, swap this for a shared store like Upstash
// Redis (@upstash/ratelimit) - the checkRateLimit() call signature below
// is designed to be a drop-in replacement for that later.

const attempts = new Map();

export function checkRateLimit(key, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = attempts.get(key) || { count: 0, start: now };

  if (now - record.start > windowMs) {
    record.count = 0;
    record.start = now;
  }

  record.count += 1;
  attempts.set(key, record);

  return record.count <= limit;
}
