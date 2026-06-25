"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { FileText, Clock, Calendar, ArrowUpRight, WifiOff, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from 'next/link';

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
    const [sanitizedContent, setSanitizedContent] = useState("");
    const createdDate = new Date(createdAt);
    const expiresDate = expiresAt ? new Date(expiresAt) : null;

    // Sanitize HTML on client side
    useEffect(() => {
        const clean = DOMPurify.sanitize(content, {
            ALLOWED_TAGS: [
                "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
                "h1", "h2", "h3", "h4", "h5", "h6",
                "ul", "ol", "li",
                "blockquote", "pre", "code",
                "a", "span", "div", "label", "input"
            ],
            ALLOWED_ATTR: ["href", "target", "rel", "class", "type", "checked", "disabled", "data-type", "data-checked"],
        });
        const parser = new DOMParser();
        const doc = parser.parseFromString(clean, "text/html");

        doc.querySelectorAll('input[type="checkbox"]').forEach((input) => {
            input.setAttribute("disabled", "disabled");
        });

        setSanitizedContent(doc.body.innerHTML);
    }, [content]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
                    <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <FileText className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold text-primary">NerdsNote</h1>
                    </a>
                    <Button onClick={() => window.open(openInAppUrl, '_blank')} variant="outline" size="sm">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Save to my notes
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Metadata badges */}
                <div className="flex flex-wrap gap-3 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        <Clock className="h-3 w-3 mr-1.5" />
                        Shared on {createdDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        <Calendar className="h-3 w-3 mr-1.5" />
                        {expiresDate
                            ? `Expires on ${expiresDate.toLocaleDateString()}`
                            : "Never expires"}
                    </div>
                </div>

                {/* Note content with TipTap-like styling */}
                <Card className="p-6 bg-card">
                    <div
                        className="note-rich-content prose prose-neutral dark:prose-invert max-w-none
                            prose-headings:font-semibold prose-headings:text-foreground
                            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                            prose-p:text-foreground prose-p:leading-relaxed
                            prose-strong:text-foreground prose-strong:font-bold
                            prose-em:italic
                            prose-ul:list-disc prose-ul:pl-6
                            prose-ol:list-decimal prose-ol:pl-6
                            prose-li:text-foreground
                            prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                            prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                            prose-a:text-primary prose-a:underline hover:prose-a:no-underline
                            [&_input]:pointer-events-none
                            [&_u]:underline [&_s]:line-through [&_strike]:line-through"
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                </Card>
            </main>

            {/* Conversion CTA */}
            <section className="border-t border-border bg-muted/20">
                <div className="mx-auto max-w-4xl px-4 py-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Get your own free notepad
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                        NerdsNote is a free online notepad with no login. Your notes stay on
                        your device, work offline, and auto-save as you type.
                    </p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button asChild size="lg">
                            <Link href="/notepad">
                                Start writing — it&apos;s free
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/features">See all features</Link>
                        </Button>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-primary" /> Private by default
                        </span>
                        <span className="flex items-center gap-1.5">
                            <WifiOff className="h-4 w-4 text-primary" /> Works offline
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Zap className="h-4 w-4 text-primary" /> No account needed
                        </span>
                    </div>
                </div>
            </section>

            {/* Footer badge */}
            <footer className="border-t border-border bg-background py-5 text-center text-sm text-muted-foreground">
                <Link href="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Made with <span className="font-semibold text-primary">NerdsNote</span>
                </Link>
            </footer>
        </div>
    );
}
