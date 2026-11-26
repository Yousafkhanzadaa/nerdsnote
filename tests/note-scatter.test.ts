import { describe, expect, it, vi } from "vitest"
import { drawScatterChart } from "@/lib/note-scatter"

const bounds = { x: 28, y: 30, width: 484, height: 244 }

function render(rows: { x: number; value: number; label: string }[], axes?: { x?: string; y?: string }, width = bounds.width) {
  const labels: { value: string; x: number; y: number; width: number }[] = []
  const measure = (value: string) => value.length * 7
  const ctx = {
    textAlign: "left",
    measureText: (value: string) => ({ width: measure(value) }),
    fillText(value: string, x: number, y: number) {
      const width = measure(value)
      const offset = this.textAlign === "right" ? width : this.textAlign === "center" ? width / 2 : 0
      labels.push({ value, x: x - offset, y, width })
    },
    arc: vi.fn<(x: number, y: number, radius: number, start: number, end: number) => void>(),
    moveTo: vi.fn<(x: number, y: number) => void>(), lineTo: vi.fn<(x: number, y: number) => void>(),
    beginPath: vi.fn(), fill: vi.fn(), fillRect: vi.fn(), stroke: vi.fn(),
  }
  drawScatterChart(ctx as unknown as CanvasRenderingContext2D, rows, { ...bounds, width }, axes)
  return { ctx, labels, points: ctx.arc.mock.calls.filter(([, , r]) => r === 4.5) }
}

describe("scatter chart", () => {
  it("uses independent numeric distances in both directions and only draws axis-aligned rules", () => {
    const { ctx, labels, points: [a, b, c] } = render([
      { x: 8, value: -2, label: "First" },
      { x: -2, value: 10, label: "Second" },
      { x: 0, value: 2, label: "Third" },
    ])
    expect((a[0] - c[0]) / (c[0] - b[0])).toBeCloseTo(4)
    expect((c[1] - b[1]) / (a[1] - c[1])).toBeCloseTo(2)
    expect(a[0]).toBeGreaterThan(c[0])
    expect(a[1]).toBeGreaterThan(c[1])
    expect(ctx.moveTo.mock.calls).toHaveLength(ctx.lineTo.mock.calls.length)
    ctx.moveTo.mock.calls.forEach(([x, y], i) => {
      const [endX, endY] = ctx.lineTo.mock.calls[i]
      expect(x === endX || y === endY).toBe(true)
    })
    expect(labels.map(item => item.value)).toEqual(expect.arrayContaining(["X", "Y", "0", "First", "Second", "Third"]))
  })

  it("keeps repeated x values aligned and identifies coincident points", () => {
    const { ctx, labels, points } = render([
      { x: 3, value: 6, label: "Oak" }, { x: 3, value: 3, label: "" }, { x: 3, value: 6, label: "Elm" },
    ])
    expect(points).toHaveLength(2)
    expect(points[0][0]).toBe(points[1][0])
    expect(points[1][1]).toBeGreaterThan(points[0][1])
    expect(ctx.arc.mock.calls.filter(([, , r]) => r === 7)).toHaveLength(1)
    expect(labels.map(label => label.value)).toContain("Oak, Elm (×2)")
  })

  it("wraps named axes with units and long unbroken captions inside a narrow chart", () => {
    const axes = { x: "Observing duration in minutes", y: "W".repeat(48) }
    const rows = [{ x: 0, value: -5, label: "" }, { x: 5, value: 5, label: "" }]
    const width = 175
    const { labels, points } = render(rows, axes, width)
    const yLines = labels.filter(t => /^W+$/.test(t.value))
    const xLines = labels.filter(t => /[a-z]/i.test(t.value) && !/^W+$/.test(t.value))
    expect(yLines.length).toBeGreaterThan(1)
    expect(yLines.map(t => t.value).join("")).toBe(axes.y)
    expect(xLines.map(t => t.value).join(" ")).toBe(axes.x)
    expect(Math.max(...yLines.map(t => t.y))).toBeLessThan(Math.min(...points.map(p => p[1])))
    expect(Math.min(...xLines.map(t => t.y))).toBeGreaterThan(Math.max(...points.map(p => p[1])))
    expect(labels.every(t => t.x >= bounds.x && t.x + t.width <= bounds.x + width)).toBe(true)
  })

  it("keeps even subnormal, tightly offset, constant and extreme coordinates finite", () => {
    for (const values of [
      [0], [-7, -7], [Number.MIN_VALUE, 2 * Number.MIN_VALUE],
      [1, 1 + Number.EPSILON], [-Number.MAX_VALUE, Number.MAX_VALUE],
    ]) {
      const { points, labels } = render(values.map(x => ({ x, value: x, label: "" })))
      expect(points.flat().every(Number.isFinite)).toBe(true)
      expect(labels.every(t => t.x >= bounds.x && t.x + t.width <= bounds.x + bounds.width
        && t.y > bounds.y && t.y <= bounds.y + bounds.height)).toBe(true)
      expect(labels.some(t => /NaN|Infinity/.test(t.value))).toBe(false)
      if (values[0] !== values[values.length - 1]) {
        expect(points[1][0]).toBeGreaterThan(points[0][0])
        expect(points[1][1]).toBeLessThan(points[0][1])
      }
    }
  })

  it("fits direct labels without obscuring neighboring marks or other direct labels", () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({
      x: i % 4, value: Math.floor(i / 4), label: `A crowded point label ${i}`,
    }))
    const { points, labels } = render(rows)
    const shown = labels.filter(item => item.value.startsWith("A crowded"))
    expect(shown.length).toBeGreaterThan(0)
    for (const [i, item] of shown.entries()) {
      expect(points.every(([x, y]) => x + 7 <= item.x || x - 7 >= item.x + item.width
        || y + 7 <= item.y - 12 || y - 7 >= item.y + 4)).toBe(true)
      expect(shown.slice(i + 1).every(other => other.x + other.width <= item.x || other.x >= item.x + item.width
        || other.y + 4 <= item.y - 12 || other.y - 12 >= item.y + 4)).toBe(true)
    }
  })
})
