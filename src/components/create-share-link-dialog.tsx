"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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
    Download,
} from "lucide-react";
import type { ExpiryOption, ShareNoteResponse, ShareNoteError } from "@/lib/share-types";

interface CreateShareLinkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    noteContent: string;
}

type DialogState = "consent" | "loading" | "success" | "error";

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
    { value: "1d", label: "1 day" },
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
];

const QR_SHARE_SIZE = 1024;

export function CreateShareLinkDialog({
    isOpen,
    onClose,
    noteContent,
}: CreateShareLinkDialogProps) {
    const [state, setState] = useState<DialogState>("consent");
    const [expiresIn, setExpiresIn] = useState<ExpiryOption>("7d");
    const selectedExpiryLabel =
        EXPIRY_OPTIONS.find((option) => option.value === expiresIn)?.label ?? "7 days";
    const [shareUrl, setShareUrl] = useState("");
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [shareNotice, setShareNotice] = useState("");
    const qrCodeRef = useRef<SVGSVGElement>(null);

    if (!isOpen) return null;

    const handleClose = () => {
        setState("consent");
        setError("");
        setShareUrl("");
        setCopied(false);
        setShareNotice("");
        onClose();
    };

    const handleCreateLink = async () => {
        setState("loading");
        setError("");
        setShareNotice("");

        try {
            const response = await fetch("/api/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: noteContent, expiresIn }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = data as ShareNoteError;
                let errorMessage = errorData.error || "Error";

                if (response.status === 413) {
                    errorMessage = "Note is too large to share (max 50KB)";
                } else if (response.status === 429) {
                    errorMessage = "Too many shares. Please wait an hour and try again.";
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
            setError("Network error. Please check your connection and try again.");
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

    const getQrSvgMarkup = () => {
        if (!qrCodeRef.current) return null;

        const qrCode = qrCodeRef.current.cloneNode(true) as SVGSVGElement;
        qrCode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        return new XMLSerializer().serializeToString(qrCode);
    };

    const handleDownloadQrCode = () => {
        const svgMarkup = getQrSvgMarkup();
        if (!svgMarkup) return;

        const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");

        downloadLink.href = downloadUrl;
        downloadLink.download = "nerdsnote-share-qr.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(downloadUrl);
    };

    const createQrPngFile = async () => {
        const svgMarkup = getQrSvgMarkup();
        if (!svgMarkup) {
            throw new Error("QR code is not ready");
        }

        const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);

        try {
            const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                const qrImage = new Image();
                qrImage.onload = () => resolve(qrImage);
                qrImage.onerror = () => reject(new Error("Unable to prepare QR image"));
                qrImage.src = svgUrl;
            });
            const canvas = document.createElement("canvas");
            canvas.width = QR_SHARE_SIZE;
            canvas.height = QR_SHARE_SIZE;

            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Canvas is unavailable");
            }

            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, QR_SHARE_SIZE, QR_SHARE_SIZE);
            context.drawImage(image, 0, 0, QR_SHARE_SIZE, QR_SHARE_SIZE);

            const pngBlob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error("Unable to create QR image"));
                    }
                }, "image/png");
            });

            return new File([pngBlob], "nerdsnote-share-qr.png", { type: "image/png" });
        } finally {
            URL.revokeObjectURL(svgUrl);
        }
    };

    const handleNativeShare = async () => {
        if (!navigator.share) return;

        setShareNotice("");

        try {
            let qrFile: File | null = null;

            try {
                qrFile = await createQrPngFile();
            } catch {
                // The link can still be shared if this browser cannot create a PNG.
            }

            let canShareQrFile = false;
            if (qrFile && typeof navigator.canShare === "function") {
                try {
                    canShareQrFile = navigator.canShare({ files: [qrFile] });
                } catch {
                    canShareQrFile = false;
                }
            }

            if (qrFile && canShareQrFile) {
                await navigator.share({
                    title: "Shared Note from NerdsNote",
                    text: `Open this shared note: ${shareUrl}`,
                    files: [qrFile],
                });
                return;
            }

            handleDownloadQrCode();
            await navigator.share({
                title: "Shared Note from NerdsNote",
                text: "Open this shared note from NerdsNote.",
                url: shareUrl,
            });
            setShareNotice(
                "Your browser downloaded the QR image separately because it cannot attach files to the share sheet.",
            );
        } catch (shareError) {
            if (shareError instanceof DOMException && shareError.name === "AbortError") {
                return;
            }
            setShareNotice(
                "Sharing could not be opened. Copy the link and download the QR code instead.",
            );
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
            <Card className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-md p-0 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 p-4">
                    <h3 className="flex min-w-0 items-center gap-2 text-base font-semibold sm:text-lg">
                        <Link2 className="h-5 w-5 shrink-0 text-primary" />
                        <span className="truncate">{state === "success" ? "Link Created!" : "Create a shareable link?"}</span>
                    </h3>
                    <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 shrink-0 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6">
                    {/* Consent State */}
                    {state === "consent" && (
                        <div className="space-y-4">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                This will upload your note to NerdsNote so anyone with the link can view it. The link expires after {selectedExpiryLabel}. We won't track readers. Continue?
                            </p>

                            {/* Expiry selector */}
                            <div className="space-y-2">
                                <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    Link expires after
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {EXPIRY_OPTIONS.map((option) => (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant={expiresIn === option.value ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setExpiresIn(option.value)}
                                        >
                                            {option.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                                <Button variant="outline" onClick={handleClose} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateLink} className="flex-1">
                                    <Link2 className="h-4 w-4 mr-2" />
                                    Create Link
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {state === "loading" && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground text-sm">Creating your share link...</p>
                        </div>
                    )}

                    {/* Success State */}
                    {state === "success" && (
                        <div className="space-y-4">
                            {/* Success message */}
                            <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-3 rounded-md text-sm">
                                Link created — copied to clipboard. Share it with anyone.
                                {expiresAt && (
                                    <span className="block mt-1">
                                        The note will expire on {formatExpiryDate(expiresAt)}.
                                    </span>
                                )}
                                {!expiresAt && (
                                    <span className="block mt-1">This link will never expire.</span>
                                )}
                            </div>

                            {/* URL display with copy */}
                            <div className="flex min-w-0 gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="min-w-0 flex-1 rounded-md border border-input bg-muted/50 px-3 py-2 font-mono text-sm"
                                />
                                <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* QR code is rendered locally so the share URL is not sent to a third party. */}
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
                                    <div className="mx-auto rounded-lg bg-white p-2 shadow-sm">
                                        <QRCodeSVG
                                            ref={qrCodeRef}
                                            value={shareUrl}
                                            size={168}
                                            level="M"
                                            marginSize={4}
                                            bgColor="#ffffff"
                                            fgColor="#111827"
                                            title="QR code for shared note"
                                            aria-label="QR code for shared note"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-sm font-semibold">Scan to open the shared note</p>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Point a phone camera at this QR code to open the link.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownloadQrCode}
                                            className="mt-3 gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download QR
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Share options */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                                    <Button
                                        size="sm"
                                        onClick={handleNativeShare}
                                        className="flex items-center gap-2 sm:col-span-2"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Share link &amp; QR
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(`Check out this note: ${shareUrl}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={`mailto:?subject=${encodeURIComponent("Create a shareable link?")}&body=${encodeURIComponent(`Check out this note: ${shareUrl}`)}`}
                                        className="flex items-center gap-2"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </a>
                                </Button>
                            </div>
                            {shareNotice && (
                                <p className="text-xs leading-relaxed text-muted-foreground" role="status">
                                    {shareNotice}
                                </p>
                            )}

                            {/* Done button */}
                            <Button onClick={handleClose} className="w-full">
                                Done
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

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <Button variant="outline" onClick={handleClose} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={() => setState("consent")} className="flex-1">
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card >
        </div >
    );
}
