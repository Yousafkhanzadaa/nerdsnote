import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { Editor } from "@tiptap/core"
import { TableKit } from "@tiptap/extension-table"
import StarterKit from "@tiptap/starter-kit"

import { EditorToolbar } from "@/components/editor-toolbar"
import { ParagraphIndent } from "@/lib/tiptap/paragraph-indent"

const editors: Editor[] = []

function countNodes(editor: Editor, type: string) {
  let count = 0

  editor.state.doc.descendants((node) => {
    if (node.type.name === type) {
      count += 1
    }
  })

  return count
}

afterEach(() => {
  cleanup()
  editors.splice(0).forEach((editor) => editor.destroy())
})

describe("editor toolbar indentation", () => {
  it("indents the current paragraph when the toolbar button is clicked", () => {
    const editor = new Editor({
      content: "<p>Paragraph</p>",
      extensions: [StarterKit, ParagraphIndent],
    })
    editors.push(editor)
    editor.commands.setTextSelection(2)
    render(<EditorToolbar editor={editor} />)

    const indentButton = screen.getByRole("button", { name: "Indent paragraph" })
    expect(indentButton.hasAttribute("disabled")).toBe(false)

    fireEvent.click(indentButton)

    expect(editor.getHTML()).toBe('<p data-indent="1">Paragraph</p>')
  })

  it("inserts a custom table size instead of limiting users to presets", () => {
    const editor = new Editor({
      content: "<p>Paragraph</p>",
      extensions: [StarterKit, ParagraphIndent, TableKit],
    })
    editors.push(editor)
    render(<EditorToolbar editor={editor} />)

    fireEvent.pointerDown(screen.getByTitle("Insert table"), {
      button: 0,
      ctrlKey: false,
    })
    fireEvent.change(screen.getByLabelText("Rows"), { target: { value: "5" } })
    fireEvent.change(screen.getByLabelText("Columns"), { target: { value: "7" } })
    fireEvent.click(screen.getAllByRole("button", { name: "Insert table" }).at(-1)!)

    expect(countNodes(editor, "table")).toBe(1)
    expect(countNodes(editor, "tableRow")).toBe(5)
    expect(countNodes(editor, "tableHeader")).toBe(7)
    expect(countNodes(editor, "tableCell")).toBe(28)
  })

  it("keeps independent end content outside the scrolling tools region", () => {
    const editor = new Editor({
      content: "<p>Paragraph</p>",
      extensions: [StarterKit, ParagraphIndent],
    })
    editors.push(editor)
    render(
      <EditorToolbar
        editor={editor}
        endContent={<button type="button">Exit Focus Mode</button>}
      />,
    )

    const exitButton = screen.getByRole("button", { name: "Exit Focus Mode" })
    const independentRegion = exitButton.parentElement
    const scrollingToolsRegion = independentRegion?.previousElementSibling

    expect(scrollingToolsRegion?.classList.contains("overflow-x-auto")).toBe(true)
    expect(scrollingToolsRegion?.contains(exitButton)).toBe(false)
  })
})
