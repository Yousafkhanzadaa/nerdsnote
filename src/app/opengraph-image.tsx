import { ImageResponse } from "next/og"

// Default social card used for OpenGraph and Twitter across the site.
export const alt =
  "NerdsNote — a private online notepad for fast, focused writing"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f7f5ed",
          color: "#292e26",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#465b42",
              color: "#fffdf6",
              fontSize: 38,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -0.5 }}>
            NerdsNote
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            A private online notepad for fast, focused writing.
          </div>
          <div style={{ fontSize: 30, color: "#465b42", maxWidth: 900 }}>
            Write for free. Your notes save in your browser.
          </div>
        </div>

        {/* Feature chips */}
        <div style={{ display: "flex", gap: 16 }}>
          {["No account", "Images and charts", "Optional sharing"].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 22px",
                  borderRadius: 999,
                  border: "1px solid #c9cdbd",
                  fontSize: 26,
                  color: "#465b42",
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  )
}
