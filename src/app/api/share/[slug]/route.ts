import { NextRequest, NextResponse } from "next/server";
import { ShareNoteError, StoredNote } from "@/lib/share-types";
import { getRedis } from "@/lib/redis";
import { hashShareRevokeToken } from "@/lib/share-token";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;

        if (!slug || slug.length === 0) {
            return NextResponse.json(
                { error: "Slug is required" },
                { status: 400 }
            );
        }

        // Fetch note from KV
        const note = await getRedis().get<StoredNote>(`note:${slug}`);

        if (!note) {
            return NextResponse.json(
                { error: "Note not found or has expired" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                content: note.content,
                createdAt: note.createdAt,
                expiresAt: note.expiresAt,
            },
            { headers: { "Cache-Control": "private, no-store" } },
        );
    } catch (error) {
        console.error("[share/slug] Error fetching note:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;
        let body: unknown;

        try {
            body = await request.json();
        } catch {
            body = null;
        }

        const revokeToken =
            body && typeof body === "object" && "revokeToken" in body
                ? (body as { revokeToken?: unknown }).revokeToken
                : null;

        if (typeof revokeToken !== "string" || revokeToken.length < 20) {
            return NextResponse.json<ShareNoteError>(
                { ok: false, error: "A valid revocation token is required", code: "INVALID_REVOKE_TOKEN" },
                { status: 400 },
            );
        }

        const redis = getRedis();
        const note = await redis.get<StoredNote>(`note:${slug}`);
        if (!note) {
            return NextResponse.json({ error: "Note not found or has expired" }, { status: 404 });
        }

        if (hashShareRevokeToken(revokeToken) !== note.revokeTokenHash) {
            return NextResponse.json<ShareNoteError>(
                { ok: false, error: "The revocation token is invalid", code: "INVALID_REVOKE_TOKEN" },
                { status: 403 },
            );
        }

        await redis.del(`note:${slug}`);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[share/slug] Error revoking note:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
