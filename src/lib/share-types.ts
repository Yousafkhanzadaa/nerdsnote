// Types for shareable note links feature

export type ExpiryOption = "1d" | "7d" | "30d" | "never";

export interface ShareNoteRequest {
  content: string;
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
  code: "EMPTY_CONTENT" | "CONTENT_TOO_LARGE" | "RATE_LIMITED" | "SERVER_ERROR";
}

export interface StoredNote {
  content: string;
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
export const RATE_LIMIT_MAX = 20; // 20 shares per hour
export const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
export const SLUG_SIZE = 8;
export const MAX_SLUG_RETRIES = 3;
