const BLOCK_TAGS = /<\/(p|div|h[1-6]|blockquote|pre|li|ul|ol|table|thead|tbody|tfoot|tr)>/gi
const BREAK_TAGS = /<br\s*\/?>/gi
const LIST_ITEM_TAG = /<li\b([^>]*)>/gi
const PARAGRAPH_OPEN_TAG = /<p\b([^>]*)>/gi
const TABLE_TAG = /<table\b[^>]*>([\s\S]*?)<\/table>/gi
const TABLE_ROW_TAG = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
const TABLE_CELL_TAG = /<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi
const HTML_TAGS = /<[^>]+>/g
const RICH_TEXT_TAGS = /(p|div|h[1-6]|blockquote|pre|code|ul|ol|li|strong|b|em|i|u|s|strike|span|mark|a|label|input|table|thead|tbody|tfoot|tr|th|td|colgroup|col)/i
const RICH_TEXT_CLOSING_TAGS = /<\/(p|div|h[1-6]|blockquote|pre|code|ul|ol|li|strong|b|em|i|u|s|strike|span|mark|a|label|table|thead|tbody|tfoot|tr|th|td|colgroup)>/i
const RICH_TEXT_SELF_CLOSING_TAGS = /<(br|input|col)\b[^>]*\/?>/i

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'",
  "&#039;": "'",
  "&nbsp;": " ",
}

export function isRichTextHtml(content: string): boolean {
  const trimmedContent = content.trim()

  if (!trimmedContent.startsWith("<")) {
    return false
  }

  return new RegExp(`<${RICH_TEXT_TAGS.source}\\b`, "i").test(trimmedContent)
    && (RICH_TEXT_CLOSING_TAGS.test(trimmedContent) || RICH_TEXT_SELF_CLOSING_TAGS.test(trimmedContent))
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function plainTextToHtml(text: string): string {
  if (!text) {
    return ""
  }

  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => `<p>${line.length > 0 ? escapeHtml(line) : "<br>"}</p>`)
    .join("")
}

export function normalizeNoteContent(content: string): string {
  if (!content) {
    return ""
  }

  return isRichTextHtml(content) ? content : plainTextToHtml(content)
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&(amp|lt|gt|quot|nbsp|#39|#039);/g, (entity) => HTML_ENTITIES[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, value) => String.fromCharCode(Number(value)))
    .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCharCode(Number.parseInt(value, 16)))
}

function tableHtmlToPlainText(tableContent: string) {
  const rows = Array.from(tableContent.matchAll(TABLE_ROW_TAG), (rowMatch) => {
    const cells = Array.from(rowMatch[1].matchAll(TABLE_CELL_TAG), (cellMatch) =>
      decodeHtmlEntities(
        cellMatch[1]
          .replace(BREAK_TAGS, "\n")
          .replace(BLOCK_TAGS, "\n")
          .replace(HTML_TAGS, ""),
      )
        .replace(/\n+/g, " ")
        .trim(),
    )

    return cells.join("\t")
  })

  return `\n${rows.join("\n")}\n`
}

export function richTextToPlainText(content: string): string {
  if (!content) {
    return ""
  }

  if (!isRichTextHtml(content)) {
    return content.replace(/\r\n?/g, "\n")
  }

  const withTableText = content.replace(TABLE_TAG, (_, tableContent: string) =>
    tableHtmlToPlainText(tableContent),
  )

  const withParagraphIndents = withTableText.replace(PARAGRAPH_OPEN_TAG, (_, attributes: string) => {
    const indentMatch = /\bdata-indent=(["'])(\d+)\1/i.exec(attributes)
    const indent = indentMatch ? Math.min(6, Number(indentMatch[2])) : 0

    return "\t".repeat(indent)
  })

  const withListPrefixes = withParagraphIndents
    .replace(/\r\n?/g, "\n")
    .replace(LIST_ITEM_TAG, (_, attributes: string) => {
      const isTaskItem = /data-type=(["'])taskItem\1/i.test(attributes)

      if (isTaskItem) {
        const isChecked = /data-checked=(["'])(true|)\1/i.test(attributes)
        return `\n${isChecked ? "[x]" : "[ ]"} `
      }

      return "\n- "
    })
    .replace(BREAK_TAGS, "\n")
    .replace(BLOCK_TAGS, "\n")
    .replace(HTML_TAGS, "")

  return decodeHtmlEntities(withListPrefixes)
    .replace(/\n{2,}(?=(\[(?:x| )\]|- ))/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "")
}

export function notePreviewText(content: string, maxLength = 100): string {
  const plainText = richTextToPlainText(content).replace(/\s+/g, " ").trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`
}
