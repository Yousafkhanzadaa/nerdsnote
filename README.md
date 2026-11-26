# NerdsNote

A free, private, local-first online notepad. NerdsNote opens straight into a clean
browser editor — no account, no ads. Notes are stored on your device by default;
sharing is strictly opt-in. The homepage has a quick draft that you can carry into the full editor.

Live at [nerdsnote.com](https://nerdsnote.com).

## Features

- **Local-first** — notes are saved to your browser (`localStorage`) automatically as you type.
- **Optional local folder sync** — on supported desktop browsers, connect a real folder via the
  File System Access API and notes are written as `.txt` files you own.
- **Rich text editing** — powered by [TipTap](https://tiptap.dev) (headings, lists, checklists, code, quotes). Select a passage in the notebook and choose **Highlight**. Choose a marker color under **Format → More**, or toggle the current marker with **Ctrl+Shift+H** (**⌘⇧H** on Mac).
- **Images** — insert, paste, or drop a PNG, JPEG, or WebP up to 12 MiB. The browser resizes it locally and embeds it in the note. Connected-folder files, image backups, and shared snapshots include the picture. Plain-text downloads include its description.
- **Charts** — choose Format → Chart to preview a bar, column, line, pie, donut, or scatter chart. Enter category labels and values, or X and Y measurements for a scatter chart. Inserting it saves a local image with a text description of the data.
- **Share links** — generate a read-only, expiring public link for a single note. The editor prepares compact image copies on the device before uploading the snapshot.
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

Existing notebooks use the browser's `nerds-note-data` key and the remembered folder handle in IndexedDB. Opening the editor reads the notes in place. When browser and folder versions differ, the notebook shows both. Browser storage belongs to the site's origin and browser profile, so a localhost preview has its own notebook.

NerdsNote is local-first by default. Regular notes never leave the browser unless the user
explicitly creates a share link. Share-link content is stored in Vercel KV with a TTL and is
excluded from application logs along with the link token. Link previews use generic metadata.
