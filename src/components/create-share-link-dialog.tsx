"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Link2,
    Copy,
    Check,
    X,
    Loader2,
    Mail,
    MessageCircle,
    Share2,
    Clock,
    AlertCircle,
} from "lucide-react";
import type { ExpiryOption, ShareNoteResponse, ShareNoteError } from "@/lib/share-types";
import { useTranslations } from "next-intl";

interface CreateShareLinkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    noteContent: string;
}

type DialogState = "consent" | "loading" | "success" | "error";

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
    { value: "1d", label: "1 day" },
];

export function CreateShareLinkDialog({
    isOpen,
    onClose,
    noteContent,
}: CreateShareLinkDialogProps) {
    const t = useTranslations("ShareDialog");
    const tCommon = useTranslations("Common");
    const [state, setState] = useState<DialogState>("consent");
    const [expiresIn] = useState<ExpiryOption>("1d");
    const [shareUrl, setShareUrl] = useState("");
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        setState("consent");
        setError("");
        setShareUrl("");
        setCopied(false);
        onClose();
    };

    const handleCreateLink = async () => {
        setState("loading");
        setError("");

        try {
            const response = await fetch("/api/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: noteContent, expiresIn }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = data as ShareNoteError;
                let errorMessage = errorData.error || t("error");

                if (response.status === 413) {
                    errorMessage = t("errorTooLarge");
                } else if (response.status === 429) {
                    errorMessage = t("errorTooMany");
                }

                setError(errorMessage);
                setState("error");
                return;
            }

            const successData = data as ShareNoteResponse;
            setShareUrl(successData.url);
            setExpiresAt(successData.expiresAt);
            setState("success");

            // Auto-copy to clipboard
            try {
                await navigator.clipboard.writeText(successData.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } catch {
                // Clipboard access may fail, that's okay
            }
        } catch {
            setError(t("errorNetwork"));
            setState("error");
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback: select the text
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Shared Note from NerdsNote",
                    url: shareUrl,
                });
            } catch {
                // User cancelled or share failed
            }
        }
    };

    const formatExpiryDate = (isoDate: string) => {
        return new Date(isoDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-0 max-w-md w-full overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-primary" />
                        {state === "success" ? t("titleSuccess") : t("title")}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Consent State */}
                    {state === "consent" && (
                        <div className="space-y-4">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {t("consentDescription")}
                            </p>

                            {/* Expiry info */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                                <Clock className="h-4 w-4" />
                                <span>{t("expiresIn24Hours")}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={handleClose} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateLink} className="flex-1">
                                    <Link2 className="h-4 w-4 mr-2" />
                                    {t("createLink")}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {state === "loading" && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground text-sm">{t("creatingLink")}</p>
                        </div>
                    )}

                    {/* Success State */}
                    {state === "success" && (
                        <div className="space-y-4">
                            {/* Success message */}
                            <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-3 rounded-md text-sm">
                                {t("successMessage")}
                                {expiresAt && (
                                    <span className="block mt-1">
                                        {t("expiresOn", { date: formatExpiryDate(expiresAt) })}
                                    </span>
                                )}
                                {!expiresAt && (
                                    <span className="block mt-1">{t("neverExpires")}</span>
                                )}
                            </div>

                            {/* URL display with copy */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="flex-1 px-3 py-2 rounded-md border border-input bg-muted/50 text-sm font-mono"
                                />
                                <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Share options */}
                            <div className="grid grid-cols-3 gap-2">
                                {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNativeShare}
                                        className="flex items-center gap-2"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        {t("share")}
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(t("checkOutNote", { url: shareUrl }))}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        {t("whatsapp")}
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={`mailto:?subject=${encodeURIComponent(t("title"))}&body=${encodeURIComponent(t("checkOutNote", { url: shareUrl }))}`}
                                        className="flex items-center gap-2"
                                    >
                                        <Mail className="h-4 w-4" />
                                        {t("email")}
                                    </a>
                                </Button>
                            </div>

                            {/* Done button */}
                            <Button onClick={handleClose} className="w-full">
                                {tCommon("done")}
                            </Button>
                        </div>
                    )}

                    {/* Error State */}
                    {state === "error" && (
                        <div className="space-y-4">
                            <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-3 rounded-md text-sm flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleClose} className="flex-1">
                                    {tCommon("cancel")}
                                </Button>
                                <Button onClick={() => setState("consent")} className="flex-1">
                                    {tCommon("tryAgain")}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card >
        </div >
    );
}
