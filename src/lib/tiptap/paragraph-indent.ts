import { Extension, type CommandProps } from "@tiptap/core"

const MIN_INDENT = 0
export const MAX_PARAGRAPH_INDENT = 6

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    paragraphIndent: {
      indentParagraph: () => ReturnType
      outdentParagraph: () => ReturnType
    }
  }
}

function clampIndent(value: number) {
  return Math.min(MAX_PARAGRAPH_INDENT, Math.max(MIN_INDENT, value))
}

function changeParagraphIndent(delta: 1 | -1) {
  return ({ state, dispatch }: CommandProps) => {
    const paragraphType = state.schema.nodes.paragraph
    const tr = state.tr

    if (!paragraphType) {
      return false
    }

    const paragraphPositions = new Map<number, number>()

    state.selection.ranges.forEach(({ $from, $to }) => {
      state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
        if (node.type === paragraphType) {
          paragraphPositions.set(pos, Number(node.attrs.indent) || MIN_INDENT)
        }
      })
    })

    let changed = false

    paragraphPositions.forEach((currentIndent, pos) => {
      const nextIndent = clampIndent(currentIndent + delta)

      if (nextIndent === currentIndent) {
        return
      }

      changed = true

      if (dispatch) {
        const node = state.doc.nodeAt(pos)

        if (node) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            indent: nextIndent,
          })
        }
      }
    })

    if (changed && dispatch) {
      dispatch(tr)
    }

    return changed
  }
}

export const ParagraphIndent = Extension.create({
  name: "paragraphIndent",

  // Lists and tables own Tab first; this handles ordinary paragraphs after
  // their higher-priority keyboard shortcuts decline the event.
  priority: 50,

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          indent: {
            default: MIN_INDENT,
            parseHTML: (element) => clampIndent(Number(element.getAttribute("data-indent")) || MIN_INDENT),
            renderHTML: (attributes) => {
              const indent = clampIndent(Number(attributes.indent) || MIN_INDENT)

              return indent > MIN_INDENT ? { "data-indent": String(indent) } : {}
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indentParagraph: () => changeParagraphIndent(1),
      outdentParagraph: () => changeParagraphIndent(-1),
    }
  },

  addKeyboardShortcuts() {
    const isStructuredContent = () =>
      this.editor.isActive("table") ||
      this.editor.isActive("listItem") ||
      this.editor.isActive("taskItem")

    return {
      Tab: () => !isStructuredContent() && this.editor.commands.indentParagraph(),
      "Shift-Tab": () => !isStructuredContent() && this.editor.commands.outdentParagraph(),
    }
  },
})
