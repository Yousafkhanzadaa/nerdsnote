import { beforeEach, describe, expect, it } from "vitest"

import {
  LANDING_DRAFT_HANDOFF_KEY,
  LANDING_DRAFT_STORAGE_KEY,
  completeLandingDraftHandoff,
  readLandingDraftHandoff,
  landingDraftTitle,
  prepareLandingDraftHandoff,
  saveLandingDraft,
} from "@/lib/landing-draft"

describe("landing-page draft handoff", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("saves and removes an in-progress preview draft", () => {
    saveLandingDraft(localStorage, "A useful idea")
    expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBe("A useful idea")

    saveLandingDraft(localStorage, "")
    expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBeNull()
  })

  it("does not consume a draft until the user explicitly continues", () => {
    saveLandingDraft(localStorage, "Keep this preview")

    expect(readLandingDraftHandoff(localStorage)).toBeNull()
    expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBe("Keep this preview")
  })

  it("keeps an old-version draft until the notebook confirms it was saved", () => {
    const draft = "Meeting notes\n- Confirm launch date"
    localStorage.setItem(LANDING_DRAFT_STORAGE_KEY, draft)
    localStorage.setItem(LANDING_DRAFT_HANDOFF_KEY, "true")
    const handoff = readLandingDraftHandoff(localStorage)!
    expect(handoff.draft).toBe(draft)
    expect(readLandingDraftHandoff(localStorage)?.id).toBe(handoff.id)
    expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBe(draft)
    completeLandingDraftHandoff(localStorage, handoff)
    expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(LANDING_DRAFT_HANDOFF_KEY)).toBeNull()
  })

  it("preserves a replacement draft if a previous save finishes later", () => {
    prepareLandingDraftHandoff(localStorage, "First draft")
    const first = readLandingDraftHandoff(localStorage)!
    prepareLandingDraftHandoff(localStorage, "Second draft")
    completeLandingDraftHandoff(localStorage, first)
    expect(readLandingDraftHandoff(localStorage)?.draft).toBe("Second draft")
  })

  it("derives a compact note title from the first non-empty line", () => {
    expect(landingDraftTitle("\n\nLaunch checklist\n- Ship it")).toBe("Launch checklist")
    expect(landingDraftTitle(" ")).toBe("Quick draft")
    expect(landingDraftTitle("A".repeat(80))).toBe(`${"A".repeat(57)}...`)
  })
})
