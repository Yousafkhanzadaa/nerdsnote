import type { Editor } from "@tiptap/core"

export const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Purple", value: "#e9d5ff" },
] as const

export function toggleNoteHighlight(editor: Editor, color: string) {
  const command = editor.chain().focus()
  return editor.isActive("highlight") ? command.unsetHighlight().run() : command.setHighlight({ color }).run()
}
