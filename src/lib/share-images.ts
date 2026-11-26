import { isSafeNoteImageSrc } from "@/lib/note-images"
import { MAX_SHARE_REQUEST_BYTES } from "@/lib/share-types"

const MAX_EDGE = 960
const TARGET_BYTES = 80 * 1024
const TINY_BYTES = 8 * 1024
const TINY_OVERHEAD = 256
const ENCODE_ERROR = "Could not make a smaller share copy of an image. Try a smaller image or remove it from the shared note."

function checkCancelled(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Sharing was cancelled.", "AbortError")
}

function byteLength(src: string) {
  const base64Length = src.length - src.indexOf(",") - 1
  return base64Length / 4 * 3 - (src.endsWith("==") ? 2 : src.endsWith("=") ? 1 : 0)
}

function encode(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob?.type === type && blob.size > 0 ? blob : null), type, quality)
  })
}

function dataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === "string" && isSafeNoteImageSrc(reader.result)
      ? resolve(reader.result) : reject(new Error(ENCODE_ERROR))
    reader.onerror = () => reject(new Error(ENCODE_ERROR))
    reader.readAsDataURL(blob)
  })
}

async function compressImage(src: string, budget: number, signal?: AbortSignal) {
  const image = new Image()
  image.src = src
  try {
    await image.decode()
  } catch {
    throw new Error("An image could not be opened for sharing. Replace it with a PNG, JPEG, or WebP and try again.")
  }
  checkCancelled(signal)
  const originalEdge = Math.max(image.naturalWidth, image.naturalHeight)
  if (!image.naturalWidth || !image.naturalHeight) throw new Error(ENCODE_ERROR)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error(ENCODE_ERROR)
  let edge = Math.min(originalEdge, MAX_EDGE)
  const floor = Math.min(edge, 240)
  const originalBytes = byteLength(src)
  const opaque = src.startsWith("data:image/jpeg;")
  try {
    for (;;) {
      checkCancelled(signal)
      canvas.width = Math.max(1, Math.round(image.naturalWidth * edge / originalEdge))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * edge / originalEdge))
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      // PNG keeps lettering crisp and WebP preserves alpha. Only opaque JPEG
      // inputs are allowed to use a JPEG output.
      const candidates = [
        await encode(canvas, "image/webp", 0.82),
        await encode(canvas, "image/png"),
      ]
      if (opaque) candidates.push(await encode(canvas, "image/jpeg", 0.8))
      const blobs = candidates.filter((blob): blob is Blob => blob !== null)
      checkCancelled(signal)
      if (!blobs.length) throw new Error(ENCODE_ERROR)
      const smallest = blobs.reduce((a, b) => a.size < b.size ? a : b)
      const fits = (blob: Blob) => blob.size <= budget && blob.size <= originalBytes &&
        4 * Math.ceil(blob.size / 3) + `data:${blob.type};base64,`.length <= src.length
      const lossless = blobs.find(blob => blob.type === "image/png" && fits(blob) && blob.size <= smallest.size * 1.2)
      const best = lossless ?? blobs.filter(fits).sort((a, b) => a.size - b.size)[0]
      if (best) return await dataURL(best)
      // A fresh encoding can cost a small header on a tiny thumbnail.
      // Never fall back to source bytes: even a tiny source can carry EXIF.
      if (originalBytes <= TINY_BYTES && smallest.size <= budget &&
          smallest.size <= originalBytes + TINY_OVERHEAD) return await dataURL(smallest)
      if (edge <= floor) throw new Error(ENCODE_ERROR)
      const factor = Math.min(0.8, Math.sqrt(Math.min(budget, originalBytes) / smallest.size) * 0.95)
      edge = Math.max(floor, Math.floor(edge * factor))
    }
  } catch {
    checkCancelled(signal)
    throw new Error(ENCODE_ERROR)
  } finally {
    canvas.width = canvas.height = 0
  }
}

/** Create an independent HTML snapshot for an explicitly requested share. */
export async function prepareShareContent(content: string, signal?: AbortSignal): Promise<string> {
  checkCancelled(signal)
  if (!/<(?:img|image)\b/i.test(content)) return content
  const template = document.createElement("template")
  template.innerHTML = content
  const images = Array.from(template.content.querySelectorAll("img"))
  if (!images.length) return content

  const sources = images.map(img => {
    const src = img.getAttribute("src")
    if (!isSafeNoteImageSrc(src) || img.hasAttribute("srcset") || img.closest("picture")?.querySelector("source")) {
      throw new Error("Replace linked or unsupported images with an embedded PNG, JPEG, or WebP before sharing.")
    }
    img.removeAttribute("src")
    return src
  })
  // Budget the JSON escaping and base64 expansion. Leave room for the title,
  // expiry and image attribute syntax. Tiny icons need only their actual size.
  const markupBytes = new TextEncoder().encode(JSON.stringify(template.innerHTML)).length
  const available = Math.floor((MAX_SHARE_REQUEST_BYTES - markupBytes - 1024 - images.length * 40) * 0.75)
  if (available <= 0) throw new Error("This note is too large to share. Try fewer images or less text.")
  const weights = sources.map(src => {
    const bytes = byteLength(src)
    return Math.min(bytes <= TINY_BYTES ? bytes + TINY_OVERHEAD : bytes, TARGET_BYTES)
  })
  const scale = Math.min(1, available / weights.reduce((sum, bytes) => sum + bytes, 0))
  const copies = new Map<string, string>()
  for (const [index, src] of sources.entries()) {
    checkCancelled(signal)
    let copy = copies.get(src)
    if (!copy) {
      copy = await compressImage(src, Math.floor(weights[index] * scale), signal)
      copies.set(src, copy)
    }
    images[index].setAttribute("src", copy)
  }
  checkCancelled(signal)
  return template.innerHTML
}
