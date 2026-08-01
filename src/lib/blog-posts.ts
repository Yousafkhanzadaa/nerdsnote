export type BlogSection = {
  id: string
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  steps?: string[]
  template?: string
}

export type BlogSource = {
  label: string
  url: string
}

export type BlogPost = {
  slug: string
  title: string
  seoTitle: string
  description: string
  excerpt: string
  category: string
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  keywords: string[]
  intro: string
  sections: BlogSection[]
  sources: BlogSource[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: "private-online-notepad-no-login",
    title: "How to Take Private Notes Online Without an Account",
    seoTitle: "Private Online Notepad Without Login: A Practical Guide",
    description:
      "Learn how no-login browser notepads store your writing, what private really means, and how to protect and back up important notes.",
    excerpt:
      "A practical privacy checklist for writing in your browser without creating an account or sending every draft to the cloud.",
    category: "Privacy",
    publishedAt: "2026-07-22",
    updatedAt: "2026-08-01",
    readingMinutes: 7,
    keywords: [
      "private online notepad",
      "online notepad without login",
      "no sign up notes",
      "browser notepad privacy",
    ],
    intro:
      "A no-login notepad can be a genuinely useful privacy tool, but only when you understand where the words are stored and what can still remove or expose them. This guide explains the trade-offs plainly so you can choose the right place for each note.",
    sections: [
      {
        id: "what-private-means",
        heading: "What “private” should mean in an online notepad",
        paragraphs: [
          "The word private is often used loosely. For a browser notepad, the most useful question is whether ordinary notes are transmitted to an application server or kept on the device. A local-first notepad keeps the working copy in browser storage and does not require an identity before you type.",
          "That reduces unnecessary data collection, but it does not make the screen secret from your device, browser profile, employer, family members, extensions, or malware. Device security still matters. Treat local-first storage as data minimization, not as a substitute for encryption or a secure computer.",
        ],
      },
      {
        id: "privacy-checklist",
        heading: "A five-point privacy check before you start writing",
        bullets: [
          "No account is required for the basic editor.",
          "The product clearly says where regular notes are stored.",
          "Sharing is a separate, deliberate action rather than the default.",
          "There is an export option so you can keep your own backup.",
          "The privacy policy distinguishes note content from anonymous usage analytics.",
        ],
        paragraphs: [
          "If a tool cannot answer these points in simple language, do not use it for sensitive work. Also check whether a share feature uploads the note, places it in the URL, or encrypts it. Those designs have different risks even when the editor itself is local-first.",
        ],
      },
      {
        id: "use-a-local-first-notepad",
        heading: "How to use a local-first notepad safely",
        steps: [
          "Open the editor and confirm that you can write without signing in.",
          "Use a descriptive title that helps you find the note without placing secrets in the title.",
          "Write and confirm that the app reports a local save.",
          "Export important work as a text file before clearing browser data or changing devices.",
          "Create a share link only for content you are comfortable sending to the intended reader, and choose the shortest useful expiry.",
        ],
        paragraphs: [
          "NerdsNote follows this pattern: regular notes stay in your browser by default, while read-only share links are opt-in. If you never use sharing, your normal note content is not uploaded by the app.",
        ],
      },
      {
        id: "browser-storage-limits",
        heading: "Know the limits of browser storage",
        paragraphs: [
          "Browser local storage is tied to a website origin and browser profile. Clearing site data, using private browsing, removing a profile, or switching devices can make notes disappear. Storage behavior and quotas also vary by browser, so it should not be your only copy of irreplaceable work.",
          "For a quick idea, draft, checklist, or temporary snippet, that trade-off is often reasonable. For legal records, regulated information, passwords, recovery codes, or a manuscript with no backup, use a purpose-built secure system and a tested backup plan.",
        ],
      },
      {
        id: "choose-cloud-instead",
        heading: "When a cloud notes account is the better choice",
        paragraphs: [
          "Use an account-based notes service when automatic multi-device sync, collaborative editing, access recovery, administrative controls, or centrally managed backups matter more than avoiding an account. Local-first and cloud tools solve different problems; neither is automatically right for every note.",
          "A useful rule is to choose the smallest system that safely supports the job. Capture low-risk drafts locally, export anything valuable, and move collaborative or regulated work into the system your team has approved.",
        ],
      },
    ],
    sources: [
      {
        label: "MDN: Window.localStorage",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
      },
      {
        label: "MDN: Browser storage quotas and eviction criteria",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria",
      },
    ],
  },
  {
    slug: "browser-storage-vs-cloud-notes",
    title: "Browser Storage vs Cloud Notes: Where Does Your Writing Live?",
    seoTitle: "Browser Storage vs Cloud Notes: Privacy, Sync, and Backups",
    description:
      "Compare browser-based and cloud note storage for privacy, syncing, backups, sharing, and recovery before choosing a notes app.",
    excerpt:
      "A clear comparison of local browser notes and cloud notes—including privacy, recovery, portability, sharing, and the backup trade-off.",
    category: "How it works",
    publishedAt: "2026-07-26",
    updatedAt: "2026-08-01",
    readingMinutes: 8,
    keywords: [
      "browser storage vs cloud notes",
      "where browser notes are stored",
      "local first notes",
      "localStorage notes",
    ],
    intro:
      "Two note-taking apps can look almost identical while storing your writing in completely different places. One may keep it inside your browser profile; another may upload every edit to an account. The difference affects privacy, recovery, sharing, and what happens when you change devices.",
    sections: [
      {
        id: "browser-notes",
        heading: "How browser-stored notes work",
        paragraphs: [
          "A browser-stored notepad saves data for a specific website inside the browser profile on your device. The website can read that data when you return to the same origin in the same profile. This makes instant, account-free writing possible and keeps routine note content out of an application database.",
          "The trade-off is that the browser is now part of your storage system. If its site data is cleared or the profile is lost, the note can be lost too. A second device will not automatically see the same notes unless the app adds a separate sync feature.",
        ],
      },
      {
        id: "cloud-notes",
        heading: "How cloud notes work",
        paragraphs: [
          "A cloud notes service associates your writing with an account and stores a server-side copy. That makes cross-device access, collaboration, history, and account recovery easier. It also means the provider receives and processes the content according to its security design, privacy policy, retention rules, and business model.",
          "Some cloud services add end-to-end encryption, while others encrypt data in transit and at rest but can still process it on their servers. If confidentiality matters, read the product's actual security documentation rather than assuming that the word cloud describes one standard design.",
        ],
      },
      {
        id: "side-by-side",
        heading: "The practical differences",
        bullets: [
          "Privacy: local-first tools minimize routine server collection; cloud tools require trust in the provider and account security.",
          "Sync: browser storage is usually device-and-profile specific; cloud notes are designed for multiple devices.",
          "Recovery: local notes depend on your exports or folder backups; cloud notes may offer version history and account recovery.",
          "Collaboration: local-first editors need an explicit sharing mechanism; cloud tools commonly support live co-editing.",
          "Portability: either model can be portable, but only if the product offers useful export formats.",
        ],
      },
      {
        id: "backup-plan",
        heading: "A simple backup plan for browser notes",
        steps: [
          "Export notes that would be painful to recreate.",
          "Store the exported files in a folder covered by your normal device backup.",
          "Use clear filenames with a topic and date.",
          "Open a sample export occasionally to confirm the backup is readable.",
          "Export again before clearing browser data, reinstalling a browser, or changing devices.",
        ],
        paragraphs: [
          "Plain text is a strong backup format because it opens almost everywhere and is easy to search, copy, compare, and migrate. The important part is not the extension; it is having another verified copy outside the browser profile.",
        ],
      },
      {
        id: "hybrid-workflow",
        heading: "The hybrid workflow is often the most practical",
        paragraphs: [
          "You do not have to make one storage choice for every thought. A local-first notepad is excellent for quick capture, private drafts, temporary snippets, and writing before you decide where something belongs. Exported files or approved cloud systems can hold the material that needs durable backup, collaboration, or access from several devices.",
          "NerdsNote supports this hybrid approach with browser storage by default, plain-text import and export, optional local folder access in supported browsers, and deliberate read-only sharing when you need it.",
        ],
      },
    ],
    sources: [
      {
        label: "MDN: Web Storage API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
      },
      {
        label: "W3C: Web Storage specification",
        url: "https://www.w3.org/TR/webstorage/",
      },
    ],
  },
  {
    slug: "how-to-take-better-meeting-notes",
    title: "How to Take Better Meeting Notes (With a Simple Template)",
    seoTitle: "How to Take Better Meeting Notes: Template and Examples",
    description:
      "Use a simple meeting notes template to capture decisions, action items, owners, deadlines, and follow-ups without transcribing everything.",
    excerpt:
      "A lightweight meeting-notes method that separates discussion from decisions and turns action items into clear follow-up.",
    category: "Writing workflows",
    publishedAt: "2026-07-30",
    updatedAt: "2026-08-01",
    readingMinutes: 6,
    keywords: [
      "how to take meeting notes",
      "meeting notes template",
      "meeting minutes example",
      "action item notes",
    ],
    intro:
      "Good meeting notes are not a transcript. They are a compact record of why the meeting happened, what was decided, who owns the next action, and when the group will check progress. A consistent template makes that record faster to write and easier to use.",
    sections: [
      {
        id: "prepare",
        heading: "Prepare the note before the meeting starts",
        paragraphs: [
          "Create the note a few minutes early and add the meeting title, date, attendees, objective, and agenda. This removes administrative typing from the live conversation and gives every new point a place to go.",
          "If an agenda item needs a decision, write the decision question beside it. For example: “Choose the launch date” is easier to resolve than the vague heading “Launch discussion.”",
        ],
      },
      {
        id: "template",
        heading: "A simple meeting notes template",
        template:
          "Meeting: [name]\nDate: [YYYY-MM-DD]\nAttendees: [names]\nObjective: [one sentence]\n\nAgenda\n1. [topic]\n2. [topic]\n\nKey points\n- [context worth remembering]\n\nDecisions\n- [decision and reason]\n\nAction items\n- [ ] [owner] — [task] — due [date]\n\nOpen questions\n- [question] — owner [name]\n\nNext check-in\n- [date or trigger]",
        paragraphs: [
          "Keep the labels even when a section is empty. An empty Decisions section is useful information: it shows that the group discussed something without settling it. An empty Action items section can reveal that the meeting ended without a concrete next step.",
        ],
      },
      {
        id: "capture",
        heading: "Capture outcomes, not every sentence",
        bullets: [
          "Write a short key point only when it changes the decision or adds necessary context.",
          "Record decisions in direct language: what was chosen, not the entire debate.",
          "Give each action one owner, one observable task, and a realistic date.",
          "Move unresolved items into Open questions instead of leaving them buried in discussion notes.",
          "Use names consistently so action items remain searchable.",
        ],
        paragraphs: [
          "When the conversation moves quickly, mark an uncertain detail with a question mark and keep listening. It is usually better to confirm one line at the end than to miss the next five minutes while polishing a sentence.",
        ],
      },
      {
        id: "review",
        heading: "Use the five-minute review",
        steps: [
          "Rewrite unclear fragments while the conversation is still fresh.",
          "Read each decision and action item aloud or send it to the group for confirmation.",
          "Add missing owners and dates.",
          "Remove duplicated discussion that does not help a future reader.",
          "Export or file the note where the people responsible can find it.",
        ],
        paragraphs: [
          "This short review creates more value than writing a longer transcript. The note becomes a working control document for the next step rather than a pile of text nobody revisits.",
        ],
      },
      {
        id: "privacy",
        heading: "Keep sensitive meeting notes in the right place",
        paragraphs: [
          "Match the storage location to the material. Personal reminders and low-risk drafts may be fine in a local browser note. Confidential client data, personnel matters, regulated information, and company records should follow your organization's approved tools and retention rules.",
          "If you create a share link, review the note first, remove private side comments, confirm the expiry, and send it only through an appropriate channel. A convenient link is still a copy of information being shared.",
        ],
      },
    ],
    sources: [
      {
        label: "NerdsNote privacy policy",
        url: "https://nerdsnote.com/privacy",
      },
    ],
  },
]

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}

export function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))
}
