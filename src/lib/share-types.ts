// Types for shareable note links feature

export type ExpiryOption = "1d" | "7d" | "30d";

export interface ShareNoteRequest {
  content: string;
  expiresIn?: ExpiryOption;
}

export interface ShareNoteResponse {
  ok: boolean;
  url: string;
  slug: string;
  expiresAt: string;
  revokeToken: string;
}

export interface ShareNoteError {
  ok: false;
  error: string;
  code: "EMPTY_CONTENT" | "CONTENT_TOO_LARGE" | "INVALID_EXPIRY" | "INVALID_REVOKE_TOKEN" | "RATE_LIMITED" | "SERVER_ERROR";
}

export interface StoredNote {
  content: string;
  createdAt: string;
  expiresAt: string;
  revokeTokenHash: string;
}

// Expiry options in seconds
export const EXPIRY_SECONDS: Record<ExpiryOption, number> = {
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
export const REVOKE_TOKEN_SIZE = 32;

export function isExpiryOption(value: unknown): value is ExpiryOption {
  return value === "1d" || value === "7d" || value === "30d";
}
