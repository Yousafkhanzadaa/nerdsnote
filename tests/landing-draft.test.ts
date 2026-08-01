import { beforeEach, describe, expect, it } from "vitest"

import {
  LANDING_DRAFT_HANDOFF_KEY,
  LANDING_DRAFT_STORAGE_KEY,
  consumeLandingDraftHandoff,
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

    expect(consumeLandingDraftHandoff(localStorage)).toBeNull()
    expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBe("Keep this preview")
  })

  it("consumes and cleans an explicitly handed-off draft", () => {
    prepareLandingDraftHandoff(localStorage, "Meeting notes\n- Confirm launch date")

    expect(consumeLandingDraftHandoff(localStorage)).toBe(
      "Meeting notes\n- Confirm launch date",
    )
    expect(localStorage.getItem(LANDING_DRAFT_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(LANDING_DRAFT_HANDOFF_KEY)).toBeNull()
  })

  it("derives a compact note title from the first non-empty line", () => {
    expect(landingDraftTitle("\n\nLaunch checklist\n- Ship it")).toBe("Launch checklist")
    expect(landingDraftTitle(" ")).toBe("Quick draft")
    expect(landingDraftTitle("A".repeat(80))).toBe(`${"A".repeat(57)}...`)
  })
})
