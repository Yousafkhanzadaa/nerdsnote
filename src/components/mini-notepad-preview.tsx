"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Check, FileText, Lock, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  LANDING_DRAFT_STORAGE_KEY,
  prepareLandingDraftHandoff,
  saveLandingDraft,
} from "@/lib/landing-draft"

const MAX_DRAFT_LENGTH = 4000

export function MiniNotepadPreview() {
  const [draft, setDraft] = useState("")
  const [hasLoaded, setHasLoaded] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setDraft(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY) ?? "")
    } catch {
      setStorageError("Browser storage is unavailable. You can still try the preview.")
    } finally {
      setHasLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!hasLoaded) return

    try {
      saveLandingDraft(localStorage, draft)
      setStorageError(null)
    } catch {
      setStorageError("This preview could not be saved in your browser.")
    }
  }, [draft, hasLoaded])

  const wordCount = useMemo(() => {
    const trimmedDraft = draft.trim()
    return trimmedDraft ? trimmedDraft.split(/\s+/).length : 0
  }, [draft])

  const continueInEditor = () => {
    try {
      prepareLandingDraftHandoff(localStorage, draft)
      window.location.assign("/notepad")
    } catch {
      setStorageError("We could not move this draft. Copy it before opening the editor.")
    }
  }

  const clearDraft = () => {
    setDraft("")
  }

  return (
    <div className="relative text-left">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -top-8 bottom-0 bg-hero-glow"
      />
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-foreground/25" />
            <span className="h-3 w-3 rounded-full bg-foreground/15" />
            <span className="h-3 w-3 rounded-full bg-foreground/10" />
          </div>
          <div className="ml-2 flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground sm:ml-3">
            <FileText className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">Quick draft</span>
          </div>
          <div className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-background/70 px-2 py-1 text-[11px] font-medium text-primary">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Local preview
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <label htmlFor="landing-note-preview" className="sr-only">
            Try the NerdsNote writable preview
          </label>
          <textarea
            id="landing-note-preview"
            value={draft}
            maxLength={MAX_DRAFT_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={"Write something here...\n\nTry a quick idea, meeting note, checklist, or private draft."}
            className="min-h-52 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-base leading-7 text-foreground shadow-inner outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:min-h-60"
          />

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-primary">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {draft ? "Saved in this browser" : "Ready when you are"}
              </span>
              <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
              <span>{draft.length.toLocaleString()} / {MAX_DRAFT_LENGTH.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2">
              {draft && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearDraft}
                  aria-label="Clear preview draft"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Clear
                </Button>
              )}
              <Button type="button" size="sm" onClick={continueInEditor}>
                Continue in editor
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {storageError && (
            <p role="status" className="mt-3 text-xs text-destructive">
              {storageError}
            </p>
          )}
        </div>
      </div>
      <p className="relative mt-3 text-center text-xs text-muted-foreground">
        The preview stores only this draft in your browser. Open the full editor for formatting,
        search, import, export, and sharing.
      </p>
    </div>
  )
}
