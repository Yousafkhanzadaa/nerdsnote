# Shareable Note Links — Deployment Guide

NerdsNote can create public, read-only note links backed by Upstash-compatible Redis.

## Behavior and limits

- Expiry is mandatory: 1 day, 7 days (default), or 30 days.
- Notes are limited to 50KB and creation is limited to 20 requests per IP per hour.
- Each link receives a separate revocation secret. Only its SHA-256 hash is stored server-side.
- The creating browser keeps up to 20 unexpired link/revocation pairs in local storage so the user can revoke them.
- Shared HTML is sanitized against a restricted tag and attribute allowlist before rendering.
- Shared pages are `noindex`, and API responses use `private, no-store` caching.

## Environment variables

Use either the existing KV-compatible names or the native Upstash names:

```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# Alternatively:
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_APP_URL` defaults to `https://nerdsnote.com` when omitted.

## API

`POST /api/share`

```json
{ "content": "<p>Hello</p>", "expiresIn": "7d" }
```

The response includes `url`, `slug`, `expiresAt`, and a one-time `revokeToken`. Do not log or expose that token.

`DELETE /api/share/:slug`

```json
{ "revokeToken": "the secret returned at creation" }
```

`GET /api/share/:slug` returns the public content and timestamps.

## Verification

```bash
curl -X POST http://localhost:3000/api/share \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello, world!","expiresIn":"7d"}'
```

- Open the returned URL and confirm the read-only page renders.
- Revoke it from the creator browser and confirm the URL returns 404.
- Confirm `expiresIn: "never"` returns 400.
- Confirm a payload over 50KB returns 413.
- Confirm request 21 from the same IP within one hour returns 429.

## Relevant files

- `src/app/api/share/route.ts` — create link
- `src/app/api/share/[slug]/route.ts` — read and revoke link
- `src/app/s/[slug]/page.tsx` — public page
- `src/components/create-share-link-dialog.tsx` — creation and revocation UI
- `src/lib/redis.ts` — Redis configuration
- `src/lib/share-management.ts` — creator-browser revocation storage
- `tests/share.test.ts` — route and security regression tests
