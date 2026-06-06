import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HardDrive, ShieldCheck, FolderHeart, ArrowRight, X } from "lucide-react"

interface ConnectFolderDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export function ConnectFolderDialog({ isOpen, onClose, onConfirm }: ConnectFolderDialogProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
            <Card className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-md p-0 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 p-4">
                    <h3 className="flex min-w-0 items-center gap-2 text-base font-semibold sm:text-lg">
                        <FolderHeart className="h-5 w-5 shrink-0 text-primary" />
                        <span className="truncate">Connect Local Folder</span>
                    </h3>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 shrink-0 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                    <p className="text-center text-muted-foreground text-sm">
                        Sync your notes directly to your device for 100% ownership and offline access.
                    </p>

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
                                    Browser cache can be cleared properly. Saving to a real folder ensures your notes persist forever.
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
            </Card>
        </div>
    )
}
