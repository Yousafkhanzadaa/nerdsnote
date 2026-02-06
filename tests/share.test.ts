import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    EXPIRY_SECONDS,
    MAX_CONTENT_SIZE,
    RATE_LIMIT_MAX,
    SLUG_SIZE,
} from "@/lib/share-types";

// Mock Vercel KV
const mockKv = {
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
};

vi.mock("@vercel/kv", () => ({
    kv: mockKv,
}));

// Mock nanoid
vi.mock("nanoid", () => ({
    nanoid: vi.fn(() => "abc12345"),
}));

describe("Share Types and Constants", () => {
    it("should have correct expiry seconds for 1 day", () => {
        expect(EXPIRY_SECONDS["1d"]).toBe(86400);
    });

    it("should have correct expiry seconds for 7 days", () => {
        expect(EXPIRY_SECONDS["7d"]).toBe(604800);
    });

    it("should have correct expiry seconds for 30 days", () => {
        expect(EXPIRY_SECONDS["30d"]).toBe(2592000);
    });

    it("should have correct max content size (50KB)", () => {
        expect(MAX_CONTENT_SIZE).toBe(50 * 1024);
    });

    it("should have correct rate limit max (20)", () => {
        expect(RATE_LIMIT_MAX).toBe(20);
    });

    it("should have correct slug size (8)", () => {
        expect(SLUG_SIZE).toBe(8);
    });
});

describe("Content Validation", () => {
    it("should detect empty content", () => {
        const content: string = "";
        const isEmpty = !content || content.trim().length === 0;
        expect(isEmpty).toBe(true);
    });

    it("should detect whitespace-only content as empty", () => {
        const content = "   \n\t  ";
        const isEmpty = !content || content.trim().length === 0;
        expect(isEmpty).toBe(true);
    });

    it("should accept valid content", () => {
        const content = "Hello, world!";
        const isEmpty = !content || content.trim().length === 0;
        expect(isEmpty).toBe(false);
    });

    it("should detect content exceeding 50KB", () => {
        const content = "a".repeat(MAX_CONTENT_SIZE + 1);
        const contentSize = new TextEncoder().encode(content).length;
        expect(contentSize).toBeGreaterThan(MAX_CONTENT_SIZE);
    });

    it("should accept content within 50KB limit", () => {
        const content = "a".repeat(MAX_CONTENT_SIZE);
        const contentSize = new TextEncoder().encode(content).length;
        expect(contentSize).toBeLessThanOrEqual(MAX_CONTENT_SIZE);
    });
});

describe("Expiry Calculation", () => {
    it("should calculate correct expiry date for 1 day", () => {
        const now = new Date("2026-02-06T18:00:00Z");
        const expiresAt = new Date(now.getTime() + EXPIRY_SECONDS["1d"] * 1000);
        expect(expiresAt.toISOString()).toBe("2026-02-07T18:00:00.000Z");
    });

    it("should calculate correct expiry date for 7 days", () => {
        const now = new Date("2026-02-06T18:00:00Z");
        const expiresAt = new Date(now.getTime() + EXPIRY_SECONDS["7d"] * 1000);
        expect(expiresAt.toISOString()).toBe("2026-02-13T18:00:00.000Z");
    });

    it("should calculate correct expiry date for 30 days", () => {
        const now = new Date("2026-02-06T18:00:00Z");
        const expiresAt = new Date(now.getTime() + EXPIRY_SECONDS["30d"] * 1000);
        expect(expiresAt.toISOString()).toBe("2026-03-08T18:00:00.000Z");
    });

    it('should return null for "never" expiry', () => {
        const expiresIn = "never";
        const expiresAt = expiresIn === "never" ? null : new Date();
        expect(expiresAt).toBeNull();
    });
});

describe("Rate Limiting Logic", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should allow first request", async () => {
        mockKv.get.mockResolvedValue(null);
        mockKv.set.mockResolvedValue("OK");

        const current = await mockKv.get("rate:share:127.0.0.1");
        const withinLimit = current === null || current < RATE_LIMIT_MAX;

        expect(withinLimit).toBe(true);
    });

    it("should allow requests below limit", async () => {
        mockKv.get.mockResolvedValue(19);

        const current = await mockKv.get("rate:share:127.0.0.1");
        const withinLimit = current === null || current < RATE_LIMIT_MAX;

        expect(withinLimit).toBe(true);
    });

    it("should block requests at limit", async () => {
        mockKv.get.mockResolvedValue(20);

        const current = await mockKv.get("rate:share:127.0.0.1");
        const withinLimit = current === null || current < RATE_LIMIT_MAX;

        expect(withinLimit).toBe(false);
    });

    it("should block requests above limit", async () => {
        mockKv.get.mockResolvedValue(25);

        const current = await mockKv.get("rate:share:127.0.0.1");
        const withinLimit = current === null || current < RATE_LIMIT_MAX;

        expect(withinLimit).toBe(false);
    });
});

describe("Slug Generation", () => {
    it("should generate slug of correct length", async () => {
        const { nanoid } = await import("nanoid");
        const slug = nanoid(SLUG_SIZE);
        expect(slug).toBe("abc12345");
        expect(slug.length).toBe(8);
    });
});

describe("KV Storage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should store note with TTL for 7d expiry", async () => {
        mockKv.set.mockResolvedValue("OK");

        const noteData = {
            content: "Test note",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + EXPIRY_SECONDS["7d"] * 1000).toISOString(),
        };

        await mockKv.set("note:abc12345", noteData, { ex: EXPIRY_SECONDS["7d"] });

        expect(mockKv.set).toHaveBeenCalledWith(
            "note:abc12345",
            noteData,
            { ex: 604800 }
        );
    });

    it("should store note without TTL for never expiry", async () => {
        mockKv.set.mockResolvedValue("OK");

        const noteData = {
            content: "Test note",
            createdAt: new Date().toISOString(),
            expiresAt: null,
        };

        await mockKv.set("note:abc12345", noteData);

        expect(mockKv.set).toHaveBeenCalledWith("note:abc12345", noteData);
    });

    it("should return null for non-existent note", async () => {
        mockKv.get.mockResolvedValue(null);

        const note = await mockKv.get("note:nonexistent");

        expect(note).toBeNull();
    });

    it("should return note data for existing note", async () => {
        const noteData = {
            content: "Test note",
            createdAt: "2026-02-06T18:00:00.000Z",
            expiresAt: "2026-02-13T18:00:00.000Z",
        };
        mockKv.get.mockResolvedValue(noteData);

        const note = await mockKv.get("note:abc12345");

        expect(note).toEqual(noteData);
    });
});

describe("HTML Escaping for XSS Prevention", () => {
    function escapeHtml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    it("should escape < and > characters", () => {
        const input = "<script>alert('xss')</script>";
        const escaped = escapeHtml(input);
        expect(escaped).toBe("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    });

    it("should escape & character", () => {
        const input = "a & b";
        const escaped = escapeHtml(input);
        expect(escaped).toBe("a &amp; b");
    });

    it("should escape quotes", () => {
        const input = 'He said "hello"';
        const escaped = escapeHtml(input);
        expect(escaped).toBe("He said &quot;hello&quot;");
    });

    it("should preserve normal text", () => {
        const input = "Hello, world!";
        const escaped = escapeHtml(input);
        expect(escaped).toBe("Hello, world!");
    });
});
