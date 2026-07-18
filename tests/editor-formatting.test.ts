import { afterEach, describe, expect, it } from "vitest"
import { Editor } from "@tiptap/core"
import { Highlight } from "@tiptap/extension-highlight"
import { TableKit } from "@tiptap/extension-table"
import StarterKit from "@tiptap/starter-kit"

const editors: Editor[] = []

function createEditor(content: string) {
  const editor = new Editor({
    content,
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      TableKit.configure({
        table: {
          allowTableNodeSelection: true,
          cellMinWidth: 120,
          renderWrapper: true,
          resizable: true,
        },
      }),
    ],
  })

  editors.push(editor)
  return editor
}

function countNodes(editor: Editor, nodeName: string) {
  let count = 0

  editor.state.doc.descendants((node) => {
    if (node.type.name === nodeName) {
      count += 1
    }
  })

  return count
}

afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy())
})

describe("editor formatting", () => {
  it("persists the selected highlight color in HTML", () => {
    const editor = createEditor("<p>Important detail</p>")
    editor.commands.setTextSelection({ from: 1, to: 10 })

    expect(editor.commands.setHighlight({ color: "#fef08a" })).toBe(true)
    expect(editor.getHTML()).toContain('data-color="#fef08a"')
    expect(editor.getHTML()).toContain("<mark")
  })

  it("inserts a table and supports row and column editing", () => {
    const editor = createEditor("<p></p>")

    expect(editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })).toBe(true)
    expect(countNodes(editor, "table")).toBe(1)
    expect(countNodes(editor, "tableRow")).toBe(3)
    expect(countNodes(editor, "tableHeader")).toBe(3)
    expect(editor.getHTML()).toContain('class="tableWrapper"')

    expect(editor.commands.addRowAfter()).toBe(true)
    expect(editor.commands.addColumnAfter()).toBe(true)
    expect(countNodes(editor, "tableRow")).toBe(4)
    expect(countNodes(editor, "tableHeader")).toBe(4)
    expect(countNodes(editor, "tableCell")).toBe(12)
  })
})
