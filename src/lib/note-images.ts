export const MAX_IMAGE_BYTES = 512 * 1024
export const MAX_IMAGE_INPUT_BYTES = 12 * 1024 * 1024

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const
type ImageType = (typeof IMAGE_TYPES)[number]
export const NOTE_IMAGE_ACCEPT = IMAGE_TYPES.join(",")
const MAX_EDGE = 1920
const MAX_EMBEDDED_PIXELS = 16 * 1024 * 1024

// Check the container signature and its first required chunk/marker.
function imageType(header: string): ImageType | undefined {
  if (header.startsWith("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR")) return "image/png"
  if (header.startsWith("\xff\xd8\xff")) return "image/jpeg"
  if (header.startsWith("RIFF") && header.slice(8, 12) === "WEBP" &&
      ["VP8 ", "VP8L", "VP8X"].includes(header.slice(12, 16))) return "image/webp"
}

function fitsPixelLimit(width: number, height: number) {
  return width > 0 && height > 0 && width <= 32768 && height <= 32768 &&
    width * height <= MAX_EMBEDDED_PIXELS
}

function validDimensions(type: ImageType, payload: string) {
  // PNG and all three WebP container variants put dimensions in a fixed header.
  // JPEG can have variable-length metadata segments before its frame header.
  const binary = atob(type === "image/jpeg" ? payload : payload.slice(0, 44))
  const byte = (offset: number) => binary.charCodeAt(offset)
  const be16 = (offset: number) => byte(offset) * 256 + byte(offset + 1)
  if (type === "image/png") {
    const be32 = (offset: number) => be16(offset) * 65536 + be16(offset + 2)
    return fitsPixelLimit(be32(16), be32(20))
  }
  if (type === "image/webp") {
    if (binary.length < 25) return false
    const chunk = binary.slice(12, 16)
    if (chunk === "VP8X") {
      const le24 = (offset: number) => byte(offset) + byte(offset + 1) * 256 + byte(offset + 2) * 65536
      return fitsPixelLimit(le24(24) + 1, le24(27) + 1)
    }
    if (chunk === "VP8L") {
      if (byte(20) !== 0x2f) return false
      const width = 1 + byte(21) + ((byte(22) & 0x3f) << 8)
      const height = 1 + (byte(22) >> 6) + (byte(23) << 2) + ((byte(24) & 0x0f) << 10)
      return fitsPixelLimit(width, height)
    }
    if (binary.length < 30 || binary.slice(23, 26) !== "\x9d\x01\x2a") return false
    const le14 = (offset: number) => byte(offset) + ((byte(offset + 1) & 0x3f) << 8)
    return fitsPixelLimit(le14(26), le14(28))
  }
  let offset = 2
  while (byte(offset) === 0xff) {
    while (byte(offset) === 0xff) offset++
    const marker = byte(offset++)
    if (marker === 0xda || marker === 0xd9) break
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
    const length = be16(offset)
    if (!(length >= 2 && offset + length <= binary.length)) break
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return length >= 8 && fitsPixelLimit(be16(offset + 5), be16(offset + 3))
    }
    offset += length
  }
  return false
}

/** Shared by the editor and reader. Validation only inspects the encoded data. */
export function isSafeNoteImageSrc(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 32 + 4 * Math.ceil(MAX_IMAGE_BYTES / 3)) return false
  const prefix = /^data:(image\/(?:png|jpeg|webp));base64,/.exec(value)
  if (!prefix) return false
  const payload = value.slice(prefix[0].length)
  if (!payload.length || payload.length % 4 !== 0) return false
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0
  const byteLength = payload.length / 4 * 3 - padding
  if (byteLength > MAX_IMAGE_BYTES || /[^A-Za-z0-9+/]/.test(payload.slice(0, payload.length - padding))) {
    return false
  }
  try {
    // Native decoders can accept nonzero padding bits. Require canonical base64.
    const end = payload.slice(-4)
    const type = imageType(atob(payload.slice(0, 32)))
    return btoa(atob(end)) === end && type !== undefined && type === prefix[1] && validDimensions(type, payload)
  } catch {
    return false
  }
}

function readBlob(blob: Blob, asDataUrl: true): Promise<string>
function readBlob(blob: Blob, asDataUrl: false): Promise<ArrayBuffer>
function readBlob(blob: Blob, asDataUrl: boolean): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result !== null) resolve(reader.result)
      else reject(new Error("The image could not be read. Choose the file again."))
    }
    reader.onerror = reader.onabort = () => reject(new Error("The image could not be read. Choose the file again."))
    if (asDataUrl) reader.readAsDataURL(blob)
    else reader.readAsArrayBuffer(blob)
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("This image could not be opened. Export it as a PNG or JPEG and try again."))
    image.src = url
  })
}

function encode(canvas: HTMLCanvasElement, type: ImageType): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (blob) resolve(blob)
    else reject(new Error("This browser could not prepare the image. Try a smaller image."))
  }, type, 0.86))
}

/** Rasterize the user's selection locally. Only canvas output enters the note. */
export async function readNoteImageFile(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_INPUT_BYTES) throw new Error("Choose an image of 12 MB or smaller.")
  if (!file.size || (file.type && !IMAGE_TYPES.some(type => type === file.type))) {
    throw new Error("Choose a PNG, JPEG, or WebP image.")
  }
  const bytes = await readBlob(file.slice(0, 24), false)
  const type = imageType(String.fromCharCode(...new Uint8Array(bytes)))
  if (!type || (file.type && file.type !== type)) {
    throw new Error("The file contents must match a PNG, JPEG, or WebP image.")
  }

  const url = URL.createObjectURL(file)
  try {
    const image = await loadImage(url)
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("The image is empty. Choose another file.")
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) throw new Error("This browser could not prepare the image. Try another browser.")
    let scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    let outputType = type
    for (let attempt = 0; attempt < 6; attempt++) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      let blob = await encode(canvas, outputType)
      if (blob.size > MAX_IMAGE_BYTES && outputType === "image/png") {
        // Try retaining screenshot detail and alpha at this resolution first.
        outputType = "image/webp"
        blob = await encode(canvas, outputType)
      }
      if (blob.size <= MAX_IMAGE_BYTES) {
        const src = await readBlob(blob, true)
        if (isSafeNoteImageSrc(src)) return src
        throw new Error("This browser could not encode the image. Try a different browser.")
      }
      scale *= Math.min(0.8, Math.sqrt(MAX_IMAGE_BYTES / blob.size) * 0.95)
    }
    throw new Error("The image is too large to embed. Crop it or choose a smaller file.")
  } finally {
    URL.revokeObjectURL(url)
  }
}
