import { Redis } from "@upstash/redis"

let redis: Redis | null = null

export function getRedis() {
  if (redis) {
    return redis
  }

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error("Redis credentials are not configured")
  }

  redis = new Redis({ url, token })
  return redis
}
