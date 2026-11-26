type Point = { label: string; x: number; value: number }
type Bounds = { x: number; y: number; width: number; height: number }
type Dot = { x: number; y: number; count: number; labels: string[] }

const INK = "#262d2b"
const MUTED = "#52615d"
const GRID = "#dcdfd9"
const AXIS = "#94a5a2"
const TEAL = "#286a63"
const PAPER = "#fcfbf6"
const CAPTION_FONT = "600 17px system-ui, sans-serif"
const TICK_FONT = "16px system-ui, sans-serif"

function axis(values: readonly number[]) {
  let low = Math.min(...values)
  let high = Math.max(...values)
  if (low === high) return { ticks: [low], fraction: () => 0.5 }

  // Halving first keeps opposite-sign extremes finite when their difference overflows.
  const divisor = Number.isFinite(high - low) ? 1 : 2
  low /= divisor
  high /= divisor
  const ideal = (high - low) / 5
  const unit = 10 ** Math.floor(Math.log10(ideal))
  const step = unit * ([1, 2, 2.5, 5, 10].find(n => n * unit >= ideal) ?? 10)
  const first = Math.floor(low / step)
  const last = Math.ceil(high / step)
  let ticks = [low, high]
  if (Number.isSafeInteger(first) && Number.isSafeInteger(last) && last > first && last - first <= 8
      && Number.isFinite(first * step * divisor) && Number.isFinite(last * step * divisor)) {
    const rounded = Array.from({ length: last - first + 1 }, (_, i) => (first + i) * step)
    // At the limits of floating-point precision, keep the distinct original endpoints.
    if (rounded[0] <= low && rounded[rounded.length - 1] >= high && new Set(rounded).size === rounded.length) {
      ticks = rounded
      low = rounded[0]
      high = rounded[rounded.length - 1]
    }
  } else if (low < 0 && high > 0) {
    ticks.splice(1, 0, 0)
  }
  return { ticks: ticks.map(t => t * divisor), fraction: (v: number) => (v / divisor - low) / (high - low) }
}

function tickLabels(ticks: readonly number[]) {
  // Increase precision only when rounding would give different positions the same label.
  for (let digits = 5; digits <= 17; digits++) {
    const labels = ticks.map(t => {
      const value = Number(t.toPrecision(digits))
      if (!Number.isFinite(value)) return String(t)
      if (value && (Math.abs(value) < 0.001 || Math.abs(value) >= 1e7)) return value.toExponential().replace("e+", "e")
      return String(value)
    })
    if (new Set(labels).size === labels.length) return labels
  }
  return ticks.map(String)
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function intersects(a: Bounds, b: Bounds) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function captionLines(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines = []
  let remaining = text
  while (remaining && ctx.measureText(remaining).width > width) {
    let prefix = ""
    for (const character of remaining) {
      if (ctx.measureText(prefix + character).width > width) break
      prefix += character
    }
    if (!prefix) break
    const space = prefix.lastIndexOf(" ")
    const end = space > 0 ? space : prefix.length
    lines.push(remaining.slice(0, end))
    remaining = remaining.slice(end).trimStart()
  }
  if (remaining) lines.push(remaining)
  return lines
}

function drawPoints(ctx: CanvasRenderingContext2D, dots: Dot[], plot: Bounds) {
  const occupied = dots.map(dot => ({ x: dot.x - 7, y: dot.y - 7, width: 14, height: 14 }))
  ctx.font = "17px system-ui, sans-serif"
  ctx.textAlign = "left"
  for (const dot of dots) {
    ctx.beginPath()
    ctx.arc(dot.x, dot.y, 4.5, 0, Math.PI * 2)
    ctx.fillStyle = TEAL
    ctx.fill()
    if (dot.count > 1) {
      ctx.strokeStyle = TEAL
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, 7, 0, Math.PI * 2)
      ctx.stroke()
    }
    const label = dot.labels.join(", ")
    const count = `×${dot.count}`
    const options = dot.count > 1 ? [label ? `${label} (${count})` : count, count] : [label]
    for (const text of options) {
      if (!text) continue
      const width = ctx.measureText(text).width
      const aboveOrBelowX = Math.max(plot.x, Math.min(dot.x - width / 2, plot.x + plot.width - width))
      const positions = [
        { x: dot.x + 10, y: dot.y - 10 }, { x: dot.x - width - 10, y: dot.y - 10 },
        { x: aboveOrBelowX, y: dot.y - 32 }, { x: aboveOrBelowX, y: dot.y + 10 },
      ]
      const box = positions.map(p => ({ ...p, width, height: 21 })).find(p =>
        p.x >= plot.x && p.y >= plot.y && p.x + width <= plot.x + plot.width
        && p.y + p.height <= plot.y + plot.height && !occupied.some(other => intersects(p, other)))
      if (box) {
        ctx.fillStyle = PAPER
        ctx.fillRect(box.x - 1, box.y, width + 2, box.height)
        ctx.fillStyle = INK
        ctx.fillText(text, box.x, box.y + 16)
        occupied.push({ x: box.x - 3, y: box.y - 2, width: width + 6, height: box.height + 4 })
        break
      }
    }
  }
}

