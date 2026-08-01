import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { redisMock } = vi.hoisted(() => ({
  redisMock: {
    incr: vi.fn(),
    expire: vi.fn(),
    set: vi.fn(),
  },
}))

vi.mock("@/lib/redis", () => ({ getRedis: () => redisMock }))
vi.mock("nanoid", () => ({ nanoid: () => "feedback123" }))

import { POST } from "@/app/api/feedback/route"

function feedbackRequest(body: unknown) {
  return new NextRequest("http://localhost/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "NerdsNote Test Browser" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  redisMock.incr.mockResolvedValue(1)
  redisMock.expire.mockResolvedValue(1)
  redisMock.set.mockResolvedValue("OK")
})

describe("POST /api/feedback", () => {
  it("stores validated feedback for 90 days", async () => {
    const response = await POST(feedbackRequest({ content: "  Helpful app  ", email: "reader@example.com" }))

    expect(response.status).toBe(200)
    expect(redisMock.set).toHaveBeenCalledWith(
      "feedback:feedback123",
      expect.objectContaining({
        content: "Helpful app",
        email: "reader@example.com",
        userAgent: "NerdsNote Test Browser",
      }),
      { ex: 90 * 24 * 60 * 60 },
    )
  })

  it("rejects invalid email before writing", async () => {
    const response = await POST(feedbackRequest({ content: "Hello", email: "not-an-email" }))

    expect(response.status).toBe(400)
    expect(redisMock.set).not.toHaveBeenCalled()
  })

  it("rate limits repeated submissions", async () => {
    redisMock.incr.mockResolvedValue(6)
    const response = await POST(feedbackRequest({ content: "Hello" }))

    expect(response.status).toBe(429)
    expect(redisMock.set).not.toHaveBeenCalled()
  })
})
