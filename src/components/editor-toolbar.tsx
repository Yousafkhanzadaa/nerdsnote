import { useState, type FormEvent, type ReactNode } from "react"
import { type Editor, useEditorState } from "@tiptap/react"
import {
  Bold,
  Check,
  ChevronDown,
  Columns3,
  Eraser,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Code,
  Heading1,
  Heading2,
  ListTodo,
  Minus,
  Plus,
  Rows3,
  Table2,
  Trash2,
} from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Input } from "./ui/input"
import { cn } from "@/lib/utils"

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Purple", value: "#e9d5ff" },
] as const

const DEFAULT_TABLE_DIMENSION = 3
const MAX_TABLE_DIMENSION = 50

function parseTableDimension(value: string) {
  const dimension = Number(value)

  if (
    !Number.isInteger(dimension) ||
    dimension < 1 ||
    dimension > MAX_TABLE_DIMENSION
  ) {
    return null
  }

  return dimension
}

interface EditorToolbarProps {
  editor: Editor | null
  fontSize?: number
  onFontSizeChange?: (size: number) => void
  contained?: boolean
  endContent?: ReactNode
}

export function EditorToolbar({
  editor,
  fontSize = 16,
  onFontSizeChange,
  contained = false,
  endContent,
}: EditorToolbarProps) {
  const [tableMenuOpen, setTableMenuOpen] = useState(false)
  const [tableRows, setTableRows] = useState(String(DEFAULT_TABLE_DIMENSION))
  const [tableColumns, setTableColumns] = useState(String(DEFAULT_TABLE_DIMENSION))
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return {
          bold: false,
          blockquote: false,
          bulletList: false,
          canAddColumnAfter: false,
          canAddColumnBefore: false,
          canAddRowAfter: false,
          canAddRowBefore: false,
          canDeleteColumn: false,
          canDeleteRow: false,
          canIndent: false,
          canOutdent: false,
          code: false,
          heading1: false,
          heading2: false,
          highlight: false,
          highlightColor: null as string | null,
          inTable: false,
          italic: false,
          orderedList: false,
          strike: false,
          taskList: false,
          underline: false,
        }
      }

      const inTable = currentEditor.isActive("table")
      const inList =
        currentEditor.isActive("listItem") || currentEditor.isActive("taskItem")
      const canIndentParagraph = !inTable && !inList

      return {
        bold: currentEditor.isActive("bold"),
        blockquote: currentEditor.isActive("blockquote"),
        bulletList: currentEditor.isActive("bulletList"),
        canAddColumnAfter: inTable && currentEditor.can().addColumnAfter(),
        canAddColumnBefore: inTable && currentEditor.can().addColumnBefore(),
        canAddRowAfter: inTable && currentEditor.can().addRowAfter(),
        canAddRowBefore: inTable && currentEditor.can().addRowBefore(),
        canDeleteColumn: inTable && currentEditor.can().deleteColumn(),
        canDeleteRow: inTable && currentEditor.can().deleteRow(),
        canIndent: canIndentParagraph && currentEditor.can().indentParagraph(),
        canOutdent: canIndentParagraph && currentEditor.can().outdentParagraph(),
        code: currentEditor.isActive("code"),
        heading1: currentEditor.isActive("heading", { level: 1 }),
        heading2: currentEditor.isActive("heading", { level: 2 }),
        highlight: currentEditor.isActive("highlight"),
        highlightColor: (currentEditor.getAttributes("highlight").color as string | undefined) ?? null,
        inTable,
        italic: currentEditor.isActive("italic"),
        orderedList: currentEditor.isActive("orderedList"),
        strike: currentEditor.isActive("strike"),
        taskList: currentEditor.isActive("taskList"),
        underline: currentEditor.isActive("underline"),
      }
    },
  })

  if (!editor || !toolbarState) {
    return null
  }

  const decreaseFontSize = () => {
    if (onFontSizeChange && fontSize > 12) {
      onFontSizeChange(fontSize - 2)
    }
  }

  const increaseFontSize = () => {
    if (onFontSizeChange && fontSize < 24) {
      onFontSizeChange(fontSize + 2)
    }
  }

  const insertTable = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const rows = parseTableDimension(tableRows)
    const cols = parseTableDimension(tableColumns)

    if (!rows || !cols) {
      return
    }

    const inserted = editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run()

    if (inserted) {
      setTableMenuOpen(false)
    }
  }

  const validTableSize =
    parseTableDimension(tableRows) !== null &&
    parseTableDimension(tableColumns) !== null

  const toolbarControls = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn("h-8 w-8 p-0", toolbarState.bold && "bg-accent text-accent-foreground")}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn("h-8 w-8 p-0", toolbarState.italic && "bg-accent text-accent-foreground")}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={cn("h-8 w-8 p-0", toolbarState.underline && "bg-accent text-accent-foreground")}
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn("h-8 w-8 p-0", toolbarState.strike && "bg-accent text-accent-foreground")}
        title="Strikethrough (Ctrl+Shift+S)"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-11 gap-0.5 px-1.5",
              toolbarState.highlight && "bg-accent text-accent-foreground",
            )}
            title="Highlight text (Ctrl+Shift+H)"
            aria-label="Choose highlight color"
          >
            <Highlighter className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Highlight color</DropdownMenuLabel>
          {HIGHLIGHT_COLORS.map((color) => (
            <DropdownMenuItem
              key={color.value}
              onSelect={() => editor.chain().focus().setHighlight({ color: color.value }).run()}
            >
              <span
                className="size-4 rounded-sm border border-black/10"
                style={{ backgroundColor: color.value }}
                aria-hidden="true"
              />
              <span>{color.name}</span>
              {toolbarState.highlightColor === color.value && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!toolbarState.highlight}
            onSelect={() => editor.chain().focus().unsetHighlight().run()}
          >
            <Eraser className="h-4 w-4" />
            Remove highlight
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn("h-8 w-8 p-0", toolbarState.heading1 && "bg-accent text-accent-foreground")}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn("h-8 w-8 p-0", toolbarState.heading2 && "bg-accent text-accent-foreground")}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn("h-8 w-8 p-0", toolbarState.bulletList && "bg-accent text-accent-foreground")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn("h-8 w-8 p-0", toolbarState.orderedList && "bg-accent text-accent-foreground")}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn("h-8 w-8 p-0", toolbarState.taskList && "bg-accent text-accent-foreground")}
        title="Checklist"
      >
        <ListTodo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().outdentParagraph().run()}
        disabled={!toolbarState.canOutdent}
        className="h-8 w-8 p-0"
        title="Outdent paragraph (Shift+Tab)"
        aria-label="Outdent paragraph"
      >
        <IndentDecrease className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().indentParagraph().run()}
        disabled={!toolbarState.canIndent}
        className="h-8 w-8 p-0"
        title="Indent paragraph (Tab)"
        aria-label="Indent paragraph"
      >
        <IndentIncrease className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={cn("h-8 w-8 p-0", toolbarState.code && "bg-accent text-accent-foreground")}
        title="Code"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn("h-8 w-8 p-0", toolbarState.blockquote && "bg-accent text-accent-foreground")}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <DropdownMenu open={tableMenuOpen} onOpenChange={setTableMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-11 gap-0.5 px-1.5",
              toolbarState.inTable && "bg-accent text-accent-foreground",
            )}
            title={toolbarState.inTable ? "Edit table" : "Insert table"}
            aria-label={toolbarState.inTable ? "Edit table" : "Insert table"}
          >
            <Table2 className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {toolbarState.inTable ? (
            <>
              <DropdownMenuLabel>Edit table</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={!toolbarState.canAddRowBefore}
                onSelect={() => editor.chain().focus().addRowBefore().run()}
              >
                <Rows3 className="h-4 w-4" />
                Add row above
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!toolbarState.canAddRowAfter}
                onSelect={() => editor.chain().focus().addRowAfter().run()}
              >
                <Rows3 className="h-4 w-4" />
                Add row below
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!toolbarState.canAddColumnBefore}
                onSelect={() => editor.chain().focus().addColumnBefore().run()}
              >
                <Columns3 className="h-4 w-4" />
                Add column left
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!toolbarState.canAddColumnAfter}
                onSelect={() => editor.chain().focus().addColumnAfter().run()}
              >
                <Columns3 className="h-4 w-4" />
                Add column right
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeaderRow().run()}>
                <Table2 className="h-4 w-4" />
                Toggle header row
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!toolbarState.canDeleteRow}
                onSelect={() => editor.chain().focus().deleteRow().run()}
              >
                <Trash2 className="h-4 w-4" />
                Delete row
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!toolbarState.canDeleteColumn}
                onSelect={() => editor.chain().focus().deleteColumn().run()}
              >
                <Trash2 className="h-4 w-4" />
                Delete column
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => editor.chain().focus().deleteTable().run()}
              >
                <Trash2 className="h-4 w-4" />
                Delete table
              </DropdownMenuItem>
            </>
          ) : (
            <form className="space-y-3 p-2" onSubmit={insertTable}>
              <div>
                <p className="text-sm font-medium">Insert table with header</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Choose any size from 1 to {MAX_TABLE_DIMENSION}.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-xs font-medium" htmlFor="table-rows">
                  Rows
                  <Input
                    id="table-rows"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_TABLE_DIMENSION}
                    step={1}
                    value={tableRows}
                    onChange={(event) => setTableRows(event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                    className="h-8"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium" htmlFor="table-columns">
                  Columns
                  <Input
                    id="table-columns"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_TABLE_DIMENSION}
                    step={1}
                    value={tableColumns}
                    onChange={(event) => setTableColumns(event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                    className="h-8"
                  />
                </label>
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={!validTableSize}
                className="h-8 w-full"
              >
                <Table2 className="h-4 w-4" />
                Insert table
              </Button>
            </form>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 w-8 p-0"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 w-8 p-0"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </Button>

      {/* Font Size Controls */}
      {onFontSizeChange && (
        <>
          <div className="w-px h-4 bg-border mx-1" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={decreaseFontSize}
              disabled={fontSize <= 12}
              className="h-8 w-8 p-0"
              title="Decrease text size"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center">{fontSize}px</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={increaseFontSize}
              disabled={fontSize >= 24}
              className="h-8 w-8 p-0"
              title="Increase text size"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </>
  )

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-muted/40 px-2 py-1.5 backdrop-blur-sm sm:py-2">
      <div
        className={cn(
          "flex w-full min-w-0 items-center gap-2",
          contained && "mx-auto max-w-4xl",
        )}
      >
        <div className="scrollbar-theme min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
          <div className="flex min-w-max flex-nowrap items-center gap-1">
            {toolbarControls}
          </div>
        </div>
        {endContent && (
          <div className="flex shrink-0 items-center border-l border-border pl-2">
            {endContent}
          </div>
        )}
      </div>
    </div>
  )
}
