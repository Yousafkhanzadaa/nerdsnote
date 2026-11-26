import { NextRequest } from "next/server"
import { nanoid } from "nanoid"
import { createElement } from "react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { GET } from "@/app/api/share/[slug]/route"
import { POST } from "@/app/api/share/route"
import { metadata } from "@/app/s/[slug]/page"
import SharedNoteView from "@/app/s/[slug]/shared-note-view"
import { prepareShareContent } from "@/lib/share-images"
import { MAX_CONTENT_SIZE, MAX_SHARE_REQUEST_BYTES, MAX_SLUG_RETRIES } from "@/lib/share-types"

const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mOwjdEBAAGfAMbFnGqmAAAAAElFTkSuQmCC"

const kv = vi.hoisted(() => ({
  multi: vi.fn(), incr: vi.fn(), expire: vi.fn(), exec: vi.fn(), set: vi.fn(), get: vi.fn(),
}))
vi.mock("@vercel/kv", () => ({ kv }))
vi.mock("nanoid", async importOriginal => {
  const original = await importOriginal<typeof import("nanoid")>()
  return { nanoid: vi.fn(original.nanoid) }
})

function create(body: unknown) {
  return POST(new NextRequest("https://test.example/api/share", {
    method: "POST",
    headers: { "x-forwarded-for": "192.0.2.1" },
    body: JSON.stringify(body),
  }))
}

