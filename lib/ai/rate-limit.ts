/**
 * In-memory Rate Limiter for MVP
 * Production에서는 Vercel KV로 교체 권장
 *
 * Hard Limits:
 * - Per-user: 30 calls/day
 * - Global: 1500 calls/day
 */

const userCounts = new Map<string, { count: number; resetAt: number }>();
let globalCount = { count: 0, resetAt: getNextReset() };

function getNextReset(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  return tomorrow.getTime();
}

function resetIfExpired() {
  const now = Date.now();
  if (now > globalCount.resetAt) {
    globalCount = { count: 0, resetAt: getNextReset() };
    userCounts.clear();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  message?: string;
}

const PER_USER_LIMIT = 30;
const GLOBAL_LIMIT = 1500;

export function checkRateLimit(userId: string): RateLimitResult {
  resetIfExpired();

  // Global check
  if (globalCount.count >= GLOBAL_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      message: "오늘은 잠시 쉴게요. 내일 다시 만나요.",
    };
  }

  // Per-user check
  const userEntry = userCounts.get(userId);
  const userCount = userEntry?.count ?? 0;

  if (userCount >= PER_USER_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      message: "오늘의 제안은 여기까지예요. 내일 다시 도와드릴게요.",
    };
  }

  // Increment
  globalCount.count++;
  userCounts.set(userId, {
    count: userCount + 1,
    resetAt: globalCount.resetAt,
  });

  return {
    allowed: true,
    remaining: PER_USER_LIMIT - userCount - 1,
  };
}
