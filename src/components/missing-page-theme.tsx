"use client"

import { useLayoutEffect } from "react"

export function MissingPageTheme() {
  // A direct visit to a missing dynamic route can mount the page without running the root head script.
  useLayoutEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", localStorage.getItem("nerds-note-theme") === "dark")
    } catch {
      // Storage can be unavailable in private browsing.
    }
  }, [])

  return null
}
