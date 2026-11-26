import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
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

describe("editor toolbar", () => {
  it("indents the current paragraph when the toolbar button is clicked", () => {
    const editor = new Editor({
      content: "<p>Paragraph</p>",
      extensions: [StarterKit, ParagraphIndent],
    })
    editors.push(editor)
    editor.commands.setTextSelection(2)
    render(<EditorToolbar editor={editor} />)

    fireEvent.click(screen.getByRole("button", { name: "More formatting" }))
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

    fireEvent.click(screen.getByRole("button", { name: "More formatting" }))
    fireEvent.click(screen.getByRole("button", { name: "Insert table" }))
    const dialog = within(screen.getByRole("dialog", { name: "Insert table" }))
    fireEvent.change(dialog.getByRole("spinbutton", { name: "Rows" }), { target: { value: "5" } })
    fireEvent.change(dialog.getByRole("spinbutton", { name: "Columns" }), { target: { value: "7" } })
    fireEvent.click(dialog.getByRole("button", { name: "Insert table" }))

    expect(countNodes(editor, "table")).toBe(1)
    expect(countNodes(editor, "tableRow")).toBe(5)
    expect(countNodes(editor, "tableHeader")).toBe(7)
    expect(countNodes(editor, "tableCell")).toBe(28)
  })

  it("toggles additional tools while keeping primary actions and end content accessible", () => {
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
    const toggle = screen.getByRole("button", { name: "More formatting" })
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!)!

    expect(panel.hidden).toBe(true)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByRole("button", { name: "Indent paragraph" })).toBeNull()
    expect(screen.getByRole("button", { name: /^Bold/ })).toBeTruthy()
    expect(panel.contains(exitButton)).toBe(false)

    fireEvent.click(toggle)
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(panel.contains(screen.getByRole("button", { name: "Indent paragraph" }))).toBe(true)

    fireEvent.click(toggle)
    expect(panel.hidden).toBe(true)
    expect(screen.getByRole("button", { name: "Exit Focus Mode" })).toBe(exitButton)
  })
})
