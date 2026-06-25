# NerdsNote

A free, private, local-first online notepad. NerdsNote opens straight into a clean
browser editor — no account, no ads. Notes are stored on your device by default;
sharing and AI formatting are strictly opt-in.

Live at [nerdsnote.com](https://nerdsnote.com).

## Features

- **Local-first** — notes are saved to your browser (`localStorage`) automatically as you type.
- **Optional local folder sync** — on supported desktop browsers, connect a real folder via the
  File System Access API and notes are written as `.txt` files you own.
- **Rich text editing** — powered by [TipTap](https://tiptap.dev) (headings, lists, checklists, code, quotes).
- **Share links** — generate a read-only, auto-expiring public link for a single note (opt-in).
- **AI formatting** — optionally clean up a note's structure with one keystroke (opt-in, see below).
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
npm run lint    # lint
```

## Environment variables

Share links and AI formatting both rely on Vercel KV. Configure these in production
(and in `.env.local` for local testing of those features):

```bash
# Vercel KV — required for share links and rate limiting
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# Optional: AI note formatting
OPENAI_API_KEY=your_api_key
OPENAI_FORMAT_MODEL=gpt-5-nano   # optional, this is the default

# Optional: overrides the share-link base URL (defaults to https://nerdsnote.com)
NEXT_PUBLIC_APP_URL=https://nerdsnote.com
```

### AI formatting

When `OPENAI_API_KEY` is set, users can format the current note via the **AI Format** button or
`Ctrl/Cmd+Shift+F`. The note text is sent to OpenAI only after explicit, remembered consent.
The `/api/format-note` route is IP rate-limited via Vercel KV, caps note size, and sanitizes the
returned HTML against a strict tag allow-list before it reaches the editor. If `OPENAI_API_KEY`
is unset, the feature degrades gracefully and reports that AI formatting is not configured.

## Privacy

NerdsNote is local-first by default. Regular notes never leave the browser unless the user
explicitly creates a share link or runs AI formatting. Share-link content is stored in Vercel KV
with a TTL and is never logged (only metadata such as slug and size is logged).
</content>
</invoke>
