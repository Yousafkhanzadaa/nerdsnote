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
- Dark mode, full-text search, import (`.txt`/`.md`), export, distraction-free focus mode, and offline use.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS + Radix UI primitives
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) for share-link storage and IP rate limiting
- Vitest for unit tests

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm test        # run the test suite
```

## Environment variables

Share links rely on Vercel KV. Configure these in production (and in `.env.local`
for local testing of sharing):

```bash
# Vercel KV — required for share links and rate limiting
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# Optional: overrides the share-link base URL (defaults to https://nerdsnote.com)
NEXT_PUBLIC_APP_URL=https://nerdsnote.com
```

## Privacy

NerdsNote is local-first by default. Regular notes never leave the browser unless the user
explicitly creates a share link. Share-link content is stored in Vercel KV with a TTL and is
never logged (only metadata such as slug and size is logged).
