import { afterEach, describe, expect, it, vi } from "vitest"

import { isSafeNoteImageSrc, MAX_IMAGE_BYTES, MAX_IMAGE_INPUT_BYTES, readNoteImageFile } from "@/lib/note-images"

const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mOwjdEBAAGfAMbFnGqmAAAAAElFTkSuQmCC"
const taggedPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAKXRFWHREZXNjcmlwdGlvbgBtZXRhZGF0YSBvbmx5IGluIHRoZSBvcmlnaW5hbIoSNgAAAAANSURBVHicY2BgYGAAAAAFAAGl9kVAAAAAAElFTkSuQmCC"
const jpeg = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCMAThH/9k="
const webp = "UklGRjIAAABXRUJQVlA4ICYAAABQAQCdASoBAAEAAUAmJQBOgCgAAP7y63+hXrL76bH1xc2Q3gAAAA=="

const losslessWebp = "UklGRhwAAABXRUJQVlA4TBAAAAAvAsAAEAdQgaxDUQIR0f8A"
const alphaWebp = "UklGRk4AAABXRUJQVlA4WAoAAAAQAAAAAgAAAwAAQUxQSAoAAAABB1CUiAhERP8DVlA4IB4AAABQAQCdASoDAAQAAUAmJZwABAAAAP79EcfnjeaIAAA="
const progressiveJpeg = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wgARCAAEAAMDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/aAAwDAQACEAMQAAABgBR//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAABD/AP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Qf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Qf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Qf//Z"

function bytes(base64: string) {
  return Uint8Array.from(atob(base64), character => character.charCodeAt(0))
}

