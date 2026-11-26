import { isSafeNoteImageSrc } from "@/lib/note-images"
import { drawScatterChart } from "@/lib/note-scatter"

export type ChartKind = "bar" | "column" | "line" | "pie" | "donut" | "scatter"
export type ChartDatum = { label: string; value: number; x?: number }
export type ChartAxes = { x?: string; y?: string }

export const MAX_CHART_ROWS = 12
export const MAX_CHART_LABEL_LENGTH = 48
export const MAX_CHART_TITLE_LENGTH = 80
export const MAX_CHART_AXIS_LENGTH = 48

const WIDTH = 540
const PAD = 28
const RIGHT = WIDTH - PAD
const INNER = RIGHT - PAD
const PAPER = "#fcfbf6"
const INK = "#262d2b"
const MUTED = "#52615d"
const GRID = "#dcdfd9"
const ZERO = "#99aba0"
const TEAL = "#286a63"
const RUST = "#9a5746"
const COLORS = [TEAL, "#4b708c", "#a05a48", "#8c732d", "#765d83", "#417b86",
  "#596349", "#a36437", "#665887", "#79624f", "#467960", "#895d70"]
const TITLE = "32px Georgia, serif"
const LABEL = "20px system-ui, sans-serif"
const SMALL = "17px system-ui, sans-serif"
const VALUE = "600 18px system-ui, sans-serif"
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumSignificantDigits: 3 })
type Ctx = CanvasRenderingContext2D
type Figure = { height: number; draw: (top: number) => void }

function clean(text: string) {
  return text.trim().replace(/\s+/g, " ")
}

function axisName(value: string | undefined, fallback: string) {
  if (value === undefined) return fallback
  if (typeof value !== "string" || clean(value).length > MAX_CHART_AXIS_LENGTH) {
    throw new Error(`Use an ${fallback} axis name of ${MAX_CHART_AXIS_LENGTH} characters or fewer.`)
  }
  return clean(value) || fallback
}

function validate(kind: ChartKind, title: string, data: readonly ChartDatum[]) {
  if (!["bar", "column", "line", "pie", "donut", "scatter"].includes(kind)) throw new Error("Choose a supported chart type.")
  if (typeof title !== "string" || clean(title).length > MAX_CHART_TITLE_LENGTH) {
    throw new Error(`Use a chart title of ${MAX_CHART_TITLE_LENGTH} characters or fewer.`)
  }
  if (!Array.isArray(data) || data.length < 2 || data.length > MAX_CHART_ROWS) {
    throw new Error(`Enter between 2 and ${MAX_CHART_ROWS} rows.`)
  }
  const circular = kind === "pie" || kind === "donut"
  const rows = Array.from(data, (row, i) => {
    const label = typeof row?.label === "string" ? clean(row.label) : ""
    if ((!label && kind !== "scatter") || label.length > MAX_CHART_LABEL_LENGTH) {
      throw new Error(`Give row ${i + 1} a label of ${kind === "scatter" ? "0" : "1"} to ${MAX_CHART_LABEL_LENGTH} characters.`)
    }
    if (!Number.isFinite(row?.value) || Math.abs(row.value) > 1e12) {
      throw new Error(`Enter a number between −1 trillion and 1 trillion in row ${i + 1}.`)
    }
    if (kind === "scatter" && (typeof row.x !== "number" || !Number.isFinite(row.x) || Math.abs(row.x) > 1e12)) {
      throw new Error(`Enter an X value between −1 trillion and 1 trillion in row ${i + 1}.`)
    }
    if (circular && row.value < 0) throw new Error("Pie and donut chart values must be zero or greater.")
    return { label, value: row.value, x: row.x }
  })
  if (circular && !rows.some(row => row.value > 0)) throw new Error("Enter at least one positive value.")
  return rows
}

function wrap(ctx: Ctx, text: string, width: number) {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(" ")) {
    const joined = line ? `${line} ${word}` : word
    if (ctx.measureText(joined).width <= width) { line = joined; continue }
    if (line) lines.push(line)
    line = ""
    for (const char of word) {
      if (line && ctx.measureText(line + char).width > width) { lines.push(line); line = "" }
      line += char
    }
  }
  return [...lines, line]
}

function text(ctx: Ctx, str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") {
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.fillText(str, x, y)
}

