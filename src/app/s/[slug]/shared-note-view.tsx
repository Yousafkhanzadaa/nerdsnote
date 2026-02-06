"use client";

import { FileText, ExternalLink, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SharedNoteViewProps {
    content: string;
    createdAt: string;
    expiresAt: string | null;
    openInAppUrl: string;
}

export default function SharedNoteView({
    content,
    createdAt,
    expiresAt,
    openInAppUrl,
}: SharedNoteViewProps) {
    const createdDate = new Date(createdAt);
    const expiresDate = expiresAt ? new Date(expiresAt) : null;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
                    <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <FileText className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold text-primary">NerdsNote</h1>
                    </a>
                    <Button asChild size="sm">
                        <a href={openInAppUrl}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in NerdsNote
                        </a>
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Metadata badges */}
                <div className="flex flex-wrap gap-3 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Shared {formatDate(createdDate)}</span>
                    </div>
                    {expiresDate && (
                        <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Expires {formatDate(expiresDate)}</span>
                        </div>
                    )}
                    {!expiresDate && (
                        <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Never expires</span>
                        </div>
                    )}
                </div>

                {/* Note content */}
                <Card className="p-6 bg-card">
                    <pre
                        className="whitespace-pre-wrap break-words font-sans text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </Card>
            </main>

            {/* Footer CTA */}
            <footer className="border-t border-border bg-muted/30 mt-auto">
                <div className="max-w-4xl mx-auto px-4 py-6 text-center">
                    <p className="text-muted-foreground mb-3">
                        NerdsNote is a free, privacy-first notepad. No login required.
                    </p>
                    <Button asChild variant="outline">
                        <a href="/">
                            <FileText className="h-4 w-4 mr-2" />
                            Create your own note
                        </a>
                    </Button>
                </div>
            </footer>
        </div>
    );
}
