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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-0 max-w-md w-full overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FolderHeart className="h-5 w-5 text-primary" />
                        Connect Local Folder
                    </h3>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
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

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