function mockDecoder(width: number, height: number, fail = false) {
  const revoke = vi.fn()
  vi.stubGlobal("URL", class extends URL {
    static createObjectURL = vi.fn(() => "blob:local-image")
    static revokeObjectURL = revoke
  })
  vi.stubGlobal("Image", class {
    readonly naturalWidth = width
    readonly naturalHeight = height
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_value: string) {
      queueMicrotask(() => fail ? this.onerror?.() : this.onload?.())
    }
  })
  const drawImage = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
  return { drawImage, revoke }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("embedded note images", () => {
  it("admits canonical PNG, JPEG and WebP data with matching signatures", () => {
    for (const [type, data] of [["png", png], ["jpeg", jpeg], ["jpeg", progressiveJpeg], ["webp", webp], ["webp", losslessWebp], ["webp", alphaWebp]]) {
      expect(isSafeNoteImageSrc(`data:image/${type};base64,${data}`)).toBe(true)
    }
    for (const src of [
      undefined, "blob:photo", "https://example.org/image.png",
      `data:image/svg+xml;base64,${png}`, `data:image/png;base64,${jpeg}`,
      `data:image/png;base64, ${png}`, `data:image/png;name=pic;base64,${png}`,
      `data:image/webp;base64,${webp.slice(0, -3)}B==`,
      `data:image/png;base64,${png}\n`, `data:image/png;base64,${btoa("Plain text")}`,
    ]) expect(isSafeNoteImageSrc(src)).toBe(false)
  })

  it("bounds decoded image bytes even when adjacent sizes have the same padded length", () => {
    const header = atob(png)
    const atLimit = header.padEnd(MAX_IMAGE_BYTES, "\0")
    expect(isSafeNoteImageSrc(`data:image/png;base64,${btoa(atLimit)}`)).toBe(true)
    expect(isSafeNoteImageSrc(`data:image/png;base64,${btoa(atLimit + "\0")}`)).toBe(false)
  })

  it("rejects oversized pixel dimensions before rendering", () => {
    const largePng = bytes(png)
    const pngHeader = new DataView(largePng.buffer)
    pngHeader.setUint32(16, 8192)
    pngHeader.setUint32(20, 8192)
    const largeJpeg = bytes(jpeg)
    const frameOffset = atob(jpeg).indexOf("\xff\xc0")
    const jpegHeader = new DataView(largeJpeg.buffer)
    jpegHeader.setUint16(frameOffset + 5, 8192)
    jpegHeader.setUint16(frameOffset + 7, 8192)
    const largeWebp = bytes(alphaWebp)
    largeWebp.set([0xff, 0x1f, 0, 0xff, 0x1f, 0], 24)
    expect(isSafeNoteImageSrc(`data:image/png;base64,${btoa(String.fromCharCode(...largePng))}`)).toBe(false)
    expect(isSafeNoteImageSrc(`data:image/jpeg;base64,${btoa(String.fromCharCode(...largeJpeg))}`)).toBe(false)
    expect(isSafeNoteImageSrc(`data:image/webp;base64,${btoa(String.fromCharCode(...largeWebp))}`)).toBe(false)
  })

  it("tries an alpha-capable encoding before shrinking a large screenshot", async () => {
    const { drawImage } = mockDecoder(1600, 900)
    const encode = vi.spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementationOnce(callback => callback(new Blob([new Uint8Array(MAX_IMAGE_BYTES + 1)], { type: "image/png" })))
      .mockImplementationOnce(callback => callback(new Blob([bytes(alphaWebp)], { type: "image/webp" })))
    const file = new File([bytes(png)], "transparent.png", { type: "image/png" })
    expect(await readNoteImageFile(file)).toBe(`data:image/webp;base64,${alphaWebp}`)
    expect(encode.mock.calls.map(call => call[1])).toEqual(["image/png", "image/webp"])
    expect(drawImage).toHaveBeenCalledTimes(1)
  })

  it("redraws small screenshots at original size and embeds only the canvas output", async () => {
    const { drawImage, revoke } = mockDecoder(1, 1)
    const encode = vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback, type) => {
      callback(new Blob([bytes(png)], { type }))
    })
    const src = await readNoteImageFile(new File([bytes(taggedPng)], "screenshot.png", { type: "image/png" }))
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1, 1)
    expect(encode.mock.calls[0][1]).toBe("image/png")
    expect(src).toBe(`data:image/png;base64,${png}`)
    expect(atob(src.split(",")[1])).not.toContain("metadata only in the original")
    expect(revoke).toHaveBeenCalledWith("blob:local-image")
  })

  it("fits large phone photos by reducing dimensions and retaining their proportions", async () => {
    const { drawImage } = mockDecoder(4000, 3000)
    const file = new File([bytes(jpeg), new Uint8Array(2 * MAX_IMAGE_BYTES)], "photo.jpg", { type: "image/jpeg" })
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementationOnce(callback => callback(new Blob([new Uint8Array(2 * MAX_IMAGE_BYTES)], { type: "image/jpeg" })))
      .mockImplementationOnce(callback => callback(new Blob([bytes(jpeg)], { type: "image/jpeg" })))
    expect(await readNoteImageFile(file)).toBe(`data:image/jpeg;base64,${jpeg}`)
    expect(drawImage.mock.calls[0].slice(3)).toEqual([1920, 1440])
    const [, , , width, height] = drawImage.mock.calls[1]
    expect(width).toBeLessThan(1920)
    expect(width / height).toBeCloseTo(4 / 3, 2)
  })

  it("reports unsupported, oversized, damaged or unencodable files", async () => {
    await expect(readNoteImageFile(new File(["text"], "vector.svg", { type: "image/svg+xml" }))).rejects.toThrow("Choose a PNG")
    const oversized = new File([new Uint8Array(MAX_IMAGE_INPUT_BYTES + 1)], "large.png", { type: "image/png" })
    await expect(readNoteImageFile(oversized)).rejects.toThrow("12 MB")
    await expect(readNoteImageFile(new File([bytes(webp)], "wrong.jpg", { type: "image/jpeg" }))).rejects.toThrow("contents")
    const { revoke } = mockDecoder(0, 0, true)
    const file = new File([bytes(png)], "photo.png", { type: "image/png" })
    await expect(readNoteImageFile(file)).rejects.toThrow("could not be opened")
    expect(revoke).toHaveBeenCalled()
    mockDecoder(1, 1)
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(callback => callback(null))
    await expect(readNoteImageFile(file)).rejects.toThrow("smaller image")
  })
})
