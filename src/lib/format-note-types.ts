export interface FormatNoteRequest {
  content: string
}

export interface FormatNoteResponse {
  ok: true
  formattedHtml: string
  changed: boolean
}

export interface FormatNoteError {
  ok: false
  error: string
  code:
    | "EMPTY_CONTENT"
    | "CONTENT_TOO_LARGE"
    | "RATE_LIMITED"
    | "CONFIGURATION_ERROR"
    | "OPENAI_ERROR"
    | "SERVER_ERROR"
}

export const FORMAT_NOTE_MAX_CONTENT_SIZE = 20 * 1024
export const FORMAT_NOTE_RATE_LIMIT_MAX = 20
export const FORMAT_NOTE_RATE_LIMIT_WINDOW = 3600
export const DEFAULT_FORMAT_NOTE_MODEL = "gpt-5-nano"

/**
 * The single allow-list of HTML tags permitted in AI-formatted notes.
 * Shared by the server-side sanitizer, the client-side DOMPurify pass, and the
 * model instructions so the three never drift apart.
 */
export const FORMAT_NOTE_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
] as const
