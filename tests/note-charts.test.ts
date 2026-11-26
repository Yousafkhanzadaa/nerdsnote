import { afterEach, describe, expect, it, vi } from "vitest"
import { renderNoteChart, type ChartKind } from "@/lib/note-charts"
import { richTextToPlainText } from "@/lib/note-content"
import { isSafeNoteImageSrc } from "@/lib/note-images"

const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mOwjdEBAAGfAMbFnGqmAAAAAElFTkSuQmCC"
const series = [{ label: "North", value: -5 }, { label: "East", value: 0 }, { label: "South", value: 10 }]

function canvasMock() {
  const text: { value: string; left: number; right: number; y: number }[] = []
  const measure = (value: string) => Array.from(value).length * 9
  const ctx = {
    font: "", textAlign: "left",
    measureText: (value: string) => ({ width: measure(value) }),
    fillText(value: string, x: number, y: number) {
      const width = measure(value)
      const left = x - (this.textAlign === "center" ? width / 2 : this.textAlign === "right" ? width : 0)
      text.push({ value, left, right: left + width, y })
    },
    roundRect: vi.fn(), fillRect: vi.fn(), scale: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    arc: vi.fn(), stroke: vi.fn(), fill: vi.fn(), closePath: vi.fn(), drawImage: vi.fn(),
  }
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
  const encode = vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(png)
  return { ctx, text, encode }
}

afterEach(() => vi.restoreAllMocks())