function rule(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, stroke = GRID) {
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function dot(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function bar(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  if (!w || !h) return
  ctx.fillStyle = color
  if (!ctx.roundRect) { ctx.fillRect(x, y, w, h); return }
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, Math.min(w / 2, h / 2, 3.5))
  ctx.fill()
}

function shortValue(n: number) {
  if (n === 0) return "0"
  if (Math.abs(n) < 0.001) return String(Number(n.toPrecision(3)))
  return compact.format(n)
}

function displayValue(n: number) {
  return String(n).length <= 10 ? String(n) : shortValue(n)
}

function scaleFor(rows: readonly ChartDatum[]) {
  const values = rows.map(row => row.value)
  let min = Math.min(0, ...values)
  let max = Math.max(0, ...values)
  if (min === max) max = 1
  const approx = (max - min) / 4
  const power = 10 ** Math.floor(Math.log10(approx))
  const unit = ([1, 2, 2.5, 5, 10].find(n => n * power >= approx) ?? 10) * power
  let ticks = [min, max]
  if (unit > 0) {
    const first = Math.floor(min / unit)
    const last = Math.ceil(max / unit)
    ticks = Array.from({ length: last - first + 1 }, (_, i) => Number(((first + i) * unit).toPrecision(12)))
    min = ticks[0]
    max = ticks[ticks.length - 1]
  }
  return { ticks: [...new Set(ticks)], position: (v: number) => (v - min) / (max - min) }
}

function horizontalBars(ctx: Ctx, rows: ChartDatum[]): Figure {
  const axis = scaleFor(rows)
  ctx.font = LABEL
  const widest = Math.max(...rows.map(row => ctx.measureText(row.label).width))
  const stacked = widest > 136
  const left = stacked ? PAD : PAD + widest + 18
  ctx.font = VALUE
  const valueWidth = Math.max(...rows.map(row => ctx.measureText(displayValue(row.value)).width))
  const right = stacked ? RIGHT - 9 : RIGHT - valueWidth - 20
  const x = (value: number) => left + axis.position(value) * (right - left)
  ctx.font = LABEL
  const labels = rows.map(row => wrap(ctx, row.label, stacked ? INNER - valueWidth - 16 : widest))
  const heights = labels.map(lines => stacked ? lines.length * 22 + 34 : 47)
  const plotHeight = heights.reduce((a, b) => a + b, 0)
  return { height: plotHeight + 28, draw(top) {
    ctx.font = SMALL
    let previousLabelEnd = -Infinity
    const lastLabel = axis.ticks.at(-1)!
    const lastLabelStart = right - ctx.measureText(shortValue(lastLabel)).width / 2
    for (const tick of axis.ticks) {
      if (!stacked) rule(ctx, x(tick), top + 2, x(tick), top + plotHeight, tick === 0 ? ZERO : GRID)
      const label = shortValue(tick)
      const width = ctx.measureText(label).width
      const first = tick === axis.ticks[0]
      const last = tick === lastLabel
      const labelLeft = Math.max(4, Math.min(WIDTH - 4 - width, x(tick) - width / 2))
      if (first || last || (labelLeft >= previousLabelEnd + 5 && labelLeft + width <= lastLabelStart - 5)) {
        text(ctx, label, labelLeft, top + plotHeight + 21, SMALL, MUTED)
        previousLabelEnd = labelLeft + width
      }
    }
    let y = top
    rows.forEach((row, i) => {
      const barY = stacked ? y + labels[i].length * 22 + 4 : y + 13
      labels[i].forEach((line, j) => text(ctx, line, PAD, stacked ? y + 17 + 22 * j : y + 28, LABEL, INK))
      text(ctx, displayValue(row.value), RIGHT, stacked ? y + 17 : y + 28, VALUE, INK, "right")
      if (stacked) rule(ctx, left, barY + 7, right, barY + 7)
      const zero = x(0)
      const end = x(row.value)
      bar(ctx, Math.min(zero, end), barY, Math.abs(end - zero), stacked ? 13 : 19, row.value < 0 ? RUST : TEAL)
      if (stacked || !row.value) rule(ctx, zero, barY - 2, zero, barY + (stacked ? 15 : 21), ZERO)
      y += heights[i]
    })
  } }
}

// Dense axes use a key only when the full names will not fit in two staggered rows.
function categoricalPlot(ctx: Ctx, kind: "line" | "column", rows: ChartDatum[]): Figure {
  const axis = scaleFor(rows)
  ctx.font = SMALL
  const left = PAD + Math.max(...axis.ticks.map(n => ctx.measureText(shortValue(n)).width)) + 12
  const step = (RIGHT - left) / rows.length
  const x = (i: number) => left + step * (i + 0.5)
  let axisLabels = rows.map(row => wrap(ctx, row.label, step - 5))
  const stagger = axisLabels.some(lines => lines.length > 2)
  if (stagger) axisLabels = rows.map(row => wrap(ctx, row.label, 1.55 * step - 5))
  const needsKey = axisLabels.some(lines => lines.length > 2)
  if (needsKey) axisLabels = rows.map((_, i) => [String(i + 1)])
  const bands = stagger && !needsKey ? 2 : 1
  const bandHeight = Math.max(...axisLabels.map(lines => lines.length)) * 18 + 5
  // Constrain staggered labels at the edges to the actual page bounds.
  const labelX = (i: number, line: string) => {
    ctx.font = SMALL
    const half = ctx.measureText(line).width / 2
    return Math.max(PAD + half, Math.min(RIGHT - half, x(i)))
  }
  ctx.font = LABEL
  const keyRows = needsKey ? rows.map(row => wrap(ctx, row.label, INNER - 42 - 100)) : []
  const plotHeight = 174
  const axisGap = rows.some(row => row.value < 0) ? 43 : 27
  const keyStart = 25 + plotHeight + axisGap + bands * bandHeight + 5
  const height = keyStart + keyRows.reduce((sum, lines) => sum + lines.length * 22 + 10, 0)
  return { height, draw(top) {
    const base = top + 25 + plotHeight
    const y = (value: number) => base - axis.position(value) * plotHeight
    for (const tick of axis.ticks) {
      rule(ctx, left, y(tick), RIGHT, y(tick), tick === 0 ? ZERO : GRID)
      text(ctx, shortValue(tick), left - 10, y(tick) + 5, SMALL, MUTED, "right")
    }
    const zeroY = y(0)
    if (kind === "line") {
      ctx.beginPath()
      rows.forEach((row, i) => { if (i) ctx.lineTo(x(i), y(row.value)); else ctx.moveTo(x(i), y(row.value)) })
      ctx.strokeStyle = TEAL
      ctx.lineWidth = 3.5
      ctx.lineJoin = "round"
      ctx.stroke()
    }
    rows.forEach((row, i) => {
      const mid = x(i)
      const end = y(row.value)
      if (kind === "line") {
        dot(ctx, mid, end, 5, TEAL)
        dot(ctx, mid, end, 2, PAPER)
      } else {
        const width = Math.min(step * 0.56, 52)
        if (row.value === 0) rule(ctx, mid - width / 2, zeroY, mid + width / 2, zeroY, TEAL)
        else bar(ctx, mid - width / 2, Math.min(end, zeroY), width, Math.abs(zeroY - end), row.value < 0 ? RUST : TEAL)
      }
      ctx.font = VALUE
      const value = displayValue(row.value)
      if (ctx.measureText(value).width < step - 6) {
        text(ctx, value, mid, row.value < 0 ? end + 18 : end - 10, VALUE, INK, "center")
      }
      axisLabels[i].forEach((line, j) => {
        text(ctx, line, labelX(i, line), base + axisGap + j * 18 + (i % bands) * bandHeight, SMALL, MUTED, "center")
      })
    })
    if (needsKey) {
      let y = top + keyStart
      rule(ctx, PAD, y - 10, RIGHT, y - 10)
      keyRows.forEach((lines, i) => {
        text(ctx, String(i + 1), PAD, y + 16, SMALL, MUTED)
        lines.forEach((line, j) => text(ctx, line, PAD + 32, y + 16 + j * 22, LABEL, INK))
        text(ctx, displayValue(rows[i].value), RIGHT, y + 16, VALUE, INK, "right")
        y += lines.length * 22 + 10
      })
    }
  } }
}

function percentage(value: number, total: number) {
  const percent = value / total * 100
  if (value > 0 && percent < 0.1) return "<0.1%"
  return `${Math.round(percent * 10) / 10}%`
}

function circularPlot(ctx: Ctx, kind: "pie" | "donut", rows: ChartDatum[]): Figure {
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  ctx.font = LABEL
  const side = rows.length <= 5 && rows.every(row => ctx.measureText(row.label).width <= 156)
  const diameter = side ? 202 : 216
  const radius = diameter / 2
  const legendX = side ? PAD + diameter + 30 : PAD
  const columns = side ? 1 : 2
  const columnWidth = side ? RIGHT - legendX : (INNER - 20) / 2
  const rowsLayout = rows.map(row => wrap(ctx, row.label, columnWidth - 20))
  const bandOffsets: number[] = []
  let legendHeight = 0
  for (let i = 0; i < rows.length; i += columns) {
    bandOffsets.push(legendHeight)
    const lineCount = Math.max(...rowsLayout.slice(i, i + columns).map(lines => lines.length))
    legendHeight += lineCount * 21 + 29
  }
  const height = side ? Math.max(diameter + 12, legendHeight) : diameter + 25 + legendHeight
  return { height, draw(top) {
    const cx = side ? PAD + radius : WIDTH / 2
    const cy = side ? top + height / 2 : top + radius
    let angle = -Math.PI / 2
    rows.forEach((row, i) => {
      if (row.value === 0) return
      const sweep = row.value / total * Math.PI * 2
      ctx.fillStyle = COLORS[i]
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, angle, angle + sweep)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = PAPER
      ctx.lineWidth = 1.8
      ctx.stroke()
      if (kind === "pie" && sweep > 0.66) {
        const mid = angle + sweep / 2
        const distance = sweep > Math.PI * 1.98 ? 0 : radius * 0.62
        text(ctx, percentage(row.value, total), cx + Math.cos(mid) * distance, cy + Math.sin(mid) * distance + 5, VALUE, "#ffffff", "center")
      }
      angle += sweep
    })
    if (kind === "donut") {
      dot(ctx, cx, cy, radius * 0.65, PAPER)
      const value = displayValue(Number(total.toPrecision(15)))
      let size = 30
      ctx.font = `${size}px Georgia, serif`
      while (size > 16 && ctx.measureText(value).width > radius * 1.15) ctx.font = `${--size}px Georgia, serif`
      text(ctx, value, cx, cy + 1, ctx.font, INK, "center")
      text(ctx, "Total", cx, cy + 23, SMALL, MUTED, "center")
    }
    const legendTop = side ? top + (height - legendHeight) / 2 : top + diameter + 25
    rows.forEach((row, i) => {
      const lines = rowsLayout[i]
      const x = legendX + (i % columns) * (columnWidth + 20)
      const y = legendTop + bandOffsets[Math.floor(i / columns)]
      dot(ctx, x + 5, y + 9, 5, COLORS[i])
      lines.forEach((line, j) => text(ctx, line, x + 20, y + 15 + j * 21, LABEL, INK))
      text(ctx, `${displayValue(row.value)}   ·   ${percentage(row.value, total)}`, x + 20, y + lines.length * 21 + 13, SMALL, MUTED)
    })
  } }
}

