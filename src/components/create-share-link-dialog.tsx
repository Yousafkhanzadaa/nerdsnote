"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
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
import { prepareShareContent } from "@/lib/share-images";
import { MAX_SHARE_REQUEST_BYTES, MAX_SHARE_TITLE_LENGTH, type ExpiryOption, type ShareNoteResponse, type ShareNoteError } from "@/lib/share-types";

interface CreateShareLinkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    noteContent: string;
}

type DialogState = "consent" | "preparing" | "loading" | "success" | "error";

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
    const [title, setTitle] = useState("");
    const urlInputRef = useRef<HTMLInputElement>(null);
    const [shareUrl, setShareUrl] = useState("");
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [shareNotice, setShareNotice] = useState("");
    const qrCodeRef = useRef<SVGSVGElement>(null);
    const pendingShare = useRef<AbortController | null>(null);
    useEffect(() => () => { pendingShare.current?.abort(); }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (state === "loading") return;
        pendingShare.current?.abort();
        pendingShare.current = null;
        setState("consent");
        setTitle("");
        setExpiresIn("7d");
        setError("");
        setShareUrl("");
        setCopied(false);
        setShareNotice("");
        onClose();
    };

    const handleCreateLink = async () => {
        if (pendingShare.current) return;
        const controller = new AbortController();
        pendingShare.current = controller;
        setState("preparing");
        setError("");
        setShareNotice("");

        let content: string;
        try {
            content = await prepareShareContent(noteContent, controller.signal);
        } catch (cause) {
            if (controller.signal.aborted) return;
            pendingShare.current = null;
            setError(cause instanceof Error ? cause.message : "Could not prepare the images for sharing.");
            setState("error");
            return;
        }
        if (controller.signal.aborted) return;
        const body = JSON.stringify({ content, expiresIn, title: title.trim() || undefined });
        if (new TextEncoder().encode(body).byteLength > MAX_SHARE_REQUEST_BYTES) {
            pendingShare.current = null;
            setError("This note exceeds the 2 MiB sharing limit. Try sharing fewer images or less text.");
            setState("error");
            return;
        }
        setState("loading");
        try {
            const response = await fetch("/api/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
                signal: controller.signal,
            });

            if (!response.ok) {
                const data: ShareNoteError | null = await response.json().catch(() => null);
                const fallback = response.status === 413
                    ? "This note is too large to share. Try fewer images or less text."
                    : "Could not create a share link. Please try again.";
                setError(data?.error || fallback);
                setState("error");
                return;
            }

            const successData = await response.json() as ShareNoteResponse;
            setShareUrl(successData.url);
            setExpiresAt(successData.expiresAt);
            setState("success");

        } catch {
            if (controller.signal.aborted) return;
            setError("Network error. Please check your connection and try again.");
            setState("error");
        } finally {
            if (pendingShare.current === controller) pendingShare.current = null;
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            urlInputRef.current?.focus();
            urlInputRef.current?.select();
            setShareNotice("Select and copy the link to share it.");
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
        <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
            <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-card text-card-foreground shadow-lg">
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <Dialog.Title className="font-serif text-2xl">
                        {state === "success" ? "Your shared note" : "Share this note"}
                    </Dialog.Title>
                    <Button variant="ghost" size="icon" disabled={state === "loading"} onClick={handleClose} aria-label="Close share dialog">
                        <X className="size-4" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6">
                    {/* Consent State */}
                    {state === "consent" && (
                        <div className="space-y-4">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {/<img\b/i.test(noteContent) ? "Your browser prepares compact copies of the images before uploading this note. " : "Creating a link uploads a copy of this note. "}Anyone with the link can read or save the shared copy until it expires. Later edits stay in your notebook.
                            </p>

                            <label className="block space-y-2 text-sm font-medium">
                                <span>Title for readers <span className="font-normal text-muted-foreground">(optional)</span></span>
                                <input
                                    type="text" maxLength={MAX_SHARE_TITLE_LENGTH} value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    className="block h-10 w-full rounded-md border border-input bg-background px-3 font-serif text-base focus-visible:outline-2 focus-visible:outline-ring"
                                />
                            </label>

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
                                            aria-pressed={expiresIn === option.value}
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
                    {(state === "preparing" || state === "loading") && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p role="status" className="text-muted-foreground text-sm">{state === "preparing" ? "Preparing the shared copy…" : "Creating your share link…"}</p>
                        </div>
                    )}

                    {/* Success State */}
                    {state === "success" && (
                        <div className="space-y-4">
                            {/* Success message */}
                            <div className="text-sm text-muted-foreground">
                                {expiresAt && (
                                    <span className="block mt-1">
                                        This link expires on {formatExpiryDate(expiresAt)}.
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
                                    aria-label="Share link"
                                    ref={urlInputRef}
                                    readOnly
                                    value={shareUrl}
                                    className="min-w-0 flex-1 rounded-md border border-input bg-muted/50 px-3 py-2 font-mono text-sm"
                                />
                                <Button aria-label={copied ? "Link copied" : "Copy link"} variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* QR code is rendered locally so the share URL is not sent to a third party. */}
                            <details className="rounded-lg border border-border p-3">
                                <summary className="cursor-pointer text-sm font-medium text-primary">QR code</summary>
                                <div className="mt-3 grid items-center gap-4 sm:grid-cols-[auto_1fr]">
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
                            </details>

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
                                        href={`mailto:?subject=${encodeURIComponent("A note for you")}&body=${encodeURIComponent(`Check out this note: ${shareUrl}`)}`}
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
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
    );
}
