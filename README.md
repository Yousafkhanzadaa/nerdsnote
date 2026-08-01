# NerdsNote

A free, private, local-first online notepad. NerdsNote opens straight into a clean
browser editor — no account, no ads. Notes are stored on your device by default;
sharing is strictly opt-in.

Live at [nerdsnote.com](https://nerdsnote.com).

## Features

- **Local-first** — notes are saved to your browser (`localStorage`) automatically as you type.
- **Optional local folder sync** — on supported desktop browsers, connect a real folder via the
  File System Access API and notes are written as `.txt` files you own.
- **Rich text editing** — powered by [TipTap](https://tiptap.dev) (headings, lists, checklists, code, quotes).
- **Share links** — generate a read-only, expiring public link for a single note (opt-in).
- Dark mode, full-text search, import (`.txt`/`.md` and NerdsNote JSON backups), export, distraction-free focus mode, and offline use.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS + Radix UI primitives
- [Upstash Redis](https://upstash.com/docs/redis) for expiring share links, feedback, and IP rate limiting
- Vitest for unit tests

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # lint source and tests
npm run typecheck
npm test        # run the test suite
```

## Environment variables

Share links and feedback rely on an Upstash-compatible Redis REST endpoint. Configure
either variable pair in production (and in `.env.local` for local testing):

```bash
# Existing Vercel Marketplace / KV-style names
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# Or native Upstash names
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Optional: overrides the share-link base URL (defaults to https://nerdsnote.com)
NEXT_PUBLIC_APP_URL=https://nerdsnote.com
```

## Privacy

NerdsNote is local-first by default. Regular notes never leave the browser unless the user
explicitly creates a share link. Share-link content is stored in Redis with a mandatory TTL and is
never logged (only metadata such as slug and size is logged). Feedback is retained for 90 days.