export function drawScatterChart(ctx: CanvasRenderingContext2D, rows: readonly Point[], bounds: Bounds, axes?: { x?: string; y?: string }): void {
  if (!rows.length) return
  const xAxis = axis(rows.map(row => row.x))
  const yAxis = axis(rows.map(row => row.value))
  const xLabels = tickLabels(xAxis.ticks)
  const yLabels = tickLabels(yAxis.ticks)
  ctx.font = TICK_FONT
  const yLabelWidth = Math.max(...yLabels.map(label => ctx.measureText(label).width))
  const left = bounds.x + Math.max(yLabelWidth + 10, ctx.measureText(xLabels[0]).width / 2) + 2
  const right = bounds.x + bounds.width - Math.max(8, ctx.measureText(xLabels[xLabels.length - 1]).width / 2)
  if (right - left < 20) return
  ctx.font = CAPTION_FONT
  const yCaption = captionLines(ctx, axes?.y?.trim() || "Y", right - left)
  const xCaption = captionLines(ctx, axes?.x?.trim() || "X", right - left)
  const top = bounds.y + 26 + (yCaption.length - 1) * 20
  const bottom = bounds.y + bounds.height - 48 - (xCaption.length - 1) * 20
  if (bottom - top < 20) return
  // Give boundary points room for their mark and direct label inside the axes.
  const x = (value: number) => left + 10 + xAxis.fraction(value) * (right - left - 20)
  const y = (value: number) => bottom - 10 - yAxis.fraction(value) * (bottom - top - 20)

  ctx.font = TICK_FONT
  ctx.textAlign = "right"
  yAxis.ticks.forEach((value, i) => {
    line(ctx, left, y(value), right, y(value), value === 0 ? AXIS : GRID)
    ctx.fillStyle = MUTED
    ctx.fillText(yLabels[i], left - 8, y(value) + 5)
  })
  ctx.textAlign = "center"
  let previousRight = -Infinity
  xAxis.ticks.forEach((value, i) => {
    const position = x(value)
    line(ctx, position, top, position, bottom, value === 0 ? AXIS : GRID)
    const width = ctx.measureText(xLabels[i]).width
    if (position - width / 2 >= previousRight + 7) {
      ctx.fillStyle = MUTED
      ctx.fillText(xLabels[i], position, bottom + 20)
      previousRight = position + width / 2
    }
  })
  ctx.fillStyle = MUTED
  ctx.font = CAPTION_FONT
  xCaption.forEach((text, i) => ctx.fillText(text, (left + right) / 2, bottom + 43 + i * 20))
  ctx.textAlign = "left"
  yCaption.forEach((text, i) => ctx.fillText(text, left, bounds.y + 16 + i * 20))

  const groups = new Map<string, Dot>()
  for (const row of rows) {
    const key = `${row.x},${row.value}`
    const dot = groups.get(key) ?? { x: x(row.x), y: y(row.value), count: 0, labels: [] }
    dot.count++
    if (row.label && !dot.labels.includes(row.label)) dot.labels.push(row.label)
    groups.set(key, dot)
  }
  drawPoints(ctx, [...groups.values()], { x: left, y: top, width: right - left, height: bottom - top })
}
