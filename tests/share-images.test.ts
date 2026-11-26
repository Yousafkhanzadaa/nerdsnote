import { afterEach, describe, expect, it, vi } from "vitest"
import { prepareShareContent } from "@/lib/share-images"
import { MAX_SHARE_REQUEST_BYTES } from "@/lib/share-types"

const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mOwjdEBAAGfAMbFnGqmAAAAAElFTkSuQmCC"
const taggedPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAKXRFWHREZXNjcmlwdGlvbgBtZXRhZGF0YSBvbmx5IGluIHRoZSBvcmlnaW5hbIoSNgAAAAANSURBVHicY2BgYGAAAAAFAAGl9kVAAAAAAElFTkSuQmCC"
const webp = "UklGRjIAAABXRUJQVlA4ICYAAABQAQCdASoBAAEAAUAmJQBOgCgAAP7y63+hXrL76bH1xc2Q3gAAAA=="

function src(type: string, data: string) {
  return `data:image/${type};base64,${data}`
}

function output(data: string, type: string) {
  return new Blob([Uint8Array.from(atob(data), ch => ch.charCodeAt(0))], { type })
}

function mockBrowser(width: number, height: number, decode = vi.fn(async () => {})) {
  vi.stubGlobal("Image", class {
    naturalWidth = width
    naturalHeight = height
    decode = decode
  })
  const drawImage = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
  const encode = vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((done, type) => {
    done(type === "image/webp" ? output(webp, type) : output(png, "image/png"))
  })
  return { drawImage, encode, decode }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("images in a shared snapshot", () => {
  it("returns the exact text-only or escaped HTML without decoding", async () => {
    const { decode } = mockBrowser(1, 1)
    const signal = new AbortController().signal
    Object.defineProperty(signal, "throwIfAborted", { value: undefined })
    for (const content of ["a < b & other words", '<P CLASS="a">A &amp; B\n&lt;img src="example"&gt;</P>', "<!-- <img> --> plain"]) {
      expect(await prepareShareContent(content, signal)).toBe(content)
    }
    expect(decode).not.toHaveBeenCalled()
  })

  it("redraws each distinct image once and preserves its surrounding rich text and descriptions", async () => {
    const { drawImage, encode } = mockBrowser(1920, 1080)
    const original = src("png", taggedPng)
    const content = `<h2>Garden</h2><ol start="3"><li><em>Sketch</em></li></ol><img src="${original}" alt="A &amp; B" title="Morning"><img src="${original}" alt="Repeated">`
    const snapshot = await prepareShareContent(content)
    const container = document.createElement("template")
    container.innerHTML = snapshot
    expect(container.content.querySelector("ol[start='3'] em")?.textContent).toBe("Sketch")
    const images = Array.from(container.content.querySelectorAll("img"))
    expect(images.map(i => [i.getAttribute("src"), i.alt, i.title])).toEqual([
      [src("png", png), "A & B", "Morning"], [src("png", png), "Repeated", ""],
    ])
    expect(encode.mock.calls.map(call => call[1])).toEqual(["image/webp", "image/png"])
    expect(drawImage).toHaveBeenCalledOnce()
    expect(drawImage.mock.calls[0].slice(1)).toEqual([0, 0, 960, 540])
    expect(content).toContain(original)
    expect(snapshot).not.toContain(taggedPng)
  })

  it("keeps small artwork at its original dimensions and uses fresh pixels even when a small header costs more", async () => {
    const { drawImage, encode } = mockBrowser(1, 1)
    encode.mockImplementation((done, type) => {
      // Simulate a browser with only a slightly larger PNG encoding.
      done(type === "image/png" ? output(btoa(atob(png).padEnd(160, "\0")), type) : null)
    })
    const content = `<img src="${src("png", taggedPng)}">`
    const snapshot = await prepareShareContent(content)
    expect(snapshot).not.toContain(taggedPng)
    expect(snapshot).toContain("data:image/png;base64,")
    expect(drawImage.mock.calls[0].slice(1)).toEqual([0, 0, 1, 1])
  })

  it("reduces dimensions again when a detailed image exceeds the shared-image budget", async () => {
    const { drawImage, encode } = mockBrowser(1600, 800)
    encode.mockImplementation(function (this: HTMLCanvasElement, done, type) {
      if (type !== "image/webp") return done(null)
      const size = this.width === 960 ? 100 * 1024 : 65 * 1024
      done(output(btoa(atob(webp).padEnd(size, "\0")), type))
    })
    const original = btoa(atob(png).padEnd(180 * 1024, "\0"))
    const snapshot = await prepareShareContent(`<img src="${src("png", original)}">`)
    expect(drawImage.mock.calls[1][3]).toBeLessThan(960)
    expect(drawImage.mock.calls[1][3] / drawImage.mock.calls[1][4]).toBeCloseTo(2, 1)
    expect(snapshot.length).toBeLessThan(95 * 1024)
  })

  it("rejects linked images and alternate sources before starting an image decoder", async () => {
    const { decode } = mockBrowser(1, 1)
    for (const html of [
      '<img src="https://example.org/pic.png">',
      `<img src="${src("png", png)}" srcset="https://example.org/pic.png">`,
      `<picture><source srcset="https://example.org/pic.png"><img src="${src("png", png)}"></picture>`,
    ]) await expect(prepareShareContent(html)).rejects.toThrow("Replace linked")
    expect(decode).not.toHaveBeenCalled()
  })

  it("budgets for every occurrence of a photo in a multi-image note", async () => {
    const { drawImage, encode } = mockBrowser(1280, 720)
    encode.mockImplementation(function (this: HTMLCanvasElement, done, type) {
      if (type !== "image/webp") return done(null)
      const size = this.width === 960 ? 78 * 1024 : 60 * 1024
      done(output(btoa(atob(webp).padEnd(size, "\0")), type))
    })
    const original = src("png", btoa(atob(png).padEnd(110 * 1024, "\0")))
    const snapshot = await prepareShareContent(`<img src="${original}" alt="Map">`.repeat(24))
    expect(drawImage).toHaveBeenCalledTimes(2)
    expect(new TextEncoder().encode(JSON.stringify({ content: snapshot })).length).toBeLessThan(MAX_SHARE_REQUEST_BYTES)
  })

  it("rejects failed encodes and decodes rather than attaching an original", async () => {
    const content = `<img src="${src("png", btoa(atob(png).padEnd(100 * 1024, "\0")))}">`
    const { encode, decode } = mockBrowser(400, 300)
    encode.mockImplementation(done => done(null))
    await expect(prepareShareContent(content)).rejects.toThrow("Try a smaller image")
    decode.mockRejectedValue(new Error("invalid image"))
    await expect(prepareShareContent(content)).rejects.toThrow("could not be opened")
  })

  it("honors cancellation before encoding a snapshot", async () => {
    const cancel = new AbortController()
    const { encode } = mockBrowser(1, 1, vi.fn(async () => cancel.abort()))
    await expect(prepareShareContent(`<img src="${src("png", png)}">`, cancel.signal))
      .rejects.toMatchObject({ name: "AbortError" })
    expect(encode).not.toHaveBeenCalled()
  })
})
