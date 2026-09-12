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

export type BlogImage = {
  src: string
  alt: string
  width: number
  height: number
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
  image?: BlogImage
  intro: string
  sections: BlogSection[]
  sources: BlogSource[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: "online-notepad-with-autosave",
    title: "Online Notepad With Auto-Save: What Gets Saved and Where?",
    seoTitle: "Online Notepad With Auto-Save: How It Works",
    description:
      "Learn how an online notepad with auto-save stores your writing, how to confirm a note is saved, and when you still need a separate backup.",
    excerpt:
      "A practical explanation of browser auto-save, local storage, offline access, and the difference between a saved note and a real backup.",
    category: "Browser notes",
    publishedAt: "2026-09-12",
    updatedAt: "2026-09-12",
    readingMinutes: 8,
    keywords: [
      "online notepad with autosave",
      "autosave notes online",
      "browser notepad autosave",
      "online notes that save automatically",
    ],
    image: {
      src: "/blog/online-notepad-autosave.jpg",
      alt: "Browser writing page automatically saving note cards into secure local device storage",
      width: 1200,
      height: 630,
    },
    intro:
      "An online notepad with auto-save records changes while you write, so you do not need to press a Save button after every edit. The important detail is the destination: some tools save inside your browser, some upload to a cloud account, and others write to a file you choose. Knowing which model you are using tells you where the note will reappear—and what could make it disappear.",
    sections: [
      {
        id: "quick-answer",
        heading: "The short answer: auto-save is a behavior, not a location",
        paragraphs: [
          "Auto-save describes when an app records your changes. It does not describe where those changes go. A browser notepad may save locally on the same device, while an account-based notes app may send each update to a remote server. Both can honestly say they auto-save, but their privacy, recovery, and syncing behavior will be different.",
          "Before relying on any writing tool, look for a clear storage label. Useful wording includes “saved in this browser,” “saved to your account,” or “saving to this folder.” If the product never identifies the destination, treat the note as temporary until you export it.",
        ],
      },
      {
        id: "three-autosave-models",
        heading: "Three common ways an online notepad can save",
        bullets: [
          "Browser storage: the note stays in site-specific storage inside the current browser profile. It can survive closing and reopening a normal browser window, but it does not automatically follow you to another browser or device.",
          "Cloud storage: the note is associated with an account and stored on the provider's systems. This usually enables syncing and recovery, while requiring you to trust the provider's privacy and security practices.",
          "Local file storage: the app downloads a copy or, with your permission in a supported browser, writes to a folder on your device. The file can then be included in your normal backup system.",
        ],
        paragraphs: [
          "A tool can combine these models. For example, it can keep the fast working copy in browser storage and let you export important notes as plain-text files. That approach preserves quick access without pretending that browser storage is a complete backup system.",
        ],
      },
      {
        id: "how-nerdsnote-saves",
        heading: "How NerdsNote auto-saves your notes",
        paragraphs: [
          "NerdsNote saves ordinary notes to your browser's local storage as you edit. No account is required, and the working note is not uploaded to NerdsNote's server unless you deliberately create a share link. The status line in the editor says “Auto-saved in browser” when that is the active storage mode.",
          "On supported desktop browsers, you can also connect a local folder. NerdsNote then writes notes as text files in that folder. Folder access is optional and permission-based, so the browser may ask you to reconnect after a permission expires.",
        ],
      },
      {
        id: "test-autosave",
        heading: "How to check that auto-save is working",
        steps: [
          "Create a clearly named test note and type a sentence that you can recognize.",
          "Wait for the editor's saved status instead of closing the tab immediately after the final keystroke.",
          "Reload the page in the same browser profile and confirm that the note returns.",
          "If you connected a folder, open the corresponding text file and verify its latest contents.",
          "Delete the test note only after you understand which copy is the working copy and which is the backup.",
        ],
        paragraphs: [
          "This one-minute test is especially worthwhile before a long writing session. It catches private-browsing mode, disabled storage, expired folder permission, or a different browser profile before you entrust the tool with valuable work.",
        ],
      },
      {
        id: "autosave-is-not-backup",
        heading: "Why an auto-saved note is not automatically backed up",
        paragraphs: [
          "Auto-save protects you from forgetting to click Save. A backup protects you when the original storage is removed, damaged, or no longer accessible. If both the live note and its history exist only in one browser profile, they share the same point of failure.",
          "Browser site data can be removed when you clear browsing data, reset a profile, use an automated cleanup tool, or uninstall software. Notes created in a private or incognito session are normally discarded when that private session ends. Device loss and hardware failure are separate risks that auto-save cannot solve.",
        ],
      },
      {
        id: "safe-workflow",
        heading: "A safer auto-save workflow for important writing",
        steps: [
          "Use browser auto-save for the fast working copy.",
          "Give important notes descriptive titles so exported files are easy to identify.",
          "Export a plain-text copy after a meaningful session or milestone.",
          "Store that file in a backed-up folder or another approved storage location.",
          "Open a recent export occasionally to make sure your backup is readable.",
        ],
        paragraphs: [
          "For quick calculations, disposable snippets, and rough drafts, the browser copy may be enough. For research, client work, study notes, or anything difficult to recreate, keep at least one independent copy outside the browser.",
        ],
      },
      {
        id: "autosave-faq",
        heading: "Does browser auto-save work offline and across devices?",
        paragraphs: [
          "A local-first notepad can continue saving while offline once the app itself is available, because writing to browser storage does not require a network request. The note generally remains tied to the same website, browser profile, and device, however. Opening the same site on another computer will not reveal that local copy.",
          "If automatic cross-device access is essential, choose a trustworthy cloud notes service. If privacy and immediate access matter more, use a local-first notepad and move selected files between devices through your own backup or file-sync workflow.",
        ],
      },
    ],
    sources: [
      {
        label: "MDN: Window.localStorage",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
      },
      {
        label: "MDN: Web Storage API and private browsing behavior",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
      },
      {
        label: "MDN: File System API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/File_System_API",
      },
      {
        label: "NerdsNote privacy policy",
        url: "https://nerdsnote.com/privacy",
      },
    ],
  },
  {
    slug: "take-notes-without-installing-app",
    title: "How to Take Notes on a Computer Without Installing an App",
    seoTitle: "Take Notes Without Installing an App: Step-by-Step",
    description:
      "Take notes on any computer without installing software. Learn how to use a browser notepad safely, save your work, and export portable text files.",
    excerpt:
      "Use a browser-based notepad to capture ideas immediately—without a download, account, or heavyweight document editor.",
    category: "Writing workflows",
    publishedAt: "2026-09-12",
    updatedAt: "2026-09-12",
    readingMinutes: 7,
    keywords: [
      "take notes without installing app",
      "write notes online without download",
      "browser notepad",
      "online notepad no installation",
    ],
    image: {
      src: "/blog/notes-without-installing-app.jpg",
      alt: "Laptop with a browser writing page and a symbol showing that no software installation is needed",
      width: 1200,
      height: 630,
    },
    intro:
      "The quickest way to take notes on a computer without installing software is to open a browser notepad, start typing, and export anything you need to keep. This works well on a borrowed machine, a locked-down work computer, a Chromebook, or any moment when installing a full notes app would create more friction than value.",
    sections: [
      {
        id: "fastest-method",
        heading: "The fastest no-install method",
        steps: [
          "Open a browser-based notepad in a normal browser window.",
          "Confirm whether the editor saves locally, to an account, or only for the current session.",
          "Create a note with a useful title and begin writing.",
          "Check the saved status before closing the page.",
          "Export important notes before leaving a shared computer or clearing browser data.",
        ],
        paragraphs: [
          "NerdsNote opens directly in the browser and does not require an account. It auto-saves regular notes in the current browser profile, supports multiple named notes, and exports plain-text files when you need a durable copy.",
        ],
      },
      {
        id: "what-to-look-for",
        heading: "What to look for in a browser notepad",
        bullets: [
          "A clear explanation of where the note is stored.",
          "A visible save status rather than an unexplained promise.",
          "Export to a common format such as .txt or .md.",
          "No forced account for basic writing.",
          "Search and readable note titles if you plan to keep more than one note.",
          "Offline behavior that is explained rather than implied.",
        ],
        paragraphs: [
          "Avoid choosing by the word free alone. A simple editor is useful only if you know how to return to the note and how to take your work with you. Storage clarity and export matter more than a long list of decorative features.",
        ],
      },
      {
        id: "good-uses",
        heading: "Tasks that suit a no-install notepad",
        bullets: [
          "Capturing an idea before it disappears.",
          "Drafting an email or message before pasting it into another service.",
          "Taking low-risk meeting notes on a temporary workstation.",
          "Cleaning up copied text or arranging a short outline.",
          "Keeping a checklist beside another browser tab.",
          "Writing a code snippet or command that contains no secret credentials.",
        ],
        paragraphs: [
          "The common thread is immediacy. A browser notepad is strongest at the beginning of a task, when you need a blank page now and can decide where the finished material belongs later.",
        ],
      },
      {
        id: "shared-computer",
        heading: "Be careful on a shared or managed computer",
        paragraphs: [
          "Local browser storage is not the same as a private vault. Another person using the same unlocked browser profile may be able to open the site and read its saved notes. Browser extensions, device administrators, monitoring software, and malware can also affect privacy.",
          "On a borrowed or public computer, avoid confidential material. Export only when you can place the file somewhere you control, then remove the note and downloaded file if appropriate. Do not assume that private-browsing mode makes activity invisible to the device owner or network operator.",
        ],
      },
      {
        id: "portable-files",
        heading: "Keep useful notes portable",
        paragraphs: [
          "Plain-text files are a practical bridge between a browser notepad and your long-term system. They open on nearly every operating system, remain searchable, and do not tie the writing to one vendor. A clear filename such as project-kickoff-2026-09-12.txt is easier to recognize than untitled-note.txt.",
          "If you regularly work in the same supported desktop browser, NerdsNote's optional folder connection can save notes as files in a directory you select. Otherwise, use the Export button for individual notes and move those files into a folder covered by your normal backup routine.",
        ],
      },
      {
        id: "when-an-installed-app-is-better",
        heading: "When an installed or account-based app is better",
        paragraphs: [
          "Choose a dedicated notes application when you need dependable cross-device sync, deep operating-system integration, large attachments, live collaboration, organizational administration, or formal records management. Those are broader jobs than instant browser capture.",
          "A useful workflow can include both tools: draft quickly in the browser, export or copy the finished material, and store it in the system appropriate for its value and sensitivity. The goal is not to avoid software at all costs; it is to avoid unnecessary setup when a simple page is enough.",
        ],
      },
    ],
    sources: [
      {
        label: "MDN: Web Storage API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
      },
      {
        label: "Google Chrome Help: How Incognito mode handles site data and downloads",
        url: "https://support.google.com/chrome/answer/95464",
      },
      {
        label: "MDN: File System API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/File_System_API",
      },
    ],
  },
  {
    slug: "will-clearing-cache-delete-browser-notes",
    title: "Will Clearing Your Cache Delete Browser Notes?",
    seoTitle: "Will Clearing Cache Delete Notes? A Safe Backup Guide",
    description:
      "Clearing cached files may not delete browser notes, but clearing cookies and site data can. Learn what to check and how to back up notes first.",
    excerpt:
      "Understand the important difference between cached files and site data, then protect locally saved notes before cleaning your browser.",
    category: "Privacy",
    publishedAt: "2026-09-12",
    updatedAt: "2026-09-12",
    readingMinutes: 7,
    keywords: [
      "will clearing cache delete notes",
      "clear cache browser notes",
      "backup browser notes",
      "does clearing site data delete localStorage",
    ],
    image: {
      src: "/blog/backup-browser-notes.jpg",
      alt: "Browser note cards being copied safely to a folder and backup drive before cleanup",
      width: 1200,
      height: 630,
    },
    intro:
      "Clearing cached images and files by itself usually does not remove notes stored in local browser storage. Clearing cookies and other site data can remove them. Browser cleanup screens often place these choices beside each other, so the safest approach is to export important notes before deleting any browsing data.",
    sections: [
      {
        id: "cache-vs-site-data",
        heading: "Cache and site data are not the same thing",
        paragraphs: [
          "A browser cache holds temporary copies of website resources such as images, styles, and scripts so pages can load faster. Site data is a broader category that can include cookies, localStorage, IndexedDB, and other information a web app keeps for its features.",
          "In Chrome, the cleanup option named “Cookies and other site data” includes Web Storage and IndexedDB data. The separate “Cached images and files” option removes cached page resources. Firefox similarly distinguishes temporary cached files from cookies and site data, although its interface can allow both categories to be cleared together.",
        ],
      },
      {
        id: "direct-answer",
        heading: "So, will your browser notes be deleted?",
        bullets: [
          "Clearing browsing history only: normally no, because the list of visited pages is separate from saved site storage.",
          "Clearing cached images and files only: normally no, although the app may need to download its interface again.",
          "Clearing cookies and other site data: possibly yes; browser-stored notes can be included.",
          "Removing data for the notepad's website: yes, if the notes live in that site's browser storage.",
          "Closing a private or incognito session: yes for notes stored only in that private session.",
        ],
        paragraphs: [
          "Browser labels and behavior can change, and cleanup utilities may combine categories. If a note matters, do not make its survival depend on interpreting one checkbox correctly.",
        ],
      },
      {
        id: "backup-first",
        heading: "Back up NerdsNote before clearing browser data",
        steps: [
          "Open NerdsNote in the same browser profile where you created the notes.",
          "Select an important note and use Export to download it as a .txt file.",
          "Repeat for each note that would be difficult to recreate.",
          "Open at least one downloaded file and confirm that the text is complete.",
          "Move the files into a backed-up folder before clearing cookies or site data.",
        ],
        paragraphs: [
          "If your browser supports NerdsNote's folder connection, you can also save notes directly into a local folder. Confirm that the folder files are current and readable; do not assume a previously granted permission is still active.",
        ],
      },
      {
        id: "safer-cleanup",
        heading: "How to clean the browser with less risk",
        bullets: [
          "Read every selected category before confirming the deletion.",
          "Avoid selecting cookies or site data when your goal is only to refresh cached page resources.",
          "Prefer removing data for one troublesome website over clearing every site's data when the browser offers that control.",
          "Export browser-based work first, even when you believe the chosen category is harmless.",
          "After cleanup, reopen the notepad and verify your notes before deleting the exported copies.",
        ],
      },
      {
        id: "already-cleared",
        heading: "What to do if you already cleared the data",
        paragraphs: [
          "First, make sure you reopened the same website address and browser profile. A note saved under a different browser, profile, device, or website origin will not appear in the current storage area. Also check your Downloads and Documents folders for earlier exports.",
          "If the site's local storage was deleted and no exported, folder-synced, or system backup copy exists, the web app generally cannot reconstruct the note. Local-first privacy means the service may never have received a server copy to restore. Avoid repeatedly installing cleanup or recovery tools on the affected device unless you understand the risk; they can overwrite recoverable data elsewhere and rarely recreate structured browser storage reliably.",
        ],
      },
      {
        id: "backup-habit",
        heading: "Use a backup rhythm you can remember",
        paragraphs: [
          "A simple trigger works better than an elaborate schedule: export after each important meeting, at the end of a study session, or whenever a draft reaches a meaningful milestone. Keep filenames descriptive and place the copies somewhere included in your regular device backup.",
          "Auto-save makes everyday writing smoother. Export makes that writing portable. You need both when the note is worth more than the few seconds it takes to create another copy.",
        ],
      },
    ],
    sources: [
      {
        label: "Google Chrome Help: Delete browsing data",
        url: "https://support.google.com/chrome/answer/2392709",
      },
      {
        label: "Mozilla Support: Clear cookies and site data in Firefox",
        url: "https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox",
      },
      {
        label: "MDN: Window.localStorage",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
      },
    ],
  },
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
