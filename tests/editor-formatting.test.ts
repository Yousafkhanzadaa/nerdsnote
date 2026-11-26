import { afterEach, describe, expect, it } from "vitest"
import { Editor } from "@tiptap/core"
import { Highlight } from "@tiptap/extension-highlight"
import { TableKit } from "@tiptap/extension-table"
import { noteStarterKit } from "@/lib/tiptap/note-starter-kit"

const editors: Editor[] = []

function createEditor(content: string) {
  const editor = new Editor({
    content,
    extensions: [
      ...noteStarterKit,
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

  it("highlights across prose, inline code and a multiline code block and reopens the same selection of words", () => {
    const editor = createEditor('<p>Try <code>sum</code> now</p><pre><code class="language-js">sum(1,\n  2)</code></pre><p>Done</p>')
    const original = editor.getHTML()
    // Start inside the first paragraph and stop before the code block's closing parenthesis.
    const blockStart = editor.state.doc.firstChild!.nodeSize + 1
    const range = { from: 3, to: blockStart + "sum(1,\n  2".length }
    editor.commands.setTextSelection(range)
    expect(editor.commands.setHighlight({ color: "#bfdbfe" })).toBe(true)

    const reopened = createEditor(editor.getHTML())
    const body = reopened.view.dom
    expect(Array.from(body.querySelectorAll("mark"), mark => mark.textContent))
      .toEqual(["y ", "sum", " now", "sum(1,\n  2"])
    expect(body.querySelectorAll('mark[data-color="#bfdbfe"]')).toHaveLength(4)
    expect(body.querySelector("p code mark")?.textContent).toBe("sum")
    expect(body.querySelector("pre code.language-js mark")?.textContent).toBe("sum(1,\n  2")

    reopened.commands.setTextSelection(range)
    expect(reopened.commands.unsetHighlight()).toBe(true)
    expect(reopened.getHTML()).toBe(original)
  })

  it("keeps the other formatting marks out of inline and block code", () => {
    const { marks, nodes } = createEditor("<p></p>").schema
    for (const mark of Object.values(marks)) {
      expect(marks.code.excludes(mark), mark.name).toBe(mark !== marks.highlight)
      expect(nodes.codeBlock.allowsMarkType(mark), mark.name).toBe(mark === marks.highlight)
    }
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
