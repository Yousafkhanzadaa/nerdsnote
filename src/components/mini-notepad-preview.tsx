"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Check, LockKeyhole } from "lucide-react"

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
  const lastSaved = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    try {
      lastSaved.current = localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)
      setDraft(lastSaved.current ?? "")
    } catch {
      setStorageError("Browser storage is unavailable. Copy your draft before leaving.")
    } finally {
      setHasLoaded(true)
    }
  }, [])

  function canSaveDraft() {
    if (lastSaved.current === undefined) return false
    if (localStorage.getItem(LANDING_DRAFT_STORAGE_KEY) === lastSaved.current) return true
    setStorageError("Your saved draft changed in another tab. Copy this text before reloading.")
    return false
  }

  const changeDraft = (value: string) => {
    setDraft(value)
    try {
      if (!canSaveDraft()) return
      saveLandingDraft(localStorage, value)
      lastSaved.current = value || null
      setStorageError(null)
    } catch {
      setStorageError("Your draft could not be saved. Copy it before leaving this page.")
    }
  }

  const continueInEditor = () => {
    try {
      if (!canSaveDraft()) return
      prepareLandingDraftHandoff(localStorage, draft)
      window.location.assign("/notepad")
    } catch {
      setStorageError("Copy your draft, then use Open notebook to paste it into a note.")
    }
  }

  const trimmedDraft = draft.trim()
  const wordCount = trimmedDraft ? trimmedDraft.split(/\s+/).length : 0

  return (
    <section
      aria-labelledby="draft-heading"
      className="relative rounded-sm border border-border bg-card px-5 pt-8 text-card-foreground shadow-[0_2px_6px_rgb(45_40_24/0.035),0_16px_42px_-24px_rgb(45_40_24/0.18)] sm:px-12 sm:pt-12"
    >
      <div
        aria-hidden="true"
        className="absolute -top-px right-6 h-6 w-3.5 bg-primary [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)] sm:right-12 sm:h-8"
      />
      <h1 id="draft-heading" className="font-serif text-[2.75rem] leading-tight font-normal tracking-[-0.045em] sm:text-6xl">
        <label htmlFor="landing-note-preview">Quick draft</label>
      </h1>
      <p id="draft-storage" className="mt-3 flex min-h-5 items-center gap-1.5 text-xs text-muted-foreground">
        {storageError ? (
          <span role="status" className="text-destructive">{storageError}</span>
        ) : draft ? (
          <>
            <Check className="size-3.5 text-primary" aria-hidden="true" />
            Saved in this browser
          </>
        ) : (
          <>
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Private to this browser
          </>
        )}
      </p>

      <textarea
        id="landing-note-preview"
        aria-describedby="draft-storage"
        value={draft}
        readOnly={!hasLoaded}
        maxLength={MAX_DRAFT_LENGTH}
        onChange={(event) => changeDraft(event.target.value)}
        placeholder="Start writing here…"
        rows={6}
        spellCheck
        className="mt-7 block w-full resize-y rounded-none border-0 bg-transparent bg-local px-1 font-serif text-xl leading-9 text-foreground caret-primary outline-none placeholder:italic placeholder:text-muted-foreground focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ring sm:mt-9 sm:text-[1.4rem] sm:leading-10"
        style={{
          backgroundImage: "linear-gradient(to bottom, transparent calc(100% - 1px), color-mix(in oklch, var(--border) 78%, transparent) 1px)",
          backgroundSize: "100% 1lh",
        }}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border py-4 sm:mt-7 sm:py-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">{wordCount} {wordCount === 1 ? "word" : "words"}</span>
          {draft.length >= MAX_DRAFT_LENGTH - 200 && (
            <span className="tabular-nums">{draft.length.toLocaleString()} / 4,000</span>
          )}
          {draft && (
            <button
              type="button"
              onClick={() => changeDraft("")}
              aria-label="Clear quick draft"
              className="min-h-10 rounded-sm px-1 underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              Clear
            </button>
          )}
        </div>
        <Button type="button" disabled={!hasLoaded || lastSaved.current === undefined} onClick={continueInEditor} className="ml-auto min-h-11 rounded-md px-4">
          Continue in editor
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  )
}
