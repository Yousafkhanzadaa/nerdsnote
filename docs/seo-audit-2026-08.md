# NerdsNote SEO audit and growth plan

Audit date: 2026-08-01  
Production site: https://nerdsnote.com  
Primary market: English-language users looking for a fast, private online notepad

## Executive assessment

NerdsNote has a healthy technical foundation: production pages return `200`, the homepage is statically rendered, Google can read the main content, canonical URLs and descriptions are present, shared-note pages are `noindex`, and robots.txt points to a valid XML sitemap. The homepage and editor already appear in web search.

The largest constraint is not a missing meta tag. It is topical depth and authority. Before this work the site had seven indexable product/policy pages, almost no informational search coverage, and few reasons for other sites to reference it. The competitive results for “free online notepad no login” pair a working editor with substantial explanations of privacy, browser storage, offline behavior, import/export, and common workflows.

The recommended strategy is to protect the fast editor experience while building a small, high-quality knowledge layer around real user questions. Avoid bulk AI articles, near-duplicate keyword pages, and generic “SEO content.”

## What was already strong

- HTTPS, HSTS, Vercel edge delivery, static homepage rendering, and a `200` production response.
- A unique homepage title, description, canonical URL, Open Graph card, Twitter card, app icons, and manifest.
- One clear homepage `h1`, logical `h2`/`h3` sections, readable copy, and descriptive internal anchors.
- Valid robots and sitemap routes. `/api/` is blocked from crawling, and public share URLs are set to `noindex` in page metadata.
- `WebSite` and `SoftwareApplication` structured data, plus breadcrumb markup on secondary pages.
- Useful trust pages: About, Privacy, Terms, and Contact.
- Vercel Analytics and Speed Insights are already included, creating a path to performance monitoring.

## Gaps found and changes made

### 1. Limited coverage beyond the product query

The old architecture targeted “free online notepad,” “private online notepad,” and feature variations on the homepage and editor, but did not answer adjacent searches with dedicated pages.

Implemented:

- `/blog` guide hub.
- `/blog/private-online-notepad-no-login` for privacy and no-account intent.
- `/blog/browser-storage-vs-cloud-notes` for storage, backup, and local-first intent.
- `/blog/how-to-take-better-meeting-notes` for a practical workflow and template intent.
- Contextual links from the homepage, related-guide links between articles, clear table-of-contents anchors, and editor CTAs.
- Original source links and explicit limitations so the content is useful and trustworthy rather than promotional filler.

### 2. Structured data was too broad and partly obsolete

`SoftwareApplication` markup was injected on every route, including policy pages where it was not the main subject. The homepage and About page also used FAQ schema. Google deprecated FAQ rich results on 2026-05-07 and removed its documentation in June 2026.

Implemented:

- Global markup now describes the NerdsNote organization and website.
- `SoftwareApplication` markup is scoped to the homepage, where the app is the main entity.
- FAQ schema was removed while the visible, useful FAQ content remains.
- Blog and article pages now use `Blog`, `BlogPosting`, and `BreadcrumbList` markup with publication dates, update dates, authorship, canonical entities, and publisher references.

### 3. Weak freshness and publication discovery signals

The sitemap listed canonical pages but did not include accurate `lastmod` values or any content pages.

Implemented:

- Added the guide hub and every article to the sitemap.
- Added accurate per-page and per-article `lastModified` values.
- Added `/feed.xml` and RSS discovery metadata.
- Expanded `llms.txt` for services that choose to use it. Google explicitly says `llms.txt` neither helps nor harms Google visibility, so it is maintained as a secondary machine-readable reference—not an SEO ranking tactic.

### 4. Low-value metadata and entity ambiguity

Google does not use the meta-keywords tag. The old organization ID referred to the studio domain while combining it with NerdsNote assets, making the publisher entity less clear.

Implemented:

- Removed global meta keywords.
- Created a consistent NerdsNote organization entity, with Khueon Studios represented as the parent organization.
- Added a site-name alternate (`Nerds Note`) to the `WebSite` entity.

### 5. Mobile LCP and unnecessary editor loading

A Lighthouse mobile run against the live pre-change homepage scored 82 for performance, 100 for accessibility, 100 for best practices, and 100 for SEO. FCP was 0.9 seconds, LCP was 4.2 seconds, total blocking time was 80 ms, and CLS was 0. Lighthouse attributed most LCP time to element render delay and reported about 280 KiB of unused JavaScript, primarily the editor stack being prefetched from homepage links.

Implemented:

- Removed the entrance animation from the above-the-fold hero and editor preview so primary content can paint immediately.
- Disabled automatic Next.js prefetching on marketing links to `/notepad`. The editor now loads when the user asks for it instead of downloading TipTap, Firebase, and related editor code during a landing-page visit.
- Kept the actual links as normal crawlable anchors and preserved client-side navigation.

A post-change Lighthouse run against the local production build scored 94 for performance and 100 for SEO. LCP improved from 4.2 to 3.1 seconds, total blocking time from 80 to 20 ms, speed index from 5.1 to 0.9 seconds, and estimated unused JavaScript from 280 to 28 KiB. Run the same mobile test after deployment to confirm the production improvement; a local result is not a substitute for field data.

## Search-intent map

