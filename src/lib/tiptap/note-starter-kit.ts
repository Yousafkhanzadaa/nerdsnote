import { Code } from "@tiptap/extension-code"
import { CodeBlock } from "@tiptap/extension-code-block"
import StarterKit from "@tiptap/starter-kit"

export const noteStarterKit = [
  StarterKit.configure({ code: false, codeBlock: false }),
  // Inline code keeps StarterKit's formatting exclusions, with one exception for highlighting.
  Code.extend({ excludes: "code bold italic strike underline link" }),
  CodeBlock.extend({ marks: "highlight" }),
]
