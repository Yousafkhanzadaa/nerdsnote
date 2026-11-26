import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CreateShareLinkDialog } from "@/components/create-share-link-dialog"
import * as shareImages from "@/lib/share-images"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(window.navigator, "share")
  Reflect.deleteProperty(window.navigator, "canShare")
  Reflect.deleteProperty(window.navigator, "clipboard")
  Reflect.deleteProperty(URL, "createObjectURL")
  Reflect.deleteProperty(URL, "revokeObjectURL")
})

describe("share link dialog", () => {
  it("submits only the prepared copy after consent and surfaces the server's size-limit message", async () => {
    const original = '<p>Travel</p><img alt="Map" src="local-note-image">'
    const compact = '<p>Travel</p><img alt="Map" src="shared-image">'
    const prepare = vi.spyOn(shareImages, "prepareShareContent").mockResolvedValue(compact)
    const error = "This note exceeds the image share size limit."
    const request = vi.fn().mockResolvedValue({
      ok: false, status: 413, json: async () => ({ ok: false, error, code: "CONTENT_TOO_LARGE" }),
    })
    vi.stubGlobal("fetch", request)
    render(<CreateShareLinkDialog isOpen onClose={() => undefined} noteContent={original} />)
    expect(screen.getByText(/compact copies of the images/)).toBeTruthy()
    expect(prepare).not.toHaveBeenCalled()
    expect(request).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Create Link" }))
    expect(await screen.findByText(error)).toBeTruthy()
    expect(prepare).toHaveBeenCalledWith(original, expect.any(AbortSignal))
    expect(JSON.parse(request.mock.calls[0][1].body).content).toBe(compact)
  })

  it("keeps the full-size image off the network if preparing its copy fails", async () => {
    const error = "This image could not be prepared."
    vi.spyOn(shareImages, "prepareShareContent").mockRejectedValue(new Error(error))
    const request = vi.fn()
    vi.stubGlobal("fetch", request)
    render(<CreateShareLinkDialog isOpen onClose={() => undefined} noteContent={'<img alt="Map">'} />)
    fireEvent.click(screen.getByRole("button", { name: "Create Link" }))
    expect(await screen.findByText(error)).toBeTruthy()
    expect(request).not.toHaveBeenCalled()
  })

  it("cancels a pending image conversion before it can upload", async () => {
    let complete!: (content: string) => void
    const prepare = vi.spyOn(shareImages, "prepareShareContent").mockImplementation(
      () => new Promise<string>(resolve => { complete = resolve }),
    )
    const close = vi.fn()
    const request = vi.fn()
    vi.stubGlobal("fetch", request)
    render(<CreateShareLinkDialog isOpen onClose={close} noteContent={'<img alt="Map">'} />)
    fireEvent.click(screen.getByRole("button", { name: "Create Link" }))
    fireEvent.click(screen.getByRole("button", { name: "Close share dialog" }))
    await act(async () => complete("<p>Ready</p>"))
    expect(prepare.mock.calls[0][1]?.aborted).toBe(true)
    expect(close).toHaveBeenCalledOnce()
    expect(request).not.toHaveBeenCalled()
  })

  it("renders a local QR code and download action after creating a link", async () => {
    const shareUrl = "https://nerdsnote.example/s/test-link"
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          url: shareUrl,
          expiresAt: "2026-08-01T00:00:00.000Z",
        }),
      }),
    )

    render(
      <CreateShareLinkDialog
        isOpen
        onClose={() => undefined}
        noteContent="Shared note"
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Create Link" }))

    fireEvent.click(await screen.findByText("QR code", { selector: "summary" }))
    expect(screen.getByText("Scan to open the shared note")).toBeTruthy()
    expect(screen.getByTitle("QR code for shared note")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Download QR" })).toBeTruthy()
    expect((screen.getByDisplayValue(shareUrl) as HTMLInputElement).value).toBe(shareUrl)
    expect(writeText).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }))
    expect(writeText).toHaveBeenCalledWith(shareUrl)
  })

  it("shares the link and a PNG QR attachment together when supported", async () => {
    const shareUrl = "https://nerdsnote.example/s/share-both"
    const share = vi.fn().mockResolvedValue(undefined)
    const canShare = vi.fn().mockReturnValue(true)

    Object.defineProperties(window.navigator, {
      clipboard: {
        configurable: true,
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
      },
      share: { configurable: true, value: share },
      canShare: { configurable: true, value: canShare },
    })
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: vi.fn(() => "blob:qr-code") },
      revokeObjectURL: { configurable: true, value: vi.fn() },
    })
    vi.stubGlobal(
      "Image",
      class MockImage {
        onload: (() => void) | null = null

        set src(_value: string) {
          queueMicrotask(() => this.onload?.())
        }
      },
    )
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => {
      callback(new Blob(["png"], { type: "image/png" }))
    })
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          url: shareUrl,
          expiresAt: "2026-08-01T00:00:00.000Z",
        }),
      }),
    )

    render(
      <CreateShareLinkDialog
        isOpen
        onClose={() => undefined}
        noteContent="Shared note"
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: "Create Link" }))
    await screen.findByText("Scan to open the shared note")

    fireEvent.click(screen.getByRole("button", { name: "Share link & QR" }))

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
    const shareData = share.mock.calls[0][0] as ShareData
    expect(shareData.text).toContain(shareUrl)
    expect(shareData.files).toHaveLength(1)
    expect(shareData.files?.[0].name).toBe("nerdsnote-share-qr.png")
    expect(shareData.files?.[0].type).toBe("image/png")
  })
})
