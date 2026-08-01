import { nanoid } from "nanoid"
import { NextRequest, NextResponse } from "next/server"

import { withinFixedWindowRateLimit } from "@/lib/rate-limit"
import { getRedis } from "@/lib/redis"
import { getClientIP } from "@/lib/request-ip"

const MAX_FEEDBACK_LENGTH = 4_000
const MAX_EMAIL_LENGTH = 254
const FEEDBACK_TTL_SECONDS = 90 * 24 * 60 * 60
const FEEDBACK_RATE_LIMIT = 5
const FEEDBACK_RATE_WINDOW = 60 * 60

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const content =
      body && typeof body === "object" && "content" in body
        ? (body as { content?: unknown }).content
        : null
    const emailValue =
      body && typeof body === "object" && "email" in body
        ? (body as { email?: unknown }).email
        : null

    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Feedback cannot be empty" }, { status: 400 })
    }
    if (content.length > MAX_FEEDBACK_LENGTH) {
      return NextResponse.json({ error: "Feedback is too long" }, { status: 413 })
    }

    const email = typeof emailValue === "string" ? emailValue.trim() : ""
    if (email.length > MAX_EMAIL_LENGTH || (email && !isValidEmail(email))) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
    }

    const clientIP = getClientIP(request)
    const withinLimit = await withinFixedWindowRateLimit(
      `rate:feedback:${clientIP}`,
      FEEDBACK_RATE_LIMIT,
      FEEDBACK_RATE_WINDOW,
    )
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please try again later." },
        { status: 429 },
      )
    }

    const id = nanoid(12)
    await getRedis().set(
      `feedback:${id}`,
      {
        content: content.trim(),
        email: email || null,
        createdAt: new Date().toISOString(),
        userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null,
      },
      { ex: FEEDBACK_TTL_SECONDS },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[feedback] Error storing feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
