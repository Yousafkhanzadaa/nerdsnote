import { getRedis } from "@/lib/redis"

export async function withinFixedWindowRateLimit(
  key: string,
  maximum: number,
  windowSeconds: number,
) {
  const redis = getRedis()
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, windowSeconds)
  }

  return current <= maximum
}
