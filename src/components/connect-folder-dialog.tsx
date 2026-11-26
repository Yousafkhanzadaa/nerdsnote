import { Dialog } from "radix-ui"
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConnectFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  defaultCopyExisting?: boolean
  onConfirm: (copyExistingNotes: boolean) => void
}

export function ConnectFolderDialog({ isOpen, onClose, onConfirm, defaultCopyExisting = true }: ConnectFolderDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 text-card-foreground shadow-lg">
          <Dialog.Title className="font-serif text-2xl">Connect a folder</Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Open the text and Markdown files already in a folder. New notes and edits save there. Deleting a connected note also deletes its file.
          </Dialog.Description>
          <form onSubmit={(event) => {
            event.preventDefault()
            onConfirm(new FormData(event.currentTarget).has("copyExisting"))
            onClose()
          }}>
          <label className="mt-5 flex items-start gap-2 text-sm">
            <input type="checkbox" name="copyExisting" defaultChecked={defaultCopyExisting} className="mt-1 accent-primary" />
            Copy existing browser notes into this folder
          </label>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Dialog.Close asChild><Button type="button" variant="ghost">Cancel</Button></Dialog.Close>
            <Button type="submit">
              <FolderOpen aria-hidden="true" /> Choose folder
            </Button>
          </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
