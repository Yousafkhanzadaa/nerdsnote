import { kv } from "@vercel/kv";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoredNote } from "@/lib/share-types";
import SharedNoteView from "./shared-note-view";

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Fetch note data
async function getNote(slug: string): Promise<StoredNote | null> {
    try {
        const note = await kv.get<StoredNote>(`note:${slug}`);
        return note;
    } catch (error) {
        console.error("[s/slug] Error fetching note:", error);
        return null;
    }
}

// Escape HTML entities for safe rendering
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Generate dynamic metadata for OG tags
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const note = await getNote(slug);

    if (!note) {
        return {
            title: "Note Not Found — NerdsNote",
            description: "This note doesn't exist or has expired.",
        };
    }

    // Extract plain text from content (strip any HTML if present)
    const plainText = note.content.replace(/<[^>]*>/g, "").trim();
    const title = plainText.slice(0, 40) || "Shared Note";
    const description = plainText.slice(0, 150) || "A note shared via NerdsNote";

    return {
        title: `${title} — NerdsNote`,
        description,
        openGraph: {
            title: `${title} — NerdsNote`,
            description,
            type: "article",
            siteName: "NerdsNote",
        },
        twitter: {
            card: "summary",
            title: `${title} — NerdsNote`,
            description,
        },
    };
}

export default async function SharedNotePage({ params }: PageProps) {
    const { slug } = await params;
    const note = await getNote(slug);

    if (!note) {
        notFound();
    }

    // Safely escape content for rendering
    const safeContent = escapeHtml(note.content);
    const host = process.env.NEXT_PUBLIC_APP_URL || "https://nerdsnote.com";
    const openInAppUrl = `${host}/?openShared=${slug}`;

    return (
        <SharedNoteView
            content={safeContent}
            createdAt={note.createdAt}
            expiresAt={note.expiresAt}
            openInAppUrl={openInAppUrl}
        />
    );
}
