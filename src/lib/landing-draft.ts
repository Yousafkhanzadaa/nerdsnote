export const LANDING_DRAFT_STORAGE_KEY = "nerds-note-landing-draft"
export const LANDING_DRAFT_HANDOFF_KEY = "nerds-note-landing-draft-handoff"
const HANDOFF_ID_KEY = "nerds-note-landing-draft-handoff-id"

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">
export type LandingDraftHandoff = { id: string; draft: string }

export function saveLandingDraft(storage: DraftStorage, draft: string) {
  if (storage.getItem(LANDING_DRAFT_STORAGE_KEY) === draft) return
  storage.removeItem(LANDING_DRAFT_HANDOFF_KEY)
  storage.removeItem(HANDOFF_ID_KEY)
  if (draft.length > 0) {
    storage.setItem(LANDING_DRAFT_STORAGE_KEY, draft)
  } else {
    storage.removeItem(LANDING_DRAFT_STORAGE_KEY)
  }
}

export function prepareLandingDraftHandoff(storage: DraftStorage, draft: string) {
  saveLandingDraft(storage, draft)
  if (!draft.trim()) return
  storage.setItem(HANDOFF_ID_KEY, `landing-${crypto.randomUUID()}`)
  storage.setItem(LANDING_DRAFT_HANDOFF_KEY, "true")
}

export function readLandingDraftHandoff(storage: DraftStorage): LandingDraftHandoff | null {
  if (storage.getItem(LANDING_DRAFT_HANDOFF_KEY) !== "true") {
    return null
  }

  const draft = storage.getItem(LANDING_DRAFT_STORAGE_KEY)
  if (!draft?.trim()) return null
  // Old clients set only the handoff flag. Assign an ID so a retry can find
  // the same note if the browser closed between saving it and clearing the flag.
  let id = storage.getItem(HANDOFF_ID_KEY)
  if (!id) {
    id = `landing-${crypto.randomUUID()}`
    storage.setItem(HANDOFF_ID_KEY, id)
  }
  return { id, draft }
}

export function completeLandingDraftHandoff(storage: DraftStorage, handoff: LandingDraftHandoff) {
  if (storage.getItem(HANDOFF_ID_KEY) !== handoff.id ||
      storage.getItem(LANDING_DRAFT_STORAGE_KEY) !== handoff.draft) return
  storage.removeItem(LANDING_DRAFT_HANDOFF_KEY)
  storage.removeItem(LANDING_DRAFT_STORAGE_KEY)
  storage.removeItem(HANDOFF_ID_KEY)
}

export function landingDraftTitle(draft: string) {
  const firstLine = draft
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) {
    return "Quick draft"
  }

  return firstLine.length > 60 ? `${firstLine.slice(0, 57).trimEnd()}...` : firstLine
}