export async function renderNoteChart(kind: ChartKind, title: string, data: readonly ChartDatum[], axes?: ChartAxes): Promise<{ src: string; alt: string }> {
  const rows = validate(kind, title, data)
  const xName = kind === "scatter" ? axisName(axes?.x, "X") : "X"
  const yName = kind === "scatter" ? axisName(axes?.y, "Y") : "Y"
  const chartName = `${kind[0].toUpperCase()}${kind.slice(1)} chart`
  const heading = clean(title)
  const alt = [heading ? `${chartName}. ${heading}` : chartName, ...rows.map(row => kind === "scatter"
    ? `${row.label ? row.label + ": " : ""}${xName} ${row.x}, ${yName} ${row.value}`
    : `${row.label}: ${row.value}`)].join(". ")
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("This browser could not draw the chart. Try another browser.")

  ctx.font = TITLE
  const titleLines = wrap(ctx, heading || chartName, INNER)
  const top = PAD + titleLines.length * 37 + 27
  let figure: Figure
  if (kind === "bar") figure = horizontalBars(ctx, rows)
  else if (kind === "column" || kind === "line") figure = categoricalPlot(ctx, kind, rows)
  else if (kind === "pie" || kind === "donut") figure = circularPlot(ctx, kind, rows)
  else {
    const points = rows.map(row => ({ label: row.label, x: row.x!, value: row.value }))
    figure = { height: 244, draw: y => drawScatterChart(ctx, points, { x: PAD, y, width: INNER, height: 244 }, { x: xName, y: yName }) }
  }
  const height = Math.ceil(top + figure.height + PAD)
  canvas.width = WIDTH * 2
  canvas.height = height * 2
  ctx.scale(2, 2)
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, WIDTH, height)
  titleLines.forEach((line, i) => text(ctx, line, PAD, PAD + 29 + i * 37, TITLE, INK))
  rule(ctx, PAD, top - 13, RIGHT, top - 13)
  rule(ctx, PAD, top - 13, PAD + 35, top - 13, TEAL)
  figure.draw(top)

  let src = canvas.toDataURL("image/png")
  if (!isSafeNoteImageSrc(src)) {
    const smaller = document.createElement("canvas")
    smaller.width = WIDTH
    smaller.height = height
    const smallContext = smaller.getContext("2d")
    if (!smallContext) throw new Error("This browser could not draw the chart. Try another browser.")
    smallContext.drawImage(canvas, 0, 0, WIDTH, height)
    src = smaller.toDataURL("image/png")
    if (!isSafeNoteImageSrc(src)) throw new Error("The chart is too large to insert. Try fewer or shorter labels.")
  }
  return { src, alt }
}
