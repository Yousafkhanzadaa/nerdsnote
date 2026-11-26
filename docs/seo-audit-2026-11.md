# NerdsNote SEO audit

**November 26, 2026** · [Live site](https://nerdsnote.com/) · [Public sitemap](https://nerdsnote.com/sitemap.xml)

## What the live crawl found

Direct HTTP requests to all 14 sitemap URLs returned 200. Each page had a unique title, description and canonical URL on the HTTPS apex. Ordinary browser, Googlebot and Twitterbot user agents received matching public metadata and structured data. All 55 distinct local assets referenced in the crawl responded successfully. These requests establish what the server delivers. The property’s URL Inspection report is the place to verify Google’s selected canonical and indexing status for each page.

| Finding | Change in the local production build |
| --- | --- |
| The homepage’s main heading read “Quick draft”. Its writing area gave a first-time reader little information about what would happen to their notes. | The heading identifies the free online notepad. The draft stays first, followed by an explanation of browser storage, backups and sharing with direct links to the relevant guides. |
| The editor’s server-rendered writing area had no heading or instructions for a reader with JavaScript disabled. | The editor has a workspace heading, a JavaScript-off explanation and a link to its autosave guide. |
| Seven pages sent the homepage title and description in Twitter Card metadata. | The pages now have distinct social titles and descriptions. Public previews use the canonical page URL, and illustrated guides retain their own cover images. |
| The sitemap advertised fixed historical modification dates for several recently changed pages. | Guides and their index use editorial revision dates. Pages without maintained revision dates omit the optional field. The three illustrated guides also identify their cover images. |
| A missing share URL had a protective HTTP header, alongside HTML inherited from the homepage that included positive indexing directives and its canonical. | Generic error pages no longer inherit an instruction to index or a homepage canonical. Shared readers and editor import links send explicit indexing restrictions. |

The verification used a syntactically invalid share for the live 404 check and a successful synthetic share in an isolated local server. The successful reader returned generic social metadata, `noindex, nofollow, nosnippet`, `private, no-store` and `no-referrer`. Its title, body and bearer token were absent from the rendered head. All published guide paths and section anchors were retained. [Google’s guidance on noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

## Search intent and measurement

The supplied Search Console extract showed seven impressions each for “online notes” and “notes website”, and one click for “nerdsnote”. It did not include a date range, landing pages or average positions. The following groups provide a baseline for measuring the release.

| Query group | Landing page and reader need |
| --- | --- |
| “online notes”, “free online notes”, “online notepad”, “private note online” | The homepage lets the visitor write immediately and explains where the draft goes. |
| “does notepad automatically save”, “notepad save” | The existing autosave guide answers the question, shows the actual save status, and links to steps for backing up or recovering a note. |
| “online notebook”, “online note writer” | The editor opens the local notebook. The Features page explains formatting, images, charts and downloads. |
| “nerdsnote”, “nerd notes” | Track branded traffic separately so a change in brand searches cannot mask how discovery queries perform. |

The handwriting query was excluded from the content targets because the editor offers typed notes and image insertion. The update adds no duplicate pages for spelling and word-order variants.

After deployment, inspect the homepage and autosave guide in Search Console to confirm their selected canonicals and crawl dates. Compare clicks, impressions, CTR and average position for the landing pages and query groups over equal 28-day periods. With counts this small, treat a few impressions as preliminary. [Search Console performance report](https://support.google.com/webmasters/answer/7576553) · [Google’s title-link guidance](https://developers.google.com/search/docs/appearance/title-link)

## Hosting and performance

NerdsNote uses `https://nerdsnote.com` as its sole production origin. HTTP requests to that domain redirect permanently to HTTPS. All public canonical URLs and sitemap entries use this same origin, where existing users’ browser notebooks are stored.

Three cold mobile lab loads per live page produced median Largest Contentful Paint of 3.15 seconds on the homepage and 3.26 seconds on the autosave guide. Median Cumulative Layout Shift was 0 and 0.084 respectively. The test used Chrome at 390 × 844, 4× CPU slowdown, 150 ms latency and 1.6 Mbps download. Individual LCP readings varied from about 1 to 6.5 seconds. No field Core Web Vitals or Search Console indexing data were available during the audit. [How lab and field measurements differ](https://web.dev/articles/lab-and-field-data-differences)

## Regression check

Run `npm run check:seo -- http://localhost:3001` against a locally served production build. It walks the advertised sitemap, reads the actual HTTP responses and follows links from the homepage. It checks headings, canonical URLs, unique search and social titles, structured data, robots rules and the indexing headers on a shared URL and an editor import URL.
