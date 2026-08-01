import { describe, expect, it } from "vitest"

import {
  loadManagedShares,
  MANAGED_SHARES_STORAGE_KEY,
  removeManagedShare,
  saveManagedShare,
  type ManagedShare,
} from "@/lib/share-management"

function createStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  }
}

function share(slug: string, expiresAt = "2099-08-01T00:00:00.000Z"): ManagedShare {
  return {
    slug,
    url: `https://nerdsnote.com/s/${slug}`,
    revokeToken: `secret-${slug}`,
    expiresAt,
    createdAt: "2026-08-01T00:00:00.000Z",
  }
}

describe("managed share revocation keys", () => {
  it("saves, replaces, and removes links", () => {
    const storage = createStorage()

    saveManagedShare(storage, share("one"))
    saveManagedShare(storage, { ...share("one"), revokeToken: "replacement" })
    expect(loadManagedShares(storage)).toEqual([{ ...share("one"), revokeToken: "replacement" }])

    removeManagedShare(storage, "one")
    expect(storage.values.get(MANAGED_SHARES_STORAGE_KEY)).toBe("[]")
  })

  it("drops expired and malformed records", () => {
    const storage = createStorage()
    storage.setItem(
      MANAGED_SHARES_STORAGE_KEY,
      JSON.stringify([share("expired", "2000-07-01T00:00:00.000Z"), { slug: "broken" }]),
    )

    expect(loadManagedShares(storage)).toEqual([])
  })
})
