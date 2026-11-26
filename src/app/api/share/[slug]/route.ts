import { kv } from "@vercel/kv"
import { NextRequest, NextResponse } from "next/server"
import { isShareSlug, SHARE_HEADERS, type StoredNote } from "@/lib/share-types"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const note = isShareSlug(slug) ? await kv.get<StoredNote>(`note:${slug}`) : null
    if (!note) {
      return NextResponse.json({ error: "Note not found or has expired" }, { status: 404, headers: SHARE_HEADERS })
    }
    return NextResponse.json({
      content: note.content,
      ...(note.title && { title: note.title }),
      createdAt: note.createdAt,
      expiresAt: note.expiresAt,
    }, { headers: SHARE_HEADERS })
  } catch {
    return NextResponse.json({ error: "Unable to load this note." }, { status: 500, headers: SHARE_HEADERS })
  }
}
