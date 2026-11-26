# Shareable Note Links — Deployment Guide

This document covers the shareable note links feature, including setup, environment variables, and verification steps.

## Overview

Sharing publishes a read-only snapshot in Vercel KV (Redis-compatible). An optional title of up to 120 characters is visible to readers. The notebook title stays local. Anyone with the URL can read or save the shared copy.

**Key Features:**
- One-click "Create Link" from the editor
- Short URLs: `https://<site>/s/<slug>`
- Configurable expiry: 1 day, 7 days (default), 30 days, or never (API only)
- Read-only public page with OG meta tags for social previews
- Rate limiting: 20 shares per hour per IP
- Notes can contain embedded PNG, JPEG, and WebP images, including notes with only images.
- On link creation, the editor redraws each image on the device. The shared copy is at most 960 pixels on its longest edge and 80 KiB per image before base64 encoding. Image-heavy notes may use smaller copies to fit the request limit. Charts include their labels and values in the image description. Local notes and folder backups keep their saved images.
- Each embedded image can be up to 512 KiB before base64 encoding. The UTF-8 JSON request can be up to 2 MiB. Note text and formatting, including image descriptions, can use up to 50 KiB.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
├─────────────────────────────────────────────────────────────┤
│  notepad-client.tsx                                         │
│    └── CreateShareLinkDialog                                │
│         • Consent modal with expiry selection               │
│         • POST /api/share → receives URL                    │
│         • Copy link or share QR code                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                             │
├─────────────────────────────────────────────────────────────┤
│  POST /api/share                                            │
│    • Validate content (size, empty)                         │
│    • Check rate limit (per IP)                              │
│    • Generate a 21-character Nano ID                        │
│    • Store in KV using SET NX and optional TTL              │
│    • Return { url, slug, expiresAt }                        │
├─────────────────────────────────────────────────────────────┤
│  GET /api/share/[slug]                                      │
│    • Fetch note from KV                                     │
│    • Return content, optional title, and timestamps         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SSR Page                                 │
├─────────────────────────────────────────────────────────────┤
│  /s/[slug]/page.tsx                                         │
│    • Server-side fetch from KV                              │
│    • Use generic social previews                            │
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
# {"ok":true,"url":"https://nerdsnote.com/s/V1StGXR8_Z5jdHi6B-myT","slug":"V1StGXR8_Z5jdHi6B-myT","expiresAt":"2026-02-13T18:00:00.000Z"}
```

### Manual Verification Checklist

- [ ] Create note → Click "Create Link" → Consent modal appears
- [ ] Select expiry → Click "Create Link" → Copy the URL using the copy button
- [ ] Open `/s/<slug>` → Read-only note page displays
- [ ] Share link in Slack/Discord → OG preview shows generic text
- [ ] Wait for expiry or delete key → the unavailable-note page appears
- [ ] Send 21 requests in 1 hour → 429 rate limit response
- [ ] Share an image-only note and verify the image appears in the reader.
- [ ] Send more than 50 KiB of text or more than 2 MiB of JSON and verify a 413 response.

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

1. **XSS Prevention**: The reader sanitizes rich text with a DOMPurify allowlist. React renders the reader-facing title as text.
2. **Rate Limiting**: 20 shares per hour per IP via KV counter with TTL
3. **Embedded images**. The API parses the HTML and validates each embedded raster source. The reader filters image sources before displaying the note and strips alternative image URLs. Image bytes are included in the shared snapshot.
4. **No Content Logging**: The share handlers omit note content, bearer tokens, and raw storage errors from application logs.
5. **Auto-Expiry**: Notes expire by default (7 days) to limit data retention

Existing eight-character links still resolve. Shared responses request private, no-store caching. The reader uses generic social metadata and a no-referrer policy.
