import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HardDrive, ShieldCheck, FolderHeart, ArrowRight, X } from "lucide-react"
import { useTranslations } from "next-intl"

interface ConnectFolderDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export function ConnectFolderDialog({ isOpen, onClose, onConfirm }: ConnectFolderDialogProps) {
    const t = useTranslations("FolderDialog")
    const tCommon = useTranslations("Common")
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-0 max-w-md w-full overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FolderHeart className="h-5 w-5 text-primary" />
                        {t("title")}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-center text-muted-foreground text-sm">
                        {t("description")}
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="font-medium text-sm">{t("dataControlTitle")}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {t("dataControlDescription")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                            <HardDrive className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="font-medium text-sm">{t("noDataLossTitle")}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {t("noDataLossDescription")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            {tCommon("cancel")}
                        </Button>
                        <Button onClick={() => {
                            onConfirm()
                            onClose()
                        }} className="flex-1 gap-2">
                            {t("selectFolder")} <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
