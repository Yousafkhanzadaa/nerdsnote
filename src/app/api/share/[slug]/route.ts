import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { StoredNote } from "@/lib/share-types";

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
        const note = await kv.get<StoredNote>(`note:${slug}`);

        if (!note) {
            return NextResponse.json(
                { error: "Note not found or has expired" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            content: note.content,
            createdAt: note.createdAt,
            expiresAt: note.expiresAt,
        });
    } catch (error) {
        console.error("[share/slug] Error fetching note:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
