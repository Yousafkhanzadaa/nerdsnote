import type { NextRequest } from "next/server"

export function getClientIP(request: NextRequest): string {
  const platformForwardedFor = request.headers.get("x-vercel-forwarded-for")
  if (platformForwardedFor) {
    return platformForwardedFor.split(",")[0].trim().slice(0, 128)
  }

  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim().slice(0, 128)
  }

  const realIP = request.headers.get("x-real-ip")
  return realIP?.trim().slice(0, 128) || "unknown"
}
