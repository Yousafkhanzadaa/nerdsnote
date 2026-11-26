import { kv } from "@vercel/kv"
import { nanoid } from "nanoid"
import { NextRequest, NextResponse } from "next/server"
import { parseFragment } from "parse5"
import { z } from "zod"
import { richTextToPlainText } from "@/lib/note-content"
import { isSafeNoteImageSrc } from "@/lib/note-images"
import {
  EXPIRY_SECONDS, MAX_CONTENT_SIZE, MAX_SHARE_REQUEST_BYTES, MAX_SHARE_TITLE_LENGTH, MAX_SLUG_RETRIES,
  RATE_LIMIT_MAX, RATE_LIMIT_WINDOW, SHARE_HEADERS,
  type ShareNoteError, type ShareNoteResponse, type StoredNote,
} from "@/lib/share-types"

const shareRequest = z.object({
  content: z.string(),
  title: z.string().trim().max(MAX_SHARE_TITLE_LENGTH).optional(),
  expiresIn: z.enum(["1d", "7d", "30d", "never"]).default("7d"),
})

function shareError(status: number, code: ShareNoteError["code"], error: string) {
  return NextResponse.json<ShareNoteError>({ ok: false, code, error }, { status, headers: SHARE_HEADERS })
}

async function readShareRequest(request: NextRequest) {
  const tooLarge = () => shareError(413, "CONTENT_TOO_LARGE", "The shared note and its images must fit within 2 MiB.")
  if (Number(request.headers.get("content-length")) > MAX_SHARE_REQUEST_BYTES) return tooLarge()
  const reader = request.body?.getReader()
  if (!reader) return shareError(400, "INVALID_REQUEST", "Invalid JSON body")
  const decoder = new TextDecoder()
  let bytes = 0
  let json = ""
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_SHARE_REQUEST_BYTES) {
        void reader.cancel().catch(() => {})
        return tooLarge()
      }
      json += decoder.decode(value, { stream: true })
    }
    return shareRequest.safeParse(JSON.parse(json + decoder.decode()))
  } catch {
    return shareError(400, "INVALID_REQUEST", "Invalid JSON body")
  } finally {
    reader.releaseLock()
  }
}

function validateContent(content: string) {
  let textAndMarkupBytes = new TextEncoder().encode(content).length
  let hasImage = false
  if (content.includes("<")) {
    const pending = parseFragment(content).childNodes.slice()
    while (pending.length) {
      const node = pending.pop()!
      if (!("tagName" in node)) continue
      if (node.tagName === "svg" || node.tagName === "source") {
        return shareError(400, "INVALID_REQUEST", "Use embedded PNG, JPEG, or WebP images.")
      }
      if (node.tagName === "img") {
        const src = node.attrs.find(attr => attr.name === "src")?.value
        if (!src || !isSafeNoteImageSrc(src) || node.attrs.some(attr => attr.name === "srcset")) {
          return shareError(400, "INVALID_REQUEST", "Use embedded PNG, JPEG, or WebP images.")
        }
        // Valid sources contain only ASCII. All markup, alt text, and any
        // extra HTML encoding still count against the regular note limit.
        textAndMarkupBytes -= src.length
        hasImage = true
      }
      for (const child of node.childNodes) pending.push(child)
    }
  }
  if (textAndMarkupBytes > MAX_CONTENT_SIZE) {
    return shareError(413, "CONTENT_TOO_LARGE", "The note text and formatting exceed the 50 KiB limit.")
  }
  if (!hasImage && !richTextToPlainText(content).trim()) {
    return shareError(400, "EMPTY_CONTENT", "Content cannot be empty")
  }
}

export async function POST(request: NextRequest) {
  const parsed = await readShareRequest(request)
  if (parsed instanceof NextResponse) return parsed
  if (!parsed.success) {
    return shareError(400, "INVALID_REQUEST", "Check the note content, title, and expiry.")
  }
  const { content, title, expiresIn } = parsed.data
  const invalid = validateContent(content)
  if (invalid) return invalid

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
      || request.headers.get("x-real-ip") || "unknown"
    const rateKey = `rate:share:${ip}`
    const [count] = await kv.multi()
      .incr(rateKey)
      .expire(rateKey, RATE_LIMIT_WINDOW, "NX")
      .exec()
    if (count > RATE_LIMIT_MAX) {
      return shareError(429, "RATE_LIMITED", "Too many shares. Please try again later.")
    }

    const now = new Date()
    const ttl = expiresIn === "never" ? null : EXPIRY_SECONDS[expiresIn]
    const note: StoredNote = {
      content,
      ...(title && { title }),
      createdAt: now.toISOString(),
      expiresAt: ttl ? new Date(now.getTime() + ttl * 1000).toISOString() : null,
    }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nerdsnote.com"
    for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
      const slug = nanoid()
      const url = new URL(`/s/${slug}`, baseUrl).href
      const stored = await kv.set(`note:${slug}`, note, ttl ? { nx: true, ex: ttl } : { nx: true })
      if (stored === "OK") {
        return NextResponse.json<ShareNoteResponse>(
          { ok: true, url, slug, expiresAt: note.expiresAt },
          { headers: SHARE_HEADERS },
        )
      }
    }
    return shareError(500, "SERVER_ERROR", "Could not create a unique link. Please try again.")
  } catch {
    return shareError(500, "SERVER_ERROR", "Unable to create a share link.")
  }
}
