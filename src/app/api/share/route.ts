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
    REVOKE_TOKEN_SIZE,
    isExpiryOption,
} from "@/lib/share-types";
import { getRedis } from "@/lib/redis";
import { getClientIP } from "@/lib/request-ip";
import { withinFixedWindowRateLimit } from "@/lib/rate-limit";
import { hashShareRevokeToken } from "@/lib/share-token";

// Generate unique slug with retry on collision
async function generateUniqueSlug(): Promise<string | null> {
    const redis = getRedis();
    for (let i = 0; i < MAX_SLUG_RETRIES; i++) {
        const slug = nanoid(SLUG_SIZE);
        const existing = await redis.get(`note:${slug}`);
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

        if (!isExpiryOption(expiresIn)) {
            return NextResponse.json<ShareNoteError>(
                { ok: false, error: "Expiry must be 1 day, 7 days, or 30 days", code: "INVALID_EXPIRY" },
                { status: 400 }
            );
        }

        // Validate content is not empty
        if (typeof content !== "string" || content.trim().length === 0) {
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
        const withinLimit = await withinFixedWindowRateLimit(
            `rate:share:${clientIP}`,
            RATE_LIMIT_MAX,
            RATE_LIMIT_WINDOW,
        );
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
        const ttlSeconds = EXPIRY_SECONDS[expiresIn];
        const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
        const revokeToken = nanoid(REVOKE_TOKEN_SIZE);

        // Store note in KV
        const noteData: StoredNote = {
            content,
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            revokeTokenHash: hashShareRevokeToken(revokeToken),
        };

        await getRedis().set(`note:${slug}`, noteData, { ex: ttlSeconds });

        // Generate URL
        const host = process.env.NEXT_PUBLIC_APP_URL || "https://nerdsnote.com";
        const url = `${host}/s/${slug}`;

        // Log metadata only (never content)
        console.log(`[share] Created note slug=${slug} size=${contentSize} expires=${expiresIn}`);

        return NextResponse.json<ShareNoteResponse>({
            ok: true,
            url,
            slug,
            expiresAt: expiresAt.toISOString(),
            revokeToken,
        });
    } catch (error) {
        console.error("[share] Error creating share link:", error);
        return NextResponse.json<ShareNoteError>(
            { ok: false, error: "Internal server error", code: "SERVER_ERROR" },
            { status: 500 }
        );
    }
}
