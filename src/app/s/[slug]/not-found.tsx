"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-muted/30 p-6 rounded-full mb-6">
                    <FileQuestion className="h-16 w-16 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Note Not Found</h1>
                <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                    This note doesn't exist or has expired. Shared notes auto-expire after a set period to protect your privacy.
                </p>
                <Button asChild size="lg">
                    <Link href="/">
                        <Home className="h-4 w-4 mr-2" />
                        Create your own note on NerdsNote
                    </Link>
                </Button>
            </main>

            <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
                NerdsNote — Free, privacy-first notepad
            </footer>
        </div>
    )
}
