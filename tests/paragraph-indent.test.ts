import { afterEach, describe, expect, it } from "vitest"
import { Editor } from "@tiptap/core"
import { Highlight } from "@tiptap/extension-highlight"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TableKit } from "@tiptap/extension-table"
import StarterKit from "@tiptap/starter-kit"

import { ParagraphIndent } from "@/lib/tiptap/paragraph-indent"

const editors: Editor[] = []

function createEditor(content: string) {
  const editor = new Editor({
    content,
    extensions: [StarterKit, ParagraphIndent],
  })

  editors.push(editor)
  return editor
}

function createFullEditor(content: string) {
  const editor = new Editor({
    content,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      TableKit,
      ParagraphIndent,
    ],
  })

  editors.push(editor)
  return editor
}

afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy())
})

describe("paragraph indentation", () => {
  it("indents and outdents the current paragraph with Tab", () => {
    const editor = createEditor("<p>Paragraph</p>")
    editor.commands.setTextSelection(2)

    expect(editor.commands.keyboardShortcut("Tab")).toBe(true)
    expect(editor.getHTML()).toBe('<p data-indent="1">Paragraph</p>')

    expect(editor.commands.keyboardShortcut("Shift-Tab")).toBe(true)
    expect(editor.getHTML()).toBe("<p>Paragraph</p>")
  })

  it("indents an empty paragraph with Tab", () => {
    const editor = createEditor("<p></p>")
    editor.commands.setTextSelection(1)

    expect(editor.commands.keyboardShortcut("Tab")).toBe(true)
    expect(editor.getHTML()).toBe('<p data-indent="1"></p>')
  })

  it("handles a real DOM Tab keydown from the editor", () => {
    const editor = createFullEditor("<p>Paragraph</p>")
    editor.commands.setTextSelection(2)
    const tabEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Tab",
    })

    editor.view.dom.dispatchEvent(tabEvent)

    expect(tabEvent.defaultPrevented).toBe(true)
    expect(editor.getHTML()).toBe('<p data-indent="1">Paragraph</p>')
  })

  it("caps paragraph indentation at six levels", () => {
    const editor = createEditor('<p data-indent="6">Paragraph</p>')
    editor.commands.setTextSelection(2)

    expect(editor.commands.indentParagraph()).toBe(false)
    expect(editor.getHTML()).toBe('<p data-indent="6">Paragraph</p>')
  })

  it("leaves Tab available to list-item nesting", () => {
    const editor = createEditor("<ul><li><p>Parent</p></li><li><p>Child</p></li></ul>")
    let secondParagraphPosition: number | null = null
    let paragraphCount = 0

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "paragraph") {
        paragraphCount += 1
        if (paragraphCount === 2) {
          secondParagraphPosition = pos
        }
      }
    })

    expect(secondParagraphPosition).not.toBeNull()
    editor.commands.setTextSelection((secondParagraphPosition ?? 0) + 1)
    expect(editor.commands.keyboardShortcut("Tab")).toBe(true)
    expect(editor.getHTML()).toContain("<ul><li><p>Child</p></li></ul>")
    expect(editor.getHTML()).not.toContain("data-indent")
  })
})
