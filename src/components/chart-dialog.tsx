"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react"
import type { Editor } from "@tiptap/core"
import type { Transaction } from "@tiptap/pm/state"
import { ChartBar, ChartColumn, ChartLine, ChartPie, ChartScatter, Eye, Plus, Table2, X } from "lucide-react"
import { Dialog } from "radix-ui"

import { Button } from "@/components/ui/button"
import {
  MAX_CHART_AXIS_LENGTH, MAX_CHART_LABEL_LENGTH, MAX_CHART_ROWS, MAX_CHART_TITLE_LENGTH,
  renderNoteChart, type ChartDatum, type ChartKind,
} from "@/lib/note-charts"
import { cn } from "@/lib/utils"

function SegmentedRing({ className }: { className?: string }) {
  return <span aria-hidden="true" className={className} style={{
    background: "conic-gradient(currentColor 0 38%, transparent 38% 42%, currentColor 42% 70%, transparent 70% 74%, currentColor 74% 96%, transparent 96% 100%)",
    maskImage: "radial-gradient(circle, transparent 35%, black 38% 66%, transparent 69%)",
  }} />
}

const chartTypes = [
  { kind: "bar", label: "Bar", Icon: ChartBar, hint: "Compare categories with horizontal bars." },
  { kind: "column", label: "Column", Icon: ChartColumn, hint: "Compare categories with vertical columns." },
  { kind: "line", label: "Line", Icon: ChartLine, hint: "Show how values change in the order you enter them." },
  { kind: "pie", label: "Pie", Icon: ChartPie, hint: "Show each category’s share of a whole." },
  { kind: "donut", label: "Donut", Icon: SegmentedRing, hint: "Show each category’s share around a ring." },
  { kind: "scatter", label: "Scatter", Icon: ChartScatter, hint: "Explore the relationship between two numbers." },
] as const

const example = [
  { label: "Monday", value: 25, x: 1 },
  { label: "Tuesday", value: 40, x: 2 },
  { label: "Wednesday", value: 30, x: 3 },
  { label: "Thursday", value: 55, x: 4 },
]

type Row = { id: number; label: string; value: string; x: string }
type ChartInput = { data: ChartDatum[]; example: boolean; hint?: string }
type ChartSpec = { kind: ChartKind; title: string; input: ChartInput; axes?: { x: string; y: string } }
type Preview = { spec: ChartSpec; src: string; alt: string } | { spec: ChartSpec; error: string }

function emptyRow(id: number): Row {
  return { id, label: "", value: "", x: "" }
}

function chartInput(kind: ChartKind, rows: Row[]): ChartInput {
  const scatter = kind === "scatter"
  const filled = rows.filter((row) => row.label.trim() || row.value.trim() || (scatter && row.x.trim()))
  if (!filled.length) return { data: example, example: true }
  if (filled.some((row) => !row.value.trim() || !(scatter ? row.x.trim() : row.label.trim()))) {
    return { data: [], example: false, hint: scatter ? "Enter X and Y for each point." : "Enter a label and a value for each row." }
  }
  if (filled.length < 2) {
    return { data: [], example: false, hint: scatter ? "Add a second point to draw the chart." : "Add a second row to draw the chart." }
  }
  return {
    example: false,
    data: filled.map((row) => ({
      label: row.label.trim(),
      value: Number(row.value),
      ...(scatter ? { x: Number(row.x) } : {}),
    })),
  }
}

const cellClass = "h-11 min-w-0 w-full rounded-none border-0 bg-transparent px-2.5 text-base text-foreground tabular-nums outline-none placeholder:text-muted-foreground/65 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"

