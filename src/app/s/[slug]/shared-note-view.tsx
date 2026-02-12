"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { FileText, ExternalLink, Clock, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from 'next/link';

import { useTranslations } from "next-intl"

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
    const t = useTranslations("SharedNote")
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
                "a", "span", "div"
            ],
            ALLOWED_ATTR: ["href", "target", "rel", "class"],
        });
        setSanitizedContent(clean);
    }, [content]);

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
                    <Button onClick={() => window.open('/', '_blank')} variant="outline" size="sm">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        {t("openInApp")}
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Metadata badges */}
                <div className="flex flex-wrap gap-3 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        <Clock className="h-3 w-3 mr-1.5" />
                        {t("sharedOn", { date: createdDate.toLocaleDateString() })}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        <Calendar className="h-3 w-3 mr-1.5" />
                        {expiresDate
                            ? t("expiresOn", { date: expiresDate.toLocaleDateString() })
                            : t("neverExpires")}
                    </div>
                </div>

                {/* Note content with TipTap-like styling */}
                <Card className="p-6 bg-card">
                    <div
                        className="prose prose-neutral dark:prose-invert max-w-none
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
                            [&_u]:underline [&_s]:line-through [&_strike]:line-through"
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                </Card>
            </main>

            {/* Footer CTA */}
            <footer className="py-6 text-center text-sm text-muted-foreground bg-muted/20 border-t border-border mt-auto">
                <p>{t("footerText")}</p>
                <Link href="/" className="text-primary hover:underline mt-2 inline-block">
                    {t("createYourOwn")}
                </Link>
            </footer>
        </div>
    );
}
