import React from "react"
import { Button } from "@/components/ui/button"
import { Modal, ModalClose, ModalDescription, ModalTitle } from "@/components/ui/modal"
import { HardDrive, ShieldCheck, FolderHeart, ArrowRight, X } from "lucide-react"

interface ConnectFolderDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export function ConnectFolderDialog({ isOpen, onClose, onConfirm }: ConnectFolderDialogProps) {
    return (
        <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 p-4">
                    <ModalTitle className="flex min-w-0 items-center gap-2 text-base font-semibold sm:text-lg">
                        <FolderHeart className="h-5 w-5 shrink-0 text-primary" />
                        <span className="truncate">Connect Local Folder</span>
                    </ModalTitle>
                    <ModalClose asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" aria-label="Close folder dialog">
                            <X className="h-4 w-4" />
                        </Button>
                    </ModalClose>
                </div>

                <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                    <ModalDescription className="text-center text-muted-foreground text-sm">
                        Sync notes to your device for offline access. Rich formatting is flattened when saved as plain text.
                    </ModalDescription>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="font-medium text-sm">Your Data, Your Control</h4>
                                <p className="text-xs text-muted-foreground">
                                    Notes are saved as plain text files on your computer. We never see or store your data on our servers.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                            <HardDrive className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="font-medium text-sm">No Data Loss</h4>
                                <p className="text-xs text-muted-foreground">
                                    Browser storage can be cleared. A connected folder gives you an independent plain-text copy.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            onConfirm()
                            onClose()
                        }} className="flex-1 gap-2">
                            Select Folder <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
        </Modal>
    )
}
