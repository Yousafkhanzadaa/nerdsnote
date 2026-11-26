"use client"

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react"
import type { Editor } from "@tiptap/core"
import type { Transaction } from "@tiptap/pm/state"
import { Dialog } from "radix-ui"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NOTE_IMAGE_ACCEPT, readNoteImageFile } from "@/lib/note-images"

interface Props {
  editor: Editor
  open: boolean
  onClose: () => void
}

function transferFiles(transfer: DataTransfer | null): File[] {
  if (!transfer) return []
  if (transfer.files?.length) return Array.from(transfer.files)
  return Array.from(transfer.items ?? [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null)
}

// The parent keys this component by note ID. An async decode can only insert
// while the original note is still mounted, even after switching away and back.
export function NoteImages({ editor, open, onClose }: Props) {
  const mounted = useRef(false)
  const dialogRequest = useRef<AbortController | null>(null)
  const [preparing, setPreparing] = useState(0)
  const [error, setError] = useState("")
  const [dialogError, setDialogError] = useState("")
  const [dialogBusy, setDialogBusy] = useState(false)
  const editing = open && editor.isActive("noteImage")

  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      dialogRequest.current?.abort()
    }
  }, [])

  async function insertFiles(files: File[], alt: string, position: number, request?: AbortSignal) {
    if (!editor.isEditable || !mounted.current) return false
    setPreparing((value) => value + 1)
    setError("")
    setDialogError("")
    // Keep the insertion point aligned with text edits made during decoding.
    const mapPosition = ({ transaction }: { transaction: Transaction }) => {
      position = transaction.mapping.map(position)
    }
    editor.on("transaction", mapPosition)
    try {
      const nodes = []
      for (const file of files) {
        const src = await readNoteImageFile(file)
        if (!mounted.current || request?.aborted || editor.isDestroyed) return false
        nodes.push({ type: "noteImage", attrs: { src, alt } })
      }
      if (!editor.isEditable) throw new Error("The notebook is busy. Insert the image again when it is ready.")
      if (!editor.commands.insertContentAt(position, nodes)) throw new Error("Choose a place in the note and insert the image again.")
      return true
    } catch (cause) {
      if (mounted.current && !request?.aborted) {
        const message = cause instanceof Error ? cause.message : "Could not insert the image."
        if (request) setDialogError(message)
        else setError(message)
      }
      return false
    } finally {
      editor.off("transaction", mapPosition)
      if (mounted.current) setPreparing((value) => value - 1)
    }
  }

  useEffect(() => {
    const surface = editor.view.dom
    const paste = (event: ClipboardEvent) => {
      const files = transferFiles(event.clipboardData)
      if (!files.length || !editor.isEditable) return
      event.preventDefault()
      event.stopImmediatePropagation()
      void insertFiles(files, "", editor.state.selection.to)
    }
    const dragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault()
    }
    const drop = (event: DragEvent) => {
      const files = transferFiles(event.dataTransfer)
      if (!files.length) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (!editor.isEditable) return
      const position = editor.view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
      void insertFiles(files, "", position ?? editor.state.selection.to)
    }
    surface.addEventListener("paste", paste, true)
    surface.addEventListener("dragover", dragOver, true)
    surface.addEventListener("drop", drop, true)
    return () => {
      surface.removeEventListener("paste", paste, true)
      surface.removeEventListener("dragover", dragOver, true)
      surface.removeEventListener("drop", drop, true)
    }
  }, [editor])

  function close() {
    dialogRequest.current?.abort()
    dialogRequest.current = null
    setDialogBusy(false)
    setDialogError("")
    onClose()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const description = form.elements.namedItem("description") as HTMLInputElement
    if (editing) {
      if (editor.isEditable) editor.commands.updateAttributes("noteImage", { alt: description.value.trim() })
      close()
      return
    }
    const fileInput = form.elements.namedItem("image") as HTMLInputElement
    const file = fileInput.files?.[0]
    if (!file || dialogRequest.current) return
    const controller = new AbortController()
    dialogRequest.current = controller
    setDialogBusy(true)
    const inserted = await insertFiles([file], description.value.trim(), editor.state.selection.to, controller.signal)
    if (dialogRequest.current === controller) {
      dialogRequest.current = null
      if (mounted.current) setDialogBusy(false)
    }
    if (inserted) close()
  }

  return (
    <>
      {!open && (error || preparing > 0) && (
        <div className="flex items-center justify-center gap-2 bg-muted px-4 py-2 text-sm">
          {error ? <span role="alert">{error}</span> : <span role="status">Preparing image…</span>}
          {error && <Button variant="ghost" size="icon" aria-label="Dismiss image message" onClick={() => setError("")}><X /></Button>}
        </div>
      )}
      <Dialog.Root open={open} onOpenChange={(next) => { if (!next) close() }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
          <Dialog.Content onCloseAutoFocus={(event) => { event.preventDefault(); if (!editor.isDestroyed) editor.commands.focus() }}
            className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(26rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-card p-6 text-card-foreground shadow-lg">
            <Dialog.Title className="font-serif text-2xl">{editing ? "Edit image description" : "Insert image"}</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {editing ? "Describe the image for people using a screen reader." : "Choose a PNG, JPEG, or WebP up to 12 MB. Large images are resized on this device."}
            </Dialog.Description>
            <form onSubmit={submit} className="mt-5 space-y-4">
              {!editing && (
                <label className="block text-sm font-medium">
                  Image file
                  <input type="file" name="image" accept={NOTE_IMAGE_ACCEPT} required
                    className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-2" />
                </label>
              )}
              <label className="block text-sm font-medium">
                Image description (optional)
                <input name="description" type="text" defaultValue={editing ? editor.getAttributes("noteImage").alt ?? "" : ""}
                  className="mt-1.5 block h-10 w-full rounded-md border bg-background px-3 text-base" />
              </label>
              {dialogError && <p role="alert" className="text-sm text-destructive">{dialogError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
                <Button type="submit" disabled={dialogBusy}>
                  {dialogBusy ? "Preparing image…" : editing ? "Save description" : "Insert image"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