| Page | Primary intent | Supporting intent | Desired action |
| --- | --- | --- | --- |
| `/` | free online notepad; private online notepad | no login, local-first, quick notes | Open editor |
| `/notepad` | online notepad/editor | autosave, browser notepad | Start writing |
| `/features` | online notepad features | dark mode, import/export, local folder | Compare and open editor |
| `/blog/private-online-notepad-no-login` | private online notepad without login | no-sign-up notes, browser privacy | Understand risk, open editor |
| `/blog/browser-storage-vs-cloud-notes` | browser storage vs cloud notes | localStorage notes, backup browser notes | Choose workflow, export/back up |
| `/blog/how-to-take-better-meeting-notes` | how to take meeting notes | meeting-notes template, action items | Use template in editor |
| `/about` | NerdsNote trust/entity query | who built NerdsNote | Build confidence |

Do not create separate thin pages for every wording variation. Google can understand synonyms, and its current guidance warns against scaled pages created mainly to capture query variations.

## Competitive observations

The sampled search results—Notepad Neo, The Notpad, freenotepad.app, online-notepad.io, and Notepad Free—consistently emphasize the same baseline promises: free, no login, client-side storage, autosave, offline use, export, and multiple notes. NerdsNote already communicates most of these.

Differentiation should therefore come from evidence and clarity rather than repeating the same adjectives:

- Explain exactly when content stays local and when a share action uploads it.
- Make backup limitations prominent instead of implying local storage is permanent.
- Publish practical workflows that can be used immediately in the product.
- Demonstrate local-folder ownership and expiring share links with screenshots or short videos.
- Keep the editor fast and avoid popups, intrusive ads, or a signup wall.

## 90-day growth program

### Days 0–14: deploy and establish the baseline

1. Deploy these changes.
2. Verify the domain property in Google Search Console and Bing Webmaster Tools.
3. Submit `https://nerdsnote.com/sitemap.xml` in both tools.
4. Inspect the homepage, editor, guide hub, and all three articles with Search Console URL Inspection; request indexing only after production validation.
5. Run Rich Results Test on the homepage and one article.
6. Record a baseline for impressions, clicks, CTR, average position, indexed pages, branded/non-branded queries, and editor CTA clicks.
7. Use Search Console's Core Web Vitals report for field data. Target LCP under 2.5 seconds, INP under 200 ms, and CLS under 0.1 at the 75th percentile.

### Days 15–45: improve pages using real query data

1. In Search Console, compare each guide's queries, impressions, CTR, and position.
2. Rewrite titles or descriptions only where impressions exist but CTR is weak; do not change them every few days.
3. Add missing sections when real queries expose an unanswered need.
4. Add original product screenshots near the most useful explanations, with descriptive alt text and fixed dimensions.
5. Measure clicks from each guide to `/notepad` using an analytics event so organic traffic can be tied to product usage.
6. Publish one or two experience-led pieces, such as a measured comparison of local-folder backup workflows or lessons learned building opt-in expiring share links.

### Days 46–90: build authority without link spam

1. Publish a transparent “how NerdsNote stores data” technical explainer that diagrams normal notes versus opt-in share links.
2. Share genuinely useful guides with privacy, productivity, student, developer, and writing communities where self-promotion is allowed.
3. Seek inclusion in curated privacy-tool, local-first software, PWA, and writing-tool directories; avoid paid bulk submissions.
4. Offer the meeting-notes template to relevant newsletters or resource pages as a useful asset, not a reciprocal-link scheme.
5. Review the query-to-page map monthly and consolidate overlapping content instead of creating cannibalizing pages.

## Content backlog, ordered by opportunity

1. **How NerdsNote stores a note: local draft vs expiring share link** — first-party technical explanation and diagram.
2. **A tested browser-note backup workflow using plain text** — include screenshots and a recovery test.
3. **Local-first note taking for developers: snippets, logs, and scratch notes** — firsthand product workflow.
4. **Lecture notes template for students** — useful template with a worked example, not just tips.
5. **Plain text vs Markdown for long-lived notes** — explain actual import/export behavior and limitations.

Every new article should have a named author or team, a publication/update date, a clear reason NerdsNote has experience with the subject, original examples, relevant sources, and a single primary intent.

## Measurement dashboard

Review monthly, comparing 28-day periods and the same period year over year when available:

- Organic impressions, clicks, CTR, and average position by landing page.
- Non-branded clicks for “online notepad,” privacy/no-login, storage/backup, and workflow clusters.
- Indexed versus submitted sitemap URLs and excluded-page reasons.
- Guide-to-editor CTA click rate.
- New-note creation rate from organic landing sessions.
- Returning users and exported-note events, if instrumented without collecting note content.
- Core Web Vitals by page group.
- Referring domains earned from relevant, editorial sources.

Rankings should be treated as a diagnostic, not the business outcome. The useful outcome is qualified search traffic that opens the editor and returns.

## Remaining technical follow-ups

- The PageSpeed Insights API quota available during this audit was exhausted, so the performance baseline above comes from Lighthouse CLI against the live production URL. Re-run PageSpeed Insights after deployment and use Search Console field data for the decision-making baseline.
- The product says it continues working after the connection drops once loaded. A full offline reload/install experience would require a tested service worker; do not broaden the claim until that behavior exists and has been verified across browsers.
- Give future editorial pages original images or diagrams instead of reusing the same social card everywhere.
- If the English content begins attracting a meaningful non-English audience, localize complete page clusters with translated content and `hreflang`; do not auto-translate isolated pages without maintenance capacity.

## Research sources

- [Google Search: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google Search: Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google Search: Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google Search: Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Google Search: Title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google Search: Meta descriptions and snippets](https://developers.google.com/search/docs/appearance/snippet)
- [Google Search: Sitelinks and internal structure](https://developers.google.com/search/docs/appearance/sitelinks)
- [Google Search: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search documentation updates: FAQ retirement and llms.txt clarification](https://developers.google.com/search/updates)
- [Google Search: SoftwareApplication structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: Browser storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