function read(slug: string) {
  return GET(new NextRequest(`https://test.example/api/share/${slug}`), {
    params: Promise.resolve({ slug }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://test.example")
  kv.multi.mockReturnValue(kv)
  kv.incr.mockReturnValue(kv)
  kv.expire.mockReturnValue(kv)
  kv.exec.mockResolvedValue([1, 1])
  kv.set.mockResolvedValue("OK")
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe("creating a share link", () => {
  it("creates a seven-day snapshot with an opaque token and optional display title", async () => {
    const response = await create({ content: "<p>Journal entry</p>", title: "  A thought  " })
    expect(response.status).toBe(200)
    const { slug, url, expiresAt } = await response.json()
    expect(slug).toMatch(/^[\w-]{21}$/)
    expect(url).toBe(`https://test.example/s/${slug}`)
    expect(response.headers.get("Cache-Control")).toContain("no-store")
    expect(kv.incr).toHaveBeenCalledWith("rate:share:192.0.2.1")
    expect(kv.expire).toHaveBeenCalledWith("rate:share:192.0.2.1", 3600, "NX")
    const snapshot = kv.set.mock.calls[0][1]
    expect(kv.set).toHaveBeenCalledWith(`note:${slug}`, {
      content: "<p>Journal entry</p>", title: "A thought", createdAt: expect.any(String), expiresAt,
    }, { nx: true, ex: 604800 })
    expect(Date.parse(expiresAt) - Date.parse(snapshot.createdAt)).toBe(604800000)
  })

  it.each([["1d", 86400], ["30d", 2592000], ["never", null]])(
    "preserves the %s expiry choice", async (expiresIn, ttl) => {
      expect((await create({ content: "Hi", title: "  ", expiresIn })).status).toBe(200)
      const [, snapshot, options] = kv.set.mock.calls[0]
      expect(snapshot).not.toHaveProperty("title")
      expect(options).toEqual(ttl ? { nx: true, ex: ttl } : { nx: true })
      if (ttl === null) expect(snapshot.expiresAt).toBeNull()
    },
  )

  it.each([
    null, [], {}, { content: 42 }, { content: "Hi", expiresIn: "invalid" },
    { content: "Hi", expiresIn: null }, { content: "Hi", title: "a".repeat(121) },
    { content: " \n " }, { content: "<p><br></p>" },
  ])("rejects malformed or empty input before contacting storage", async body => {
    expect((await create(body)).status).toBe(400)
    expect(kv.multi).not.toHaveBeenCalled()
    expect(kv.set).not.toHaveBeenCalled()
  })

  it("rejects malformed JSON", async () => {
    const request = new NextRequest("https://test.example/api/share", { method: "POST", body: "{" })
    expect((await POST(request)).status).toBe(400)
    expect(kv.set).not.toHaveBeenCalled()
  })

  it("limits the UTF-8 size of the body", async () => {
    expect((await create({ content: "à".repeat(MAX_CONTENT_SIZE / 2 + 1) })).status).toBe(413)
    expect((await create({ content: "à".repeat(MAX_CONTENT_SIZE / 2) })).status).toBe(200)
  })

  it("accepts image-only notes and excludes only validated raster data from the text limit", async () => {
    const img = `<img alt="Garden" src="${png}">`
    const images = img.repeat(400)
    expect(images.length).toBeGreaterThan(MAX_CONTENT_SIZE)
    expect((await create({ content: images })).status).toBe(200)
    expect(kv.set.mock.calls[0][1].content).toBe(images)
    expect((await create({ content: img + "x".repeat(MAX_CONTENT_SIZE) })).status).toBe(413)
    expect((await create({ content: `<img src="${png}" alt="${"x".repeat(MAX_CONTENT_SIZE)}">` })).status).toBe(413)
    expect((await create({ content: "<p data-comment='" + png.repeat(500) + "'>Garden</p>" })).status).toBe(413)
  })

  it("limits the whole JSON payload, including data outside the note", async () => {
    const result = await create({ content: "small", unused: "x".repeat(MAX_SHARE_REQUEST_BYTES) })
    expect(result.status).toBe(413)
    expect(kv.multi).not.toHaveBeenCalled()
  })

  it.each([
    '<img src="https://example.org/photo.png">',
    '<img src="data:image/svg+xml;base64,PHN2Zy8+">',
    '<img src="data:image/png;base64,bm90LXBuZw==">',
    `<img src="${png}" srcset="https://example.org/photo.png 2x">`,
    `<picture><source srcset="https://example.org/photo.png"><img src="${png}"></picture>`,
  ])("rejects unsupported image sources before publishing", async content => {
    expect((await create({ content })).status).toBe(400)
    expect(kv.set).not.toHaveBeenCalled()
  })

  it("enforces the fixed-window limit", async () => {
    kv.exec.mockResolvedValueOnce([20, 0]).mockResolvedValueOnce([21, 0])
    expect((await create({ content: "Allowed" })).status).toBe(200)
    expect((await create({ content: "Over limit" })).status).toBe(429)
    expect(kv.set).toHaveBeenCalledTimes(1)
  })

  it("retries with a new key after a collision without replacing the original", async () => {
    vi.mocked(nanoid).mockReturnValueOnce("a".repeat(21)).mockReturnValueOnce("b".repeat(21))
    kv.set.mockResolvedValueOnce(null)
    const response = await create({ content: "A fresh note" })
    expect((await response.json()).slug).toBe("b".repeat(21))
    expect(kv.set).toHaveBeenCalledTimes(2)
    for (const [, , options] of kv.set.mock.calls) expect(options.nx).toBe(true)
  })

  it("returns an error if every write collides", async () => {
    kv.set.mockResolvedValue(null)
    expect((await create({ content: "Hello" })).status).toBe(500)
    expect(kv.set).toHaveBeenCalledTimes(MAX_SLUG_RETRIES)
  })
})

describe("reading a share link", () => {
  it("preserves selected highlights in a share snapshot, import response and sanitized reader, including code", async () => {
    const content = '<p><mark data-color="#fef08a">One</mark> <strong><mark data-color="#bbf7d0">two</mark></strong> '
      + '<code><mark data-color="#bfdbfe">inline</mark></code> <mark data-color="#fbcfe8"><code>alternate</code></mark></p>'
      + '<pre><code>uncolored\n<mark data-color="#e9d5ff" style="background-color:#e9d5ff">block</mark></code></pre>'
    const response = await create({ content: await prepareShareContent(content) })
    expect(response.status).toBe(200)
    const { slug } = await response.json()
    const [, snapshot] = kv.set.mock.calls[0]
    expect(snapshot.content).toBe(content)
    kv.get.mockResolvedValueOnce(snapshot)
    const imported = await (await read(slug)).json()
    expect(imported.content).toBe(content)

    const { container } = render(createElement(SharedNoteView, { ...imported, openInAppUrl: "/notepad" }))
    const marks = Array.from(container.querySelectorAll("mark"))
    expect(marks.map(mark => [mark.textContent, mark.dataset.color])).toEqual([
      ["One", "#fef08a"], ["two", "#bbf7d0"], ["inline", "#bfdbfe"], ["alternate", "#fbcfe8"], ["block", "#e9d5ff"],
    ])
    expect(container.querySelector("strong mark")?.textContent).toBe("two")
    expect(container.querySelector("p code mark")?.textContent).toBe("inline")
    expect(container.querySelector("p mark code")?.textContent).toBe("alternate")
    expect(container.querySelector("pre code")?.textContent).toBe("uncolored\nblock")
    expect(container.querySelector("pre code mark")?.hasAttribute("style")).toBe(false)
  })

  it("restores recognized palette colors from imported mark styles without retaining arbitrary styling", () => {
    const content = '<p><mark style="background-color:#bfdbfe;position:fixed">Blue</mark> '
      + '<mark data-color="rgb(233, 213, 255)">Purple</mark> <mark data-color="#FBCFE8">Pink</mark> '
      + '<mark style="background-color:#202020">Other</mark> <mark>Default</mark></p>'
    const { container } = render(createElement(SharedNoteView, {
      content, createdAt: "2026-01-01", expiresAt: null, openInAppUrl: "/notepad",
    }))
    expect(Array.from(container.querySelectorAll("mark"), mark => mark.getAttribute("data-color")))
      .toEqual(["#bfdbfe", "#e9d5ff", "#fbcfe8", null, null])
    expect(container.querySelector("mark[style]")).toBeNull()
  })

  it.each(["OldLink8", "N".repeat(21)])("opens an existing snapshot by its token", async slug => {
    const note = { content: "<p>A note</p>", createdAt: "2026-01-01T00:00:00.000Z", expiresAt: null }
    kv.get.mockResolvedValue(note)
    const response = await read(slug)
    expect(kv.get).toHaveBeenCalledWith(`note:${slug}`)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(note)
    expect(response.headers.get("Cache-Control")).toContain("no-store")
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer")
  })

  it("returns the author-supplied reader title as text", async () => {
    kv.get.mockResolvedValue({ title: "<b>Title</b>", content: "<p>Body</p>", createdAt: "2026-01-01", expiresAt: null })
    expect((await (await read("N".repeat(21))).json()).title).toBe("<b>Title</b>")
  })

  it("returns an uncached 404 for expired or unknown links", async () => {
    kv.get.mockResolvedValue(null)
    const response = await read("OldLink8")
    expect(response.status).toBe(404)
    expect(response.headers.get("Cache-Control")).toContain("no-store")
  })

  it("leaves storage diagnostics out of the response", async () => {
    kv.get.mockRejectedValue(new Error("private database detail"))
    const response = await read("OldLink8")
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain("private database detail")
    expect(response.headers.get("Cache-Control")).toContain("no-store")
  })

  it("uses a generic preview and suppresses indexing and referrers", () => {
    expect(metadata).toMatchObject({
      referrer: "no-referrer",
      robots: { index: false, follow: false, nosnippet: true },
      openGraph: { title: metadata.title, description: metadata.description },
      twitter: { title: metadata.title, description: metadata.description },
    })
  })

  it("renders the supplied title as text and preserves read-only task formatting", async () => {
    const { container } = render(createElement(SharedNoteView, {
      title: "<b>Reading list</b>",
      content: '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked></label><div><p>One more chapter</p></div></li></ul>',
      createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: null,
      openInAppUrl: "/notepad?openShared=OldLink8",
    }))
    expect(screen.getByRole("heading", { name: "<b>Reading list</b>" }).children).toHaveLength(0)
    const checkbox = await screen.findByRole("checkbox") as HTMLInputElement
    expect(checkbox.disabled).toBe(true)
    expect(checkbox.checked).toBe(true)
    expect(container.querySelector('ul[data-type="taskList"]')?.textContent).toContain("One more chapter")
    expect(screen.getByRole("link", { name: "Save to my notes" }).getAttribute("href"))
      .toBe("/notepad?openShared=OldLink8")
  })

  it("shows a local image with its alt text and strips remote images and alternate sources from old snapshots", async () => {
    const { container } = render(createElement(SharedNoteView, {
      content: `<picture><source srcset="https://example.org/a.png"><img src="${png}" alt="A &amp; B" title="Garden" srcset="https://example.org/b.png"></picture>
        <img src="https://example.org/c.png"><img src="data:image/svg+xml;base64,PHN2Zy8+"><input type="image" src="https://example.org/d.png">`,
      createdAt: "2026-01-01T00:00:00.000Z", expiresAt: null, openInAppUrl: "/notepad",
    }))
    const img = await screen.findByRole("img", { name: "A & B" })
    expect(img.getAttribute("src")).toBe(png)
    expect(img.getAttribute("title")).toBe("Garden")
    expect(container.querySelectorAll("[src]")).toHaveLength(1)
    expect(container.querySelector("source, [srcset]")).toBeNull()
  })
})