export function ChartDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const position = useRef(editor.state.selection.to)
  const nextRow = useRef(3)
  const [kind, setKind] = useState<ChartKind>("bar")
  const [title, setTitle] = useState("")
  const [axes, setAxes] = useState({ x: "", y: "" })
  const [rows, setRows] = useState<Row[]>([emptyRow(1), emptyRow(2)])
  const [view, setView] = useState<"data" | "preview">("data")
  const [preview, setPreview] = useState<Preview | null>(null)
  const [insertError, setInsertError] = useState("")
  const rowToFocus = useRef<number | null>(null)
  const closed = useRef(false)
  const scatter = kind === "scatter"
  const choice = chartTypes.find((type) => type.kind === kind)!
  const spec = useMemo<ChartSpec>(() => ({
    kind, title: title.trim(), input: chartInput(kind, rows),
    axes: kind === "scatter" ? { x: axes.x.trim(), y: axes.y.trim() } : undefined,
  }), [kind, title, rows, axes])
  const result = preview?.spec === spec ? preview : null
  const rendered = result && "src" in result ? result : null
  const renderError = result && "error" in result ? result.error : null
  const isUpdating = !result && !spec.input.hint
  // Retain the last matching plot while new values are rendered, but insert
  // only an image generated from the currently displayed inputs.
  const visiblePlot = rendered ?? (isUpdating && preview && "src" in preview &&
    preview.spec.kind === spec.kind && preview.spec.input.example === spec.input.example ? preview : null)
  const canInsert = !!rendered && !spec.input.example
  const columns = scatter
    ? "grid-cols-[minmax(4rem,1.35fr)_minmax(3.7rem,1fr)_minmax(3.7rem,1fr)_2rem]"
    : "grid-cols-[minmax(0,1.6fr)_minmax(5rem,1fr)_2rem]"

  useLayoutEffect(() => {
    closed.current = false
    const mapPosition = ({ transaction }: { transaction: Transaction }) => {
      position.current = transaction.mapping.map(position.current)
    }
    editor.on("transaction", mapPosition)
    return () => {
      closed.current = true
      editor.off("transaction", mapPosition)
    }
  }, [editor])

  useEffect(() => {
    if (spec.input.hint) return
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const output = spec.axes
          ? await renderNoteChart(spec.kind, spec.title, spec.input.data, spec.axes)
          : await renderNoteChart(spec.kind, spec.title, spec.input.data)
        if (!cancelled && !closed.current) setPreview({ spec, ...output })
      } catch (cause) {
        if (!cancelled && !closed.current) setPreview({
          spec, error: cause instanceof Error ? cause.message : "Could not draw the chart.",
        })
      }
    }, spec.input.example ? 0 : 150)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [spec])

  function updateRow(id: number, field: "label" | "value" | "x", value: string) {
    setRows((previous) => previous.map((row) => row.id === id ? { ...row, [field]: value } : row))
  }

  function dismiss() {
    closed.current = true
    onClose()
  }

  function insert(event: FormEvent) {
    event.preventDefault()
    if (!canInsert || !rendered || closed.current) return
    const attrs = { src: rendered.src, alt: rendered.alt, title: `${choice.label} chart` }
    if (editor.isDestroyed || !editor.isEditable || !editor.commands.insertContentAt(position.current, { type: "noteImage", attrs })) {
      setInsertError("Choose a place in the note and insert the chart again.")
      return
    }
    dismiss()
  }

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) dismiss() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content
          onCloseAutoFocus={(event) => { event.preventDefault(); if (!editor.isDestroyed) editor.commands.focus() }}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[94dvh] w-[min(63rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl sm:max-h-[90dvh] sm:w-[min(63rem,calc(100vw-3rem))]"
        >
          <header className="flex shrink-0 items-start justify-between gap-4 px-4 pt-4 pb-3 sm:px-7 sm:pt-6 sm:pb-5">
            <div>
              <Dialog.Title className="font-serif text-[1.8rem] leading-tight tracking-tight sm:text-[2rem]">Insert chart</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">Add a chart to your note as an image.</Dialog.Description>
            </div>
            <Button size="icon" variant="ghost" aria-label="Close chart dialog" onClick={dismiss} className="text-muted-foreground"><X /></Button>
          </header>
          <form onSubmit={insert} className="flex min-h-0 flex-1 flex-col">
            <div className="scrollbar-theme min-h-0 overflow-y-auto">
              <fieldset className="px-4 pb-3 sm:px-7 sm:pb-4" aria-describedby="chart-type-hint">
                <legend className="mb-2 text-sm font-medium">Chart type</legend>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
                  {chartTypes.map(({ kind: value, label, Icon }) => (
                    <label key={value} className="relative">
                      <input className="peer sr-only" type="radio" name="chart-type" value={value}
                        checked={kind === value} onChange={() => setKind(value)} />
                      <span className="flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border bg-background px-1 text-sm text-muted-foreground transition-colors hover:bg-accent/50 peer-checked:border-primary peer-checked:bg-accent peer-checked:font-medium peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-ring sm:min-h-12 sm:gap-2">
                        <Icon className="size-[1.05rem] shrink-0" aria-hidden="true" strokeWidth={1.7} />{label}
                      </span>
                    </label>
                  ))}
                </div>
                <p id="chart-type-hint" className="mt-2 min-h-5 text-xs leading-5 text-muted-foreground">{choice.hint}</p>
              </fieldset>

              <div role="group" aria-label="Chart composer view" className="flex gap-1 border-y border-border bg-muted/25 px-4 py-1.5 md:hidden">
                <Button type="button" variant="ghost" size="sm" aria-pressed={view === "data"}
                  onClick={() => setView("data")} className={cn(view === "data" && "bg-accent text-primary")}><Table2 /> Data</Button>
                <Button type="button" variant="ghost" size="sm" aria-pressed={view === "preview"}
                  onClick={() => setView("preview")} className={cn(view === "preview" && "bg-accent text-primary")}><Eye /> Preview</Button>
              </div>
              <div className="md:grid md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] md:border-t md:border-border">
                <section aria-label="Chart data" className={cn("px-4 py-4 sm:px-7 sm:py-5 md:block", view !== "data" && "hidden")}>
                  <label className="block text-sm font-medium">
                    Chart title (optional)
                    <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={MAX_CHART_TITLE_LENGTH}
                      className="mt-2 block h-10 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:outline-ring" />
                  </label>
                  {scatter && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(["x", "y"] as const).map((axis) => (
                        <label key={axis} className="text-xs font-medium text-muted-foreground">
                          {axis.toUpperCase()}-axis name (optional)
                          <input value={axes[axis]} maxLength={MAX_CHART_AXIS_LENGTH} placeholder={axis === "x" ? "e.g. Minutes" : "e.g. Pages"}
                            onChange={(event) => setAxes({ ...axes, [axis]: event.target.value })}
                            className="mt-1.5 block h-10 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-base text-foreground focus-visible:outline-ring" />
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 overflow-hidden rounded-md border border-border bg-background">
                    <div aria-hidden="true" className={cn("grid bg-muted/50 text-xs font-medium text-muted-foreground", columns)}>
                      <span className="px-2.5 py-2">{scatter ? "Label (optional)" : "Label"}</span>
                      {scatter && <span className="truncate px-2.5 py-2">{axes.x.trim() || "X"}</span>}
                      <span className="truncate px-2.5 py-2">{scatter ? axes.y.trim() || "Y" : "Value"}</span>
                    </div>
                    {rows.map((row, index) => (
                      <div key={row.id} className={cn("grid items-center divide-x divide-border/60 border-t border-border", columns)}>
                        <input className={cellClass} value={row.label}
                          ref={(node) => { if (node && rowToFocus.current === row.id) { rowToFocus.current = null; node.focus() } }} aria-label={`Label ${index + 1}${scatter ? " (optional)" : ""}`}
                          maxLength={MAX_CHART_LABEL_LENGTH} onChange={(event) => updateRow(row.id, "label", event.target.value)} />
                        {scatter && <input className={cellClass} type="number" step="any" aria-label={`X ${index + 1}`}
                          value={row.x} onChange={(event) => updateRow(row.id, "x", event.target.value)} />}
                        <input className={cellClass} type="number" step="any" aria-label={`${scatter ? "Y" : "Value"} ${index + 1}`}
                          value={row.value} onChange={(event) => updateRow(row.id, "value", event.target.value)} />
                        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-none text-muted-foreground" disabled={rows.length <= 2}
                          aria-label={`Remove row ${index + 1}`} onClick={() => setRows(rows.filter((item) => item.id !== row.id))}><X /></Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="mt-2 text-primary" disabled={rows.length >= MAX_CHART_ROWS}
                    onClick={() => { const row = emptyRow(nextRow.current++); rowToFocus.current = row.id; setRows([...rows, row]) }}>
                    <Plus /> Add row
                  </Button>
                </section>
                <section aria-label="Chart preview" aria-busy={isUpdating} className={cn("bg-muted/30 px-4 py-4 sm:px-6 sm:py-5 md:block md:border-l md:border-border", view !== "preview" && "hidden")}>
                  <div className={cn("mb-2.5 min-h-5 items-baseline justify-end gap-3 md:flex md:justify-between",
                    spec.input.example || (isUpdating && visiblePlot) ? "flex" : "hidden")}>
                    <h3 className="hidden text-sm font-medium md:block">Preview</h3>
                    {spec.input.example
                      ? <span className="text-xs italic text-muted-foreground">Example data</span>
                      : isUpdating && visiblePlot && <span className="text-xs text-muted-foreground">Updating…</span>}
                  </div>
                  <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-md border border-border bg-background sm:min-h-56 sm:p-2">
                    {visiblePlot ? (
                      <img src={visiblePlot.src} alt={visiblePlot.alt} className="block h-auto max-h-[52dvh] w-full object-contain" />
                    ) : (
                      <p className="max-w-64 px-4 py-8 text-center text-sm leading-relaxed text-muted-foreground">
                        {spec.input.hint ?? (renderError ? "Preview unavailable" : "Drawing chart…")}
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 sm:px-7 sm:py-4">
              <div className="min-w-0 flex-1 basis-40 text-xs leading-relaxed text-muted-foreground">
                {renderError || insertError ? (
                  <div role="alert" className="text-destructive">{renderError || insertError}</div>
                ) : spec.input.example ? "Enter your own data to insert the chart." : spec.input.hint ?? null}
              </div>
              <div className="ml-auto flex gap-2">
                <Button type="button" variant="ghost" onClick={dismiss}>Cancel</Button>
                <Button type="submit" disabled={!canInsert}>Insert chart</Button>
              </div>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
