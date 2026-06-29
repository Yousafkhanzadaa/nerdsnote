// Renders a server-side JSON-LD <script> tag. `<` is escaped to avoid
// breaking out of the script context with injected content.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
