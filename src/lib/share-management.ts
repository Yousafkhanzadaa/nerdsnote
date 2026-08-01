export const MANAGED_SHARES_STORAGE_KEY = "nerds-note-managed-shares"

export interface ManagedShare {
  slug: string
  url: string
  revokeToken: string
  expiresAt: string
  createdAt: string
}

type ShareStorage = Pick<Storage, "getItem" | "setItem">

function isManagedShare(value: unknown): value is ManagedShare {
  if (!value || typeof value !== "object") return false
  const share = value as Partial<ManagedShare>

  return (
    typeof share.slug === "string" &&
    typeof share.url === "string" &&
    typeof share.revokeToken === "string" &&
    typeof share.expiresAt === "string" &&
    typeof share.createdAt === "string" &&
    !Number.isNaN(new Date(share.expiresAt).getTime())
  )
}

export function loadManagedShares(storage: ShareStorage): ManagedShare[] {
  try {
    const raw = storage.getItem(MANAGED_SHARES_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const now = Date.now()
    return parsed
      .filter(isManagedShare)
      .filter((share) => new Date(share.expiresAt).getTime() > now)
      .slice(0, 20)
  } catch {
    return []
  }
}

export function saveManagedShare(storage: ShareStorage, share: ManagedShare) {
  const existing = loadManagedShares(storage).filter((item) => item.slug !== share.slug)
  storage.setItem(MANAGED_SHARES_STORAGE_KEY, JSON.stringify([share, ...existing].slice(0, 20)))
}

export function removeManagedShare(storage: ShareStorage, slug: string) {
  const remaining = loadManagedShares(storage).filter((share) => share.slug !== slug)
  storage.setItem(MANAGED_SHARES_STORAGE_KEY, JSON.stringify(remaining))
}
