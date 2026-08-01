import { createHash } from "node:crypto"

export function hashShareRevokeToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}
