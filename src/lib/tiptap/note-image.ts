import { Node } from "@tiptap/core"
import { isSafeNoteImageSrc } from "@/lib/note-images"

export const NoteImage = Node.create({
  name: "noteImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      title: { default: null },
    }
  },

  parseHTML() {
    return [{
      tag: "img[src]",
      getAttrs: (element) => isSafeNoteImageSrc(element.getAttribute("src")) ? {} : false,
    }]
  },

  renderHTML({ node }) {
    const { src, alt, title } = node.attrs
    if (!isSafeNoteImageSrc(src)) return ["span", {}, String(alt ?? "")]
    return ["img", { src, alt: String(alt ?? ""), ...(title ? { title: String(title) } : {}) }]
  },
})
