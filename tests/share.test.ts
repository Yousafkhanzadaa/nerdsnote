import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { redisMock, nanoidMock } = vi.hoisted(() => ({
  redisMock: {
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    del: vi.fn(),
  },
  nanoidMock: vi.fn((size: number) => (size === 8 ? "abc12345" : "r".repeat(size))),
}))

vi.mock("@/lib/redis", () => ({ getRedis: () => redisMock }))
vi.mock("nanoid", () => ({ nanoid: nanoidMock }))

import { POST } from "@/app/api/share/route"
import { DELETE } from "@/app/api/share/[slug]/route"
import {
  EXPIRY_SECONDS,
  MAX_CONTENT_SIZE,
  RATE_LIMIT_MAX,
  SLUG_SIZE,
} from "@/lib/share-types"
import { hashShareRevokeToken } from "@/lib/share-token"

function shareRequest(body: unknown) {
  return new NextRequest("http://localhost/api/share", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.8" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  redisMock.incr.mockResolvedValue(1)
  redisMock.expire.mockResolvedValue(1)
  redisMock.get.mockResolvedValue(null)
  redisMock.set.mockResolvedValue("OK")
  redisMock.del.mockResolvedValue(1)
})

describe("share constants", () => {
  it("uses bounded expiry options and documented limits", () => {
    expect(EXPIRY_SECONDS).toEqual({ "1d": 86400, "7d": 604800, "30d": 2592000 })
    expect(MAX_CONTENT_SIZE).toBe(50 * 1024)
    expect(RATE_LIMIT_MAX).toBe(20)
    expect(SLUG_SIZE).toBe(8)
  })
})

describe("POST /api/share", () => {
  it("stores a share with a TTL and only the hash of its revocation token", async () => {
    const response = await POST(shareRequest({ content: "<p>Safe note</p>", expiresIn: "7d" }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      ok: true,
      slug: "abc12345",
      url: "https://nerdsnote.com/s/abc12345",
      revokeToken: "r".repeat(32),
    })
    expect(redisMock.set).toHaveBeenCalledWith(
      "note:abc12345",
      expect.objectContaining({
        content: "<p>Safe note</p>",
        revokeTokenHash: hashShareRevokeToken("r".repeat(32)),
      }),
      { ex: EXPIRY_SECONDS["7d"] },
    )
    expect(JSON.stringify(redisMock.set.mock.calls[0])).not.toContain(`\"${"r".repeat(32)}\"`)
  })

  it("rejects permanent links and non-string content before storage", async () => {
    const permanent = await POST(shareRequest({ content: "note", expiresIn: "never" }))
    const malformed = await POST(shareRequest({ content: 42, expiresIn: "7d" }))

    expect(permanent.status).toBe(400)
    expect(malformed.status).toBe(400)
    expect(redisMock.set).not.toHaveBeenCalled()
  })

  it("returns 429 after the fixed-window limit", async () => {
    redisMock.incr.mockResolvedValue(RATE_LIMIT_MAX + 1)
    const response = await POST(shareRequest({ content: "note", expiresIn: "1d" }))

    expect(response.status).toBe(429)
    expect(redisMock.get).not.toHaveBeenCalled()
  })
})

describe("DELETE /api/share/[slug]", () => {
  it("revokes a share only with its secret token", async () => {
    const revokeToken = "secret-revocation-token-123456"
    redisMock.get.mockResolvedValue({
      content: "note",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000).toISOString(),
      revokeTokenHash: hashShareRevokeToken(revokeToken),
    })
    const request = new NextRequest("http://localhost/api/share/abc12345", {
      method: "DELETE",
      body: JSON.stringify({ revokeToken }),
    })
    const response = await DELETE(request, { params: Promise.resolve({ slug: "abc12345" }) })

    expect(response.status).toBe(200)
    expect(redisMock.del).toHaveBeenCalledWith("note:abc12345")
  })

  it("does not delete when the token is wrong", async () => {
    redisMock.get.mockResolvedValue({ revokeTokenHash: hashShareRevokeToken("different-secret-token-123") })
    const request = new NextRequest("http://localhost/api/share/abc12345", {
      method: "DELETE",
      body: JSON.stringify({ revokeToken: "wrong-revocation-token-123" }),
    })
    const response = await DELETE(request, { params: Promise.resolve({ slug: "abc12345" }) })

    expect(response.status).toBe(403)
    expect(redisMock.del).not.toHaveBeenCalled()
  })
})
