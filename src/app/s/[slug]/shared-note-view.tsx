"use client"

import { useEffect, useState } from "react"
import DOMPurify from "dompurify"
import { BookmarkPlus, NotebookPen } from "lucide-react"
import { isSafeNoteImageSrc } from "@/lib/note-images"

interface SharedNoteViewProps {
  title?: string
  content: string
  createdAt: string
  expiresAt: string | null
  openInAppUrl: string
}

const dateOptions: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }
const utcDateFormat = new Intl.DateTimeFormat("en", { ...dateOptions, timeZone: "UTC" })

export default function SharedNoteView({ title, content, createdAt, expiresAt, openInAppUrl }: SharedNoteViewProps) {
  const [sanitizedContent, setSanitizedContent] = useState("")
  const [dateFormat, setDateFormat] = useState(utcDateFormat)

  useEffect(() => {
    setDateFormat(new Intl.DateTimeFormat(undefined, dateOptions))
  }, [])

  useEffect(() => {
    // Template contents belong to an inert document. Inspect image sources
    // before untrusted markup can load any resource in the reader's document.
    const inertDocument = document.createElement("template").content.ownerDocument
    const container = inertDocument.createElement("div")
    container.innerHTML = content
    container.querySelectorAll("img").forEach(img => {
      if (!isSafeNoteImageSrc(img.getAttribute("src"))) {
        img.remove()
      } else if (!img.hasAttribute("alt")) {
        img.alt = ""
      }
    })
    DOMPurify.sanitize(container, {
      IN_PLACE: true,
      ALLOWED_TAGS: [
        "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "strike",
        "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
        "blockquote", "pre", "code", "a", "span", "mark", "div", "label", "input", "img",
        "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col",
      ],
      ALLOWED_ATTR: [
        "href", "class", "type", "checked", "disabled", "start",
        "data-type", "data-checked", "data-color", "data-indent",
        "colspan", "rowspan", "colwidth",
      ],
      ADD_ATTR: (attr, tag) => tag === "img" && ["src", "alt", "title"].includes(attr),
      ALLOW_DATA_ATTR: false,
    })
    container.querySelectorAll("input").forEach(input => {
      if (input.type === "checkbox") input.disabled = true
      else input.remove()
    })
    container.querySelectorAll("a[href]").forEach(link => {
      link.setAttribute("rel", "noreferrer noopener nofollow")
    })
    // Only the editor's table wrapper needs a CSS class in published notes.
    container.querySelectorAll("[class]").forEach(element => {
      if (element.matches("div.tableWrapper") && element.querySelector(":scope > table")) {
        element.setAttribute("class", "tableWrapper")
      } else {
        element.removeAttribute("class")
      }
    })
    setSanitizedContent(container.innerHTML)
  }, [content])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-8">
        <a href="/" className="inline-flex min-h-11 items-center gap-2 font-serif text-xl tracking-tight">
          <NotebookPen aria-hidden="true" className="size-5 text-primary" />
          NerdsNote
        </a>
        <a href={openInAppUrl} rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-primary transition-colors hover:bg-muted">
          <BookmarkPlus aria-hidden="true" className="size-4" />
          Save to my notes
        </a>
      </header>

      <main className="mx-auto max-w-[46rem] px-6 pb-24 pt-12 sm:px-8 sm:pt-20">
        <article aria-labelledby="shared-note-heading">
          <header className="mb-8 border-b border-border pb-6 sm:mb-10">
            <h1 id="shared-note-heading" className="break-words font-serif text-4xl font-normal tracking-tight sm:text-5xl">
              {title || "A shared note"}
            </h1>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm leading-relaxed text-muted-foreground">
              <span>Shared <time dateTime={createdAt}>{dateFormat.format(new Date(createdAt))}</time></span>
              <span aria-hidden="true">·</span>
              <span>
                {expiresAt ? <>Expires <time dateTime={expiresAt}>{dateFormat.format(new Date(expiresAt))}</time></> : "No expiry"}
              </span>
            </p>
          </header>
          <div className="font-serif text-lg sm:text-xl">
            <div
              data-nosnippet=""
              className="note-rich-content prose prose-neutral dark:prose-invert max-w-none text-foreground prose-headings:font-serif prose-headings:text-foreground prose-a:text-primary prose-a:underline-offset-4 prose-strong:text-foreground prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </article>
      </main>
    </div>
  )
}
