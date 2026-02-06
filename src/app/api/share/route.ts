import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import {
    ShareNoteRequest,
    ShareNoteResponse,
    ShareNoteError,
    StoredNote,
    EXPIRY_SECONDS,
    MAX_CONTENT_SIZE,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW,
    SLUG_SIZE,
    MAX_SLUG_RETRIES,
} from "@/lib/share-types";

// Get client IP from request headers
function getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }
    const realIP = request.headers.get("x-real-ip");
    if (realIP) {
        return realIP;
    }
    return "unknown";
}

// Check rate limit for IP
async function checkRateLimit(ip: string): Promise<boolean> {
    const key = `rate:share:${ip}`;
    const current = await kv.get<number>(key);

    if (current !== null && current >= RATE_LIMIT_MAX) {
        return false; // Rate limited
    }

    // Increment counter
    if (current === null) {
        await kv.set(key, 1, { ex: RATE_LIMIT_WINDOW });
    } else {
        await kv.incr(key);
    }

    return true;
}

// Generate unique slug with retry on collision
async function generateUniqueSlug(): Promise<string | null> {
    for (let i = 0; i < MAX_SLUG_RETRIES; i++) {
        const slug = nanoid(SLUG_SIZE);
        const existing = await kv.get(`note:${slug}`);
        if (existing === null) {
            return slug;
        }
    }
    return null; // Failed after retries
}

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        let body: ShareNoteRequest;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json<ShareNoteError>(
                { ok: false, error: "Invalid JSON body", code: "SERVER_ERROR" },
                { status: 400 }
            );
        }

        const { content, expiresIn = "7d" } = body;

        // Validate content is not empty
        if (!content || content.trim().length === 0) {
            return NextResponse.json<ShareNoteError>(
                { ok: false, error: "Content cannot be empty", code: "EMPTY_CONTENT" },
                { status: 400 }
            );
        }

        // Validate content size (50KB limit)
        const contentSize = new TextEncoder().encode(content).length;
        if (contentSize > MAX_CONTENT_SIZE) {
            return NextResponse.json<ShareNoteError>(
                {
                    ok: false,
                    error: `Content exceeds maximum size of ${MAX_CONTENT_SIZE / 1024}KB`,
                    code: "CONTENT_TOO_LARGE",
                },
                { status: 413 }
            );
        }

        // Check rate limit
        const clientIP = getClientIP(request);
        const withinLimit = await checkRateLimit(clientIP);
        if (!withinLimit) {
            return NextResponse.json<ShareNoteError>(
                {
                    ok: false,
                    error: "Rate limit exceeded. Please try again later.",
                    code: "RATE_LIMITED",
                },
                { status: 429 }
            );
        }

        // Generate unique slug
        const slug = await generateUniqueSlug();
        if (!slug) {
            return NextResponse.json<ShareNoteError>(
                {
                    ok: false,
                    error: "Failed to generate unique link. Please try again.",
                    code: "SERVER_ERROR",
                },
                { status: 500 }
            );
        }

        // Calculate expiry
        const now = new Date();
        let expiresAt: Date | null = null;
        let ttlSeconds: number | undefined;

        if (expiresIn !== "never") {
            ttlSeconds = EXPIRY_SECONDS[expiresIn];
            expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
        }

        // Store note in KV
        const noteData: StoredNote = {
            content,
            createdAt: now.toISOString(),
            expiresAt: expiresAt?.toISOString() ?? null,
        };

        if (ttlSeconds) {
            await kv.set(`note:${slug}`, noteData, { ex: ttlSeconds });
        } else {
            await kv.set(`note:${slug}`, noteData);
        }

        // Generate URL
        const host = process.env.NEXT_PUBLIC_APP_URL || "https://nerdsnote.com";
        const url = `${host}/s/${slug}`;

        // Log metadata only (never content)
        console.log(`[share] Created note slug=${slug} size=${contentSize} expires=${expiresIn}`);

        return NextResponse.json<ShareNoteResponse>({
            ok: true,
            url,
            slug,
            expiresAt: expiresAt?.toISOString() ?? null,
        });
    } catch (error) {
        console.error("[share] Error creating share link:", error);
        return NextResponse.json<ShareNoteError>(
            { ok: false, error: "Internal server error", code: "SERVER_ERROR" },
            { status: 500 }
        );
    }
}
