export const LANDING_DRAFT_STORAGE_KEY = "nerds-note-landing-draft"
export const LANDING_DRAFT_HANDOFF_KEY = "nerds-note-landing-draft-handoff"

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">

export function saveLandingDraft(storage: DraftStorage, draft: string) {
  if (draft.length > 0) {
    storage.setItem(LANDING_DRAFT_STORAGE_KEY, draft)
  } else {
    storage.removeItem(LANDING_DRAFT_STORAGE_KEY)
  }
}

export function prepareLandingDraftHandoff(storage: DraftStorage, draft: string) {
  saveLandingDraft(storage, draft)
  storage.setItem(LANDING_DRAFT_HANDOFF_KEY, "true")
}

export function consumeLandingDraftHandoff(storage: DraftStorage) {
  if (storage.getItem(LANDING_DRAFT_HANDOFF_KEY) !== "true") {
    return null
  }

  const draft = storage.getItem(LANDING_DRAFT_STORAGE_KEY)
  storage.removeItem(LANDING_DRAFT_HANDOFF_KEY)
  storage.removeItem(LANDING_DRAFT_STORAGE_KEY)

  return draft?.trim() ? draft : null
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
