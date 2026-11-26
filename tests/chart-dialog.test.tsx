import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

import { ChartDialog } from "@/components/chart-dialog"
import NotepadClient from "@/components/notepad-client"
import { renderNoteChart } from "@/lib/note-charts"
import { NoteImage } from "@/lib/tiptap/note-image"

vi.mock("@/lib/firebase", () => ({ db: {} }))
vi.mock("@/lib/note-charts", async (load) => ({
  ...await load<typeof import("@/lib/note-charts")>(), renderNoteChart: vi.fn(),
}))

const src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mOwjdEBAAGfAMbFnGqmAAAAAElFTkSuQmCC"
const editors: Editor[] = []

function makeEditor() {
  const editor = new Editor({ content: "<p>Before after</p>", extensions: [StarterKit, NoteImage] })
  editors.push(editor)
  editor.commands.setTextSelection(7)
  return editor
}

function change(name: string, value: string) {
  fireEvent.change(screen.getByLabelText(name), { target: { value } })
}

function fillChart() {
  change("Label 1", "Spring")
  change("Value 1", "0")
  change("Label 2", "Summer")
  change("Value 2", "15")
}

function insertButton() {
  return within(screen.getByRole("dialog")).getByRole("button", { name: "Insert chart" }) as HTMLButtonElement
}

async function readyToInsert() {
  await waitFor(() => expect(insertButton().disabled).toBe(false))
}

beforeEach(() => {
  vi.mocked(renderNoteChart).mockImplementation(async (kind, title, data) => ({
    src, alt: `${kind} ${title}: ${data.map((row) => `${row.label} ${row.value}`).join(", ")}`,
  }))
})

afterEach(() => {
  cleanup()
  editors.splice(0).forEach((editor) => editor.destroy())
  vi.mocked(renderNoteChart).mockReset()
  localStorage.clear()
})

it("labels example data and inserts only the exact real preview at the original caret", async () => {
  const editor = makeEditor()
  const onClose = vi.fn()
  render(<ChartDialog editor={editor} onClose={onClose} />)
  expect(await screen.findByRole("img", { name: /Monday/ })).toBeTruthy()
  expect(screen.getByText("Example data")).toBeTruthy()
  expect(insertButton().disabled).toBe(true)
  fireEvent.submit(insertButton().closest("form")!)
  expect(editor.getHTML()).toBe("<p>Before after</p>")
  change("Chart title (optional)", "Sales")
  fillChart()
  fireEvent.click(screen.getByRole("button", { name: "Add row" }))
  fireEvent.click(screen.getByRole("button", { name: "Remove row 3" }))
  await readyToInsert()
  const plot = screen.getByRole("img") as HTMLImageElement
  expect(plot.alt).toBe("bar Sales: Spring 0, Summer 15")
  const draws = vi.mocked(renderNoteChart).mock.calls.length
  fireEvent.click(insertButton())
  expect(renderNoteChart).toHaveBeenCalledTimes(draws)
  expect(editor.getJSON().content).toMatchObject([
    { type: "paragraph", content: [{ text: "Before" }] },
    { type: "noteImage", attrs: { src: plot.src, alt: plot.alt, title: "Bar chart" } },
    { type: "paragraph", content: [{ text: " after" }] },
  ])
  expect(onClose).toHaveBeenCalledOnce()
})

it("preserves category values, scatter coordinates, optional point labels, and axis names across type changes", async () => {
  const editor = makeEditor()
  render(<ChartDialog editor={editor} onClose={() => {}} />)
  fillChart()
  for (const label of ["Column", "Line", "Pie", "Donut", "Scatter"]) {
    fireEvent.click(screen.getByRole("radio", { name: label }))
  }
  expect(screen.getByDisplayValue("Spring")).toBe(screen.getByLabelText("Label 1 (optional)"))
  expect(screen.getByDisplayValue("15")).toBe(screen.getByLabelText("Y 2"))
  change("Label 1 (optional)", "")
  change("X 1", "-2")
  change("X 2", "0")
  change("X-axis name (optional)", "Minutes")
  change("Y-axis name (optional)", "Pages")
  await readyToInsert()
  expect(renderNoteChart).toHaveBeenLastCalledWith("scatter", "", [
    { label: "", x: -2, value: 0 }, { label: "Summer", x: 0, value: 15 },
  ], { x: "Minutes", y: "Pages" })
  fireEvent.click(screen.getByRole("radio", { name: "Bar" }))
  expect(screen.getByDisplayValue("Summer")).toBe(screen.getByLabelText("Label 2"))
  expect(insertButton().disabled).toBe(true)
  fireEvent.click(screen.getByRole("radio", { name: "Scatter" }))
  expect(screen.getByLabelText("X 1")).toHaveProperty("value", "-2")
  expect(screen.getByLabelText("Y-axis name (optional)")).toHaveProperty("value", "Pages")
  await readyToInsert()
  fireEvent.click(insertButton())
  expect(editor.getHTML()).toContain('title="Scatter chart"')
})

it("keeps the previous same-type plot during edits but never enables stale or out-of-order results", async () => {
  const editor = makeEditor()
  const view = render(<ChartDialog editor={editor} onClose={() => {}} />)
  fillChart()
  await readyToInsert()
  const previousAlt = screen.getByRole("img").getAttribute("alt")
  let finish!: (output: { src: string; alt: string }) => void
  vi.mocked(renderNoteChart).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve }))
  change("Chart title (optional)", "Late")
  expect(screen.getByRole("img").getAttribute("alt")).toBe(previousAlt)
  expect(screen.getByRole("region", { name: "Chart preview" }).getAttribute("aria-busy")).toBe("true")
  expect(insertButton().disabled).toBe(true)
  await waitFor(() => expect(finish).toBeTypeOf("function"))
  fireEvent.click(screen.getByRole("radio", { name: "Column" }))
  expect(screen.queryByRole("img")).toBeNull()
  await readyToInsert()
  await act(async () => finish({ src, alt: "Obsolete preview" }))
  expect(screen.getByRole("img").getAttribute("alt")).toMatch(/^column Late/)
  view.unmount()
  editor.commands.setContent("<p>Another note</p>")
  expect(editor.getHTML()).toBe("<p>Another note</p>")
})

it("shows invalid data in the composer, allows correction, and cancels without writing the notebook", async () => {
  const before = JSON.stringify([{ id: "note", title: "Notes", content: "Initial text", lastModified: "2026-01-01" }])
  localStorage.setItem("nerds-note-data", before)
  render(<NotepadClient />)
  await screen.findByRole("textbox", { name: "Note title" })
  fireEvent.click(screen.getByRole("button", { name: "Format" }))
  fireEvent.click(screen.getByRole("button", { name: "Insert chart" }))
  const dialog = within(screen.getByRole("dialog"))
  fireEvent.click(dialog.getByRole("radio", { name: "Pie" }))
  fillChart()
  vi.mocked(renderNoteChart).mockRejectedValueOnce(new Error("Pie chart values must be zero or greater."))
  change("Value 1", "-1")
  expect((await dialog.findByRole("alert")).textContent).toMatch(/zero or greater/)
  expect(insertButton().disabled).toBe(true)
  change("Value 1", "8")
  await readyToInsert()
  expect(dialog.queryByRole("alert")).toBeNull()
  fireEvent.click(dialog.getByRole("button", { name: "Cancel" }))
  expect(screen.queryByRole("dialog")).toBeNull()
  expect(localStorage.getItem("nerds-note-data")).toBe(before)
})
