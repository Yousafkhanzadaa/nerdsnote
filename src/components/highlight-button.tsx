import type { Editor } from "@tiptap/react"
import { Highlighter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HIGHLIGHT_COLORS, toggleNoteHighlight } from "@/lib/note-highlights"
import { cn } from "@/lib/utils"

export const DEFAULT_HIGHLIGHT_COLOR: string = HIGHLIGHT_COLORS[0].value

export function HighlightButton({ editor, color, pressed, showLabel = false }: {
  editor: Editor
  color: string
  pressed: boolean
  showLabel?: boolean
}) {
  const colorName = HIGHLIGHT_COLORS.find(option => option.value === color)?.name ?? color
  return (
    <Button type="button" variant="ghost" size={showLabel ? "sm" : "icon"}
      title={pressed ? "Remove highlight" : `Highlight text in ${colorName.toLowerCase()}`}
      aria-label="Highlight text" aria-pressed={pressed}
      disabled={!editor.isEditable || !editor.schema.marks.highlight || (!pressed && !editor.can().setHighlight({ color }))}
      onPointerDown={event => { if (event.button === 0) event.preventDefault() }}
      onClick={() => toggleNoteHighlight(editor, color)}
      className={cn("h-10 aria-pressed:bg-accent aria-pressed:text-accent-foreground",
        showLabel ? "gap-2 px-3" : "w-9 @min-[21rem]:w-10")}>
      <span aria-hidden="true" className="flex h-5 w-4 flex-col items-center justify-between">
        <Highlighter className="size-4" />
        <span className="h-1 w-4 rounded-full border border-black/20" style={{ backgroundColor: color }} />
      </span>
      {showLabel && (pressed ? "Remove highlight" : "Highlight")}
    </Button>
  )
}