describe("note charts", () => {
  it("plots signed bars around the same zero and preserves every value in the text export", async () => {
    const { ctx } = canvasMock()
    const { src, alt } = await renderNoteChart("bar", "Balance", series)
    const bars = ctx.roundRect.mock.calls
    expect(bars[0][0] + bars[0][2]).toBeCloseTo(bars[1][0])
    expect(bars[0][2] * 2).toBeCloseTo(bars[1][2])
    expect(bars).toHaveLength(2)
    expect(isSafeNoteImageSrc(src)).toBe(true)
    expect(alt).toBe("Bar chart. Balance. North: -5. East: 0. South: 10")
    expect(richTextToPlainText(`<img src="${src}" alt="${alt}">`)).toBe(`[Image: ${alt}]`)
  })

  it("plots line points in entry order, including negatives and an all-zero series", async () => {
    const { ctx } = canvasMock()
    await renderNoteChart("line", "", series)
    const points = ctx.arc.mock.calls.filter(args => args[2] === 5)
    expect(points).toHaveLength(3)
    expect(points[0][0]).toBeLessThan(points[1][0])
    expect(points[0][1]).toBeGreaterThan(points[1][1])
    expect(points[1][1]).toBeGreaterThan(points[2][1])
    ctx.arc.mockClear()
    await renderNoteChart("line", "", series.map(row => ({ ...row, value: 0 })))
    expect(ctx.arc.mock.calls.every(args => args.every(Number.isFinite))).toBe(true)
  })

  it("slices pies proportionally and describes categories with no slice", async () => {
    const { ctx, text } = canvasMock()
    const rows = series.map((row, i) => ({ ...row, value: [1, 0, 3][i] }))
    const { alt } = await renderNoteChart("pie", "", rows)
    const slices = ctx.arc.mock.calls.filter(args => args[2] === 101)
    expect(slices).toHaveLength(2)
    expect(slices[0][4] - slices[0][3]).toBeCloseTo(Math.PI / 2)
    expect(slices[1][4] - slices[1][3]).toBeCloseTo(Math.PI * 1.5)
    expect(text.map(t => t.value)).toContain("0   ·   0%")
    expect(alt).toContain("East: 0")
  })

  it("draws columns in opposite directions from zero and writes category names directly below the marks", async () => {
    const { ctx, text } = canvasMock()
    await renderNoteChart("column", "Quarterly balance", series)
    const [negative, positive] = ctx.roundRect.mock.calls
    expect(negative[1]).toBeCloseTo(positive[1] + positive[3])
    expect(positive[3]).toBeCloseTo(negative[3] * 2)
    const words = text.map(label => label.value)
    for (const row of series) {
      expect(words).toContain(row.label)
      expect(words).toContain(String(row.value))
    }
  })

  it("shows the total in a donut and keeps each category in its data key", async () => {
    const { text } = canvasMock()
    const rows = [{ label: "Finches", value: 7 }, { label: "Robins", value: 5 }]
    await renderNoteChart("donut", "Bird count", rows)
    expect(text.map(label => label.value)).toEqual(expect.arrayContaining(["12", "Total", "Finches", "Robins"]))
    await expect(renderNoteChart("donut", "", series)).rejects.toThrow("zero or greater")
  })

  it("validates scatter coordinates, preserves point order and includes optional named axes", async () => {
    const { text } = canvasMock()
    const rows = [{ label: "", x: 3, value: 4 }, { label: "A", x: -1, value: 8 }]
    const axes = { x: "  Time (h)  ", y: "Growth (cm)" }
    const { alt } = await renderNoteChart("scatter", "", rows, axes)
    expect(alt).toBe("Scatter chart. Time (h) 3, Growth (cm) 4. A: Time (h) -1, Growth (cm) 8")
    const caption = text.map(label => label.value).join(" ")
    expect(caption).toContain("Time (h)")
    expect(caption).toContain("Growth (cm)")
    await expect(renderNoteChart("scatter", "", rows, { x: "x".repeat(49) })).rejects.toThrow("axis name")
    await expect(renderNoteChart("scatter", "", series)).rejects.toThrow("X value")
    await expect(renderNoteChart("scatter", "", [{ ...rows[0], x: Infinity }, rows[1]])).rejects.toThrow("X value")
  })

  it.each(["bar", "column", "line", "pie", "donut", "scatter"] as const)("lays out a full %s chart with long labels and precise values within the canvas", async kind => {
    const { text, ctx } = canvasMock()
    const rows = Array.from({ length: 12 }, (_, i) => ({
      label: `${"W".repeat(45)}${i}`, value: 0.000000000000000123456789012345 + i, x: i - 2,
    }))
    const chart = await renderNoteChart(kind, "A long title ".repeat(6), rows)
    const [, , width, height] = ctx.fillRect.mock.calls[0]
    expect(text.every(item => item.left >= 0 && item.right <= width && item.y > 0 && item.y < height)).toBe(true)
    for (const row of rows) expect(chart.alt).toContain(kind === "scatter" ? `${row.label}: X ${row.x}, Y ${row.value}` : `${row.label}: ${row.value}`)
  })

  it("rejects invalid series before accessing the canvas", async () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext")
    await expect(renderNoteChart("unsupported" as ChartKind, "", series)).rejects.toThrow("Choose a")
    await expect(renderNoteChart("bar", "", [])).rejects.toThrow("2 and 12")
    await expect(renderNoteChart("line", "A".repeat(81), series)).rejects.toThrow("title")
    await expect(renderNoteChart("bar", "", [...series, { label: " ", value: 1 }])).rejects.toThrow("row 4")
    for (const value of [NaN, Infinity, -2e12]) {
      await expect(renderNoteChart("bar", "", [...series, { label: "West", value }])).rejects.toThrow("row 4")
    }
    await expect(renderNoteChart("pie", "", series)).rejects.toThrow("zero or greater")
    await expect(renderNoteChart("pie", "", series.map(row => ({ ...row, value: 0 })))).rejects.toThrow("positive")
    expect(getContext).not.toHaveBeenCalled()
  })

  it("keeps repeated labels in order and reports an unavailable fallback canvas", async () => {
    const { encode } = canvasMock()
    const rows = [{ label: "Monday", value: 8 }, { label: "Monday", value: 11 }]
    expect((await renderNoteChart("line", "", rows)).alt).toBe("Line chart. Monday: 8. Monday: 11")
    const ctx = document.createElement("canvas").getContext("2d")
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(ctx).mockReturnValueOnce(null)
    encode.mockReturnValueOnce("data:,")
    await expect(renderNoteChart("line", "", rows)).rejects.toThrow("could not draw")
  })
})
