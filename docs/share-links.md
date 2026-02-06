# Shareable Note Links — Deployment Guide

This document covers the shareable note links feature, including setup, environment variables, and verification steps.

## Overview

The shareable links feature allows users to create public, read-only links to their notes. Notes are stored in Vercel KV (Redis-compatible) with configurable expiry times.

**Key Features:**
- One-click "Create Link" from the editor
- Short URLs: `https://<site>/s/<slug>`
- Configurable expiry: 1 day, 7 days (default), 30 days, or never
- Read-only public page with OG meta tags for social previews
- Rate limiting: 20 shares per hour per IP
- Size limit: 50KB per note

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
├─────────────────────────────────────────────────────────────┤
│  notepad-client.tsx                                         │
│    └── CreateShareLinkDialog                                │
│         • Consent modal with expiry selection               │
│         • POST /api/share → receives URL                    │
│         • Auto-copy to clipboard                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                             │
├─────────────────────────────────────────────────────────────┤
│  POST /api/share                                            │
│    • Validate content (size, empty)                         │
│    • Check rate limit (per IP)                              │
│    • Generate slug with nanoid(8)                           │
│    • Store in Vercel KV with TTL                            │
│    • Return { url, slug, expiresAt }                        │
├─────────────────────────────────────────────────────────────┤
│  GET /api/share/[slug]                                      │
│    • Fetch note from KV                                     │
│    • Return JSON { content, createdAt, expiresAt }          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SSR Page                                 │
├─────────────────────────────────────────────────────────────┤
│  /s/[slug]/page.tsx                                         │
│    • Server-side fetch from KV                              │
│    • Generate OG meta tags (title, description)             │
│    • Render read-only SharedNoteView                        │
│    • Handle 404 with not-found.tsx                          │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KV_REST_API_URL` | Yes | Vercel KV REST API URL (auto-set when KV store attached) |
| `KV_REST_API_TOKEN` | Yes | Vercel KV REST API token (auto-set when KV store attached) |
| `NEXT_PUBLIC_APP_URL` | Yes | Production URL for generating share links (e.g., `https://nerdsnote.com`) |

## Setup Instructions

### 1. Create Vercel KV Store

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database**
3. Select **KV** (Redis-compatible key-value store)
4. Choose a name (e.g., `nerdsnote-kv`) and region
5. Click **Create**

The `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables will be automatically added to your project.

### 2. Add App URL Environment Variable

Add `NEXT_PUBLIC_APP_URL` to your Vercel project:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://nerdsnote.com` (your production URL)
   - **Environments:** Production, Preview, Development

### 3. Local Development

For local development, create or update `.env.local`:

```bash
# Vercel KV (get from Vercel dashboard → Storage → KV → Settings)
KV_REST_API_URL=https://your-kv-url.kv.vercel-storage.com
KV_REST_API_TOKEN=your-token-here

# App URL (use localhost for dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Deploy

Deploy to Vercel:

```bash
vercel deploy --prod
```

## Verification

### Quick Test

```bash
# Create a share link
curl -X POST https://nerdsnote.com/api/share \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, world!", "expiresIn": "7d"}'

# Expected response:
# {"ok":true,"url":"https://nerdsnote.com/s/abc12345","slug":"abc12345","expiresAt":"2026-02-13T18:00:00.000Z"}
```

### Manual Verification Checklist

- [ ] Create note → Click "Create Link" → Consent modal appears
- [ ] Select expiry → Click "Create Link" → URL copied to clipboard
- [ ] Open `/s/<slug>` → Read-only note page displays
- [ ] Share link in Slack/Discord → OG preview shows title and description
- [ ] Wait for expiry or delete key → 404 page with CTA appears
- [ ] Send 21 requests in 1 hour → 429 rate limit response
- [ ] Send >50KB content → 413 size limit response

## File Locations

```
src/
├── app/
│   ├── api/
│   │   └── share/
│   │       ├── route.ts              # POST /api/share
│   │       └── [slug]/
│   │           └── route.ts          # GET /api/share/:slug
│   └── s/
│       └── [slug]/
│           ├── page.tsx              # SSR shared note page
│           ├── shared-note-view.tsx  # Client component
│           └── not-found.tsx         # 404 page
├── components/
│   ├── create-share-link-dialog.tsx  # Consent modal + success UI
│   └── notepad-client.tsx            # Main editor (modified)
├── lib/
│   └── share-types.ts                # Shared types and constants
docs/
└── share-links.md                    # This file
tests/
└── share.test.ts                     # Unit tests
```

## Rollback

To disable the feature temporarily:

1. Delete or rename the API routes:
   - `/src/app/api/share/route.ts`
   - `/src/app/api/share/[slug]/route.ts`
   - `/src/app/s/[slug]/` directory

2. Remove the "Create Link" button from `notepad-client.tsx`

3. Redeploy

To restore, revert the file deletions and redeploy.

## Security Considerations

1. **XSS Prevention**: Notes are rendered as escaped plain text using `<pre>` with HTML entity encoding
2. **Rate Limiting**: 20 shares per hour per IP via KV counter with TTL
3. **Size Limit**: 50KB maximum note size enforced server-side
4. **No Content Logging**: Only metadata (slug, size) is logged, never note content
5. **Auto-Expiry**: Notes expire by default (7 days) to limit data retention
