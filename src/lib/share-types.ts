// Types for shareable note links feature

export type ExpiryOption = "1d" | "7d" | "30d" | "never";

export interface ShareNoteRequest {
  content: string;
  title?: string;
  expiresIn?: ExpiryOption;
}

export interface ShareNoteResponse {
  ok: boolean;
  url: string;
  slug: string;
  expiresAt: string | null;
}

export interface ShareNoteError {
  ok: false;
  error: string;
  code: "INVALID_REQUEST" | "EMPTY_CONTENT" | "CONTENT_TOO_LARGE" | "RATE_LIMITED" | "SERVER_ERROR";
}

export interface StoredNote {
  content: string;
  title?: string;
  createdAt: string;
  expiresAt: string | null;
}

// Expiry options in seconds
export const EXPIRY_SECONDS: Record<Exclude<ExpiryOption, "never">, number> = {
  "1d": 86400,
  "7d": 604800,
  "30d": 2592000,
};

// Limits
export const MAX_CONTENT_SIZE = 50 * 1024; // 50KB
export const MAX_SHARE_REQUEST_BYTES = 2 * 1024 * 1024; // UTF-8 JSON, including embedded images
export const RATE_LIMIT_MAX = 20; // 20 shares per hour
export const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
export const MAX_SHARE_TITLE_LENGTH = 120;
export const MAX_SLUG_RETRIES = 3;

export const SHARE_HEADERS = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, nosnippet",
};

// Older saved links use eight-character Nano IDs.
export function isShareSlug(slug: string): boolean {
  return /^(?:[\w-]{8}|[\w-]{21})$/.test(slug);
}
