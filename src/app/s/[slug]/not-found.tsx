"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home } from "lucide-react"
import { useTranslations } from "next-intl"

export default function NotFound() {
    const t = useTranslations("NotFound")

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-muted/30 p-6 rounded-full mb-6">
                    <FileQuestion className="h-16 w-16 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
                <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                    {t("description")}
                </p>
                <Button asChild size="lg">
                    <Link href="/">
                        <Home className="h-4 w-4 mr-2" />
                        {t("createYourOwn")}
                    </Link>
                </Button>
            </main>

            <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
                {t("footerText")}
            </footer>
        </div>
    )
}
