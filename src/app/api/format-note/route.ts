import { kv } from "@vercel/kv"
import { NextRequest, NextResponse } from "next/server"

import {
  DEFAULT_FORMAT_NOTE_MODEL,
  FORMAT_NOTE_ALLOWED_TAGS,
  FORMAT_NOTE_MAX_CONTENT_SIZE,
  FORMAT_NOTE_RATE_LIMIT_MAX,
  FORMAT_NOTE_RATE_LIMIT_WINDOW,
} from "@/lib/format-note-types"
import type {
  FormatNoteError,
  FormatNoteRequest,
  FormatNoteResponse,
} from "@/lib/format-note-types"

const ALLOWED_TAGS = new Set<string>(FORMAT_NOTE_ALLOWED_TAGS)

function sanitizeFormattedHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z][a-z0-9-]*)(?:\s[^>]*)?>/gi, (tag, tagName: string) => {
      const normalizedTag = tagName.toLowerCase()

      if (!ALLOWED_TAGS.has(normalizedTag)) {
        return ""
      }

      if (tag.startsWith("</")) {
        return `</${normalizedTag}>`
      }

      return normalizedTag === "br" ? "<br>" : `<${normalizedTag}>`
    })
    .trim()
}

function extractOutputText(data: unknown) {
  const response = data as {
    output_text?: unknown
    output?: Array<{
      type?: string
      content?: Array<{
        type?: string
        text?: unknown
      }>
    }>
  }

  if (typeof response.output_text === "string") {
    return response.output_text
  }

  for (const outputItem of response.output ?? []) {
    for (const contentItem of outputItem.content ?? []) {
      if (contentItem.type === "output_text" && typeof contentItem.text === "string") {
        return contentItem.text
      }
    }
  }

  return null
}

function createErrorResponse(error: string, code: FormatNoteError["code"], status: number) {
  return NextResponse.json<FormatNoteError>(
    {
      ok: false,
      error,
      code,
    },
    { status },
  )
}

function getClientIP(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  return request.headers.get("x-real-ip") || "unknown"
}

async function checkRateLimit(ip: string) {
  const key = `rate:format-note:${ip}`

  // Atomic increment so concurrent requests can't slip past the cap.
  const current = await kv.incr(key)

  // Start the fixed window on the first request in it.
  if (current === 1) {
    await kv.expire(key, FORMAT_NOTE_RATE_LIMIT_WINDOW)
  }

  return current <= FORMAT_NOTE_RATE_LIMIT_MAX
}

export async function POST(request: NextRequest) {
  try {
    let body: FormatNoteRequest
    try {
      body = await request.json()
    } catch {
      return createErrorResponse("Invalid JSON body", "SERVER_ERROR", 400)
    }

    const content = typeof body.content === "string" ? body.content.trim() : ""

    if (!content) {
      return createErrorResponse("Note content is empty", "EMPTY_CONTENT", 400)
    }

    const contentSize = new TextEncoder().encode(content).length
    if (contentSize > FORMAT_NOTE_MAX_CONTENT_SIZE) {
      return createErrorResponse(
        `Note is too large to format. Maximum size is ${FORMAT_NOTE_MAX_CONTENT_SIZE / 1024}KB.`,
        "CONTENT_TOO_LARGE",
        413,
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return createErrorResponse(
        "AI formatting is not configured yet.",
        "CONFIGURATION_ERROR",
        503,
      )
    }

    const withinLimit = await checkRateLimit(getClientIP(request))
    if (!withinLimit) {
      return createErrorResponse(
        "AI formatting limit reached. Please try again later.",
        "RATE_LIMITED",
        429,
      )
    }

    let openAiResponse: Response
    try {
      openAiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_FORMAT_MODEL || DEFAULT_FORMAT_NOTE_MODEL,
          store: false,
          reasoning: {
            effort: "low",
          },
          instructions: [
            "You are a conservative note formatter.",
            "First, read and understand the whole note, including its current structure.",
            "Treat existing paragraphs, headings, lists, quotes, code blocks, and spacing as intentional unless they are clearly hurting readability.",
            "If the note is already clear, readable, and reasonably formatted, return changed=false. When unsure whether a change is necessary, choose changed=false.",
            "Only format when there is a clear readability improvement, such as turning raw lines into paragraphs, headings, bullet lists, numbered steps, checklists, quotes, or code blocks.",
            "When formatting, make the smallest useful change. Preserve the user's exact meaning, order, tone, facts, names, numbers, links, tasks, wording, punctuation, spelling, and capitalization.",
            "Do not rewrite, summarize, expand, correct facts, add conclusions, add advice, normalize style, or make the note sound more formal.",
            "When changed=false, formattedHtml should contain the original note content unchanged.",
            `Return safe HTML using only these tags: ${FORMAT_NOTE_ALLOWED_TAGS.join(", ")}.`,
          ].join(" "),
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: content,
                },
              ],
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "formatted_note",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  formattedHtml: {
                    type: "string",
                    description: "The original note HTML when unchanged, or the minimally formatted safe HTML when formatting is needed.",
                  },
                  changed: {
                    type: "boolean",
                    description: "True only when the returned HTML materially improves formatting. False when the original note is already well formatted.",
                  },
                },
                required: ["formattedHtml", "changed"],
              },
            },
          },
          max_output_tokens: 4000,
        }),
      })
    } catch (error) {
      console.error("[format-note] Unable to reach OpenAI:", error)
      return createErrorResponse(
        "AI formatting could not reach OpenAI. Check the server network connection and try again.",
        "OPENAI_ERROR",
        502,
      )
    }

    const data = await openAiResponse.json()

    if (!openAiResponse.ok) {
      console.error("[format-note] OpenAI error:", data)
      return createErrorResponse("Unable to format this note right now.", "OPENAI_ERROR", 502)
    }

    const outputText = extractOutputText(data)
    if (!outputText) {
      return createErrorResponse("AI formatting returned an empty response.", "OPENAI_ERROR", 502)
    }

    let parsedOutput: { formattedHtml?: unknown; changed?: unknown }
    try {
      parsedOutput = JSON.parse(outputText)
    } catch {
      return createErrorResponse("AI formatting returned invalid data.", "OPENAI_ERROR", 502)
    }

    if (typeof parsedOutput.formattedHtml !== "string") {
      return createErrorResponse("AI formatting returned invalid note content.", "OPENAI_ERROR", 502)
    }

    if (typeof parsedOutput.changed !== "boolean") {
      return createErrorResponse("AI formatting returned invalid change status.", "OPENAI_ERROR", 502)
    }

    if (!parsedOutput.changed) {
      return NextResponse.json<FormatNoteResponse>({
        ok: true,
        formattedHtml: content,
        changed: false,
      })
    }

    const formattedHtml = sanitizeFormattedHtml(parsedOutput.formattedHtml)
    if (!formattedHtml) {
      return createErrorResponse("AI formatting returned empty note content.", "OPENAI_ERROR", 502)
    }

    return NextResponse.json<FormatNoteResponse>({
      ok: true,
      formattedHtml,
      changed: parsedOutput.changed,
    })
  } catch (error) {
    console.error("[format-note] Error formatting note:", error)
    return createErrorResponse("Internal server error", "SERVER_ERROR", 500)
  }
}
