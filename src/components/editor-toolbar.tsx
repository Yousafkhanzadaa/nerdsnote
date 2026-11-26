import { useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Popover } from "radix-ui"
import { type Editor, useEditorState } from "@tiptap/react"
import {
  Bold,
  Check,
  ChevronDown,
  Columns3,
  Eraser,
  Highlighter,
  ImagePlus,
  ChartColumn,
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
  onImageAction?: () => void
  onChartAction?: () => void
  contained?: boolean
  endContent?: ReactNode
}

function FormatToggle({ label, shortcut, pressed, primary, disabled, onClick, children }: {
  label: string
  shortcut?: string
  pressed: boolean
  primary?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button type="button" variant="ghost" size="icon"
      title={shortcut ? `${label} (${shortcut})` : label} aria-label={label} aria-pressed={pressed}
      disabled={disabled} onClick={onClick}
      className={cn("aria-pressed:bg-accent aria-pressed:text-accent-foreground", primary && "size-10")}>
      {children}
    </Button>
  )
}

function FormattingGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="min-w-0">
      <p aria-hidden="true" className="mb-1 px-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center">{children}</div>
    </div>
  )
}

export function EditorToolbar({
  editor,
  fontSize = 16,
  onFontSizeChange,
  onImageAction,
  onChartAction,
  contained = false,
  endContent,
}: EditorToolbarProps) {
  const moreToolsId = useId()
  const [moreOpen, setMoreOpen] = useState(false)
  const focusEditorOnClose = useRef(false)
  const [tableFormOpen, setTableFormOpen] = useState(false)
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
          imageSelected: false,
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
        imageSelected: currentEditor.isActive("noteImage"),
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
      focusEditorOnClose.current = true
      setTableFormOpen(false)
    }
  }

  // Commands return the writer to the current selection. Dismissing a chooser keeps its normal focus behavior.
  function onToolClose(event: Event) {
    if (!focusEditorOnClose.current) return
    focusEditorOnClose.current = false
    event.preventDefault()
    if (editor && !editor.isDestroyed) editor.commands.focus()
  }

  const runMenuCommand = (command: () => boolean) => () => {
    focusEditorOnClose.current = command()
  }

  const validTableSize =
    parseTableDimension(tableRows) !== null &&
    parseTableDimension(tableColumns) !== null

  const tableButton = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-9 w-11 gap-0.5 px-1.5",
        toolbarState.inTable && "bg-accent text-accent-foreground",
      )}
      title={toolbarState.inTable ? "Edit table" : "Insert table"}
      aria-label={toolbarState.inTable ? "Edit table" : "Insert table"}
    >
      <Table2 className="h-4 w-4" />
      <ChevronDown className="h-3 w-3 opacity-60" />
    </Button>
  )

  return (
    <div className="border-b border-border/70 bg-background px-3 py-1 text-muted-foreground sm:px-6">
      <div className={cn("@container min-w-0", contained && "mx-auto max-w-[47rem] sm:px-3")}>
        <div role="group" aria-label="Formatting" className="flex flex-wrap items-center gap-x-0.5 gap-y-1 @min-[27rem]:gap-x-1">
          <FormatToggle label="Bold" shortcut="Ctrl+B" pressed={toolbarState.bold} primary
            disabled={!editor.can().chain().focus().toggleBold().run()}
            onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </FormatToggle>
          <FormatToggle label="Italic" shortcut="Ctrl+I" pressed={toolbarState.italic} primary
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </FormatToggle>
          <FormatToggle label="Bullet List" pressed={toolbarState.bulletList} primary
            onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </FormatToggle>
          {(onImageAction || onChartAction) && (
            <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-border" />
          )}
          {onImageAction && (
            <Button variant="ghost" size="icon" className="size-10 gap-1.5 @min-[23rem]:w-auto @min-[23rem]:px-2"
              title={toolbarState.imageSelected ? "Edit image description" : "Insert image"}
              aria-label={toolbarState.imageSelected ? "Edit image description" : "Insert image"}
              onClick={onImageAction}>
              <ImagePlus className="h-4 w-4" />
              <span className="hidden @min-[23rem]:inline">Image</span>
            </Button>
          )}
          {onChartAction && (
            <Button variant="ghost" size="icon" className="size-10 gap-1.5 @min-[23rem]:w-auto @min-[23rem]:px-2" title="Insert chart" aria-label="Insert chart" onClick={onChartAction}>
              <ChartColumn className="h-4 w-4" /> <span className="hidden @min-[23rem]:inline">Chart</span>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="More formatting"
            aria-controls={moreToolsId}
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen(!moreOpen)}
            className="ml-auto h-10 gap-1 px-2 has-[>svg]:px-2 aria-expanded:bg-accent aria-expanded:text-accent-foreground"
          >
            More <ChevronDown aria-hidden="true" className={cn("size-3.5", moreOpen && "rotate-180")} />
          </Button>
          {endContent && <div className="flex items-center border-l border-border pl-2">{endContent}</div>}
        </div>

        <div id={moreToolsId} role="group" aria-label="Additional formatting" hidden={!moreOpen}
          className="mt-1 border-t border-border/70 pt-2 pb-1">
          <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
            <FormattingGroup label="Text">
              <FormatToggle label="Underline" shortcut="Ctrl+U" pressed={toolbarState.underline}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <Underline className="h-4 w-4" />
              </FormatToggle>
              <FormatToggle label="Strikethrough" shortcut="Ctrl+Shift+S" pressed={toolbarState.strike}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                onClick={() => editor.chain().focus().toggleStrike().run()}>
                <Strikethrough className="h-4 w-4" />
              </FormatToggle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 w-11 gap-0.5 px-1.5",
                      toolbarState.highlight && "bg-accent text-accent-foreground",
                    )}
                    title="Highlight text (Ctrl+Shift+H)"
                    aria-label="Choose highlight color"
                  >
                    <Highlighter className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48" onCloseAutoFocus={onToolClose}>
                  <DropdownMenuLabel>Highlight color</DropdownMenuLabel>
                  {HIGHLIGHT_COLORS.map((color) => (
                    <DropdownMenuItem
                      key={color.value}
                      onSelect={runMenuCommand(() => editor.chain().focus().setHighlight({ color: color.value }).run())}
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
                    onSelect={runMenuCommand(() => editor.chain().focus().unsetHighlight().run())}
                  >
                    <Eraser className="h-4 w-4" />
                    Remove highlight
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <FormatToggle label="Code" pressed={toolbarState.code}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                onClick={() => editor.chain().focus().toggleCode().run()}>
                <Code className="h-4 w-4" />
              </FormatToggle>
            </FormattingGroup>
            <FormattingGroup label="Paragraph">
              <FormatToggle label="Heading 1" pressed={toolbarState.heading1}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4" />
              </FormatToggle>
              <FormatToggle label="Heading 2" pressed={toolbarState.heading2}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4" />
              </FormatToggle>

              <FormatToggle label="Ordered List" pressed={toolbarState.orderedList}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered className="h-4 w-4" />
              </FormatToggle>
              <FormatToggle label="Checklist" pressed={toolbarState.taskList}
                onClick={() => editor.chain().focus().toggleTaskList().run()}>
                <ListTodo className="h-4 w-4" />
              </FormatToggle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().outdentParagraph().run()}
                disabled={!toolbarState.canOutdent}
                title="Outdent paragraph (Shift+Tab)"
                aria-label="Outdent paragraph"
              >
                <IndentDecrease className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().indentParagraph().run()}
                disabled={!toolbarState.canIndent}
                title="Indent paragraph (Tab)"
                aria-label="Indent paragraph"
              >
                <IndentIncrease className="h-4 w-4" />
              </Button>

              <FormatToggle label="Quote" pressed={toolbarState.blockquote}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote className="h-4 w-4" />
              </FormatToggle>
            </FormattingGroup>
            <FormattingGroup label="Table">
              {toolbarState.inTable ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>{tableButton}</DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64" onCloseAutoFocus={onToolClose}>
                    <DropdownMenuLabel>Edit table</DropdownMenuLabel>
                    <DropdownMenuItem
                      disabled={!toolbarState.canAddRowBefore}
                      onSelect={runMenuCommand(() => editor.chain().focus().addRowBefore().run())}
                    >
                      <Rows3 className="h-4 w-4" />
                      Add row above
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!toolbarState.canAddRowAfter}
                      onSelect={runMenuCommand(() => editor.chain().focus().addRowAfter().run())}
                    >
                      <Rows3 className="h-4 w-4" />
                      Add row below
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!toolbarState.canAddColumnBefore}
                      onSelect={runMenuCommand(() => editor.chain().focus().addColumnBefore().run())}
                    >
                      <Columns3 className="h-4 w-4" />
                      Add column left
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!toolbarState.canAddColumnAfter}
                      onSelect={runMenuCommand(() => editor.chain().focus().addColumnAfter().run())}
                    >
                      <Columns3 className="h-4 w-4" />
                      Add column right
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={runMenuCommand(() => editor.chain().focus().toggleHeaderRow().run())}>
                      <Table2 className="h-4 w-4" />
                      Toggle header row
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!toolbarState.canDeleteRow}
                      onSelect={runMenuCommand(() => editor.chain().focus().deleteRow().run())}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete row
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!toolbarState.canDeleteColumn}
                      onSelect={runMenuCommand(() => editor.chain().focus().deleteColumn().run())}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete column
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={runMenuCommand(() => editor.chain().focus().deleteTable().run())}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete table
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Popover.Root open={tableFormOpen} onOpenChange={setTableFormOpen}>
                  <Popover.Trigger asChild>{tableButton}</Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content align="start" sideOffset={4} collisionPadding={8} aria-label="Insert table"
                      onCloseAutoFocus={onToolClose}
                      className="z-50 w-64 max-w-[calc(100vw-1rem)] rounded-md border bg-popover p-3 text-popover-foreground shadow-md">
                      <form className="space-y-3" onSubmit={insertTable}>
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
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              )}
            </FormattingGroup>
            <FormattingGroup label="History">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </FormattingGroup>
            {onFontSizeChange && (
              <FormattingGroup label="Text size">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 12}
                  title="Decrease text size"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-9 text-center text-xs tabular-nums">{fontSize}px</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={increaseFontSize}
                  disabled={fontSize >= 24}
                  title="Increase text size"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </FormattingGroup>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
