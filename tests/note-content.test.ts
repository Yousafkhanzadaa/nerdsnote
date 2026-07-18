import { describe, expect, it } from "vitest"

import {
  normalizeNoteContent,
  notePreviewText,
  plainTextToHtml,
  richTextToPlainText,
} from "@/lib/note-content"

describe("note content utilities", () => {
  it("wraps plain text in paragraphs without collapsing repeated spaces", () => {
    expect(normalizeNoteContent("The cat  The dog")).toBe("<p>The cat  The dog</p>")
  })

  it("preserves blank lines when converting plain text to html", () => {
    expect(plainTextToHtml("Title\n\nBody")).toBe("<p>Title</p><p><br></p><p>Body</p>")
  })

  it("keeps existing rich text html unchanged", () => {
    const content = "<p><strong>Hello</strong> world</p>"
    expect(normalizeNoteContent(content)).toBe(content)
  })

  it("recognizes highlighted text and tables as rich text", () => {
    const highlighted = '<mark data-color="#fef08a">Important</mark>'
    const table = "<table><tbody><tr><td><p>Cell</p></td></tr></tbody></table>"

    expect(normalizeNoteContent(highlighted)).toBe(highlighted)
    expect(normalizeNoteContent(table)).toBe(table)
  })

  it("treats literal angle-bracket text as plain text instead of html", () => {
    expect(normalizeNoteContent("Use <div> tags carefully")).toBe("<p>Use &lt;div&gt; tags carefully</p>")
  })

  it("extracts checklist state and spacing into plain text", () => {
    const content = [
      '<ul data-type="taskList">',
      '<li data-type="taskItem" data-checked="true">',
      '<label><input type="checkbox" checked><span></span></label>',
      '<div><p>The cat  The dog</p></div>',
      "</li>",
      '<li data-type="taskItem" data-checked="false">',
      '<label><input type="checkbox"><span></span></label>',
      '<div><p>Math x Chemistry</p></div>',
      "</li>",
      "</ul>",
    ].join("")

    expect(richTextToPlainText(content)).toBe("[x] The cat  The dog\n[ ] Math x Chemistry")
  })

  it("preserves paragraph indentation in plain-text exports", () => {
    const content = '<p>Summary</p><p data-indent="2">Indented detail</p>'

    expect(richTextToPlainText(content)).toBe("Summary\n\t\tIndented detail")
  })

  it("exports table cells as tab-separated rows", () => {
    const content = [
      "<table><tbody>",
      "<tr><th><p>Name</p></th><th><p>Status</p></th></tr>",
      "<tr><td><p>NerdsNote</p></td><td><p>Ready</p></td></tr>",
      "</tbody></table>",
    ].join("")

    expect(richTextToPlainText(content)).toBe("Name\tStatus\nNerdsNote\tReady")
  })

  it("keeps highlighted words in plain-text exports", () => {
    const content = '<p><mark data-color="#fef08a">Important</mark> text</p>'

    expect(richTextToPlainText(content)).toBe("Important text")
  })

  it("builds compact previews from rich text", () => {
    const content = "<p>Hello</p><p>world</p>"
    expect(notePreviewText(content)).toBe("Hello world")
  })
})
