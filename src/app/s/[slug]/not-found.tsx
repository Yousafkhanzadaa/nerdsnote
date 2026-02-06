import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto flex items-center px-4 py-3">
                    <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <FileText className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold text-primary">NerdsNote</h1>
                    </a>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center px-4">
                <Card className="p-8 max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Note Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        This note doesn't exist or has expired. Shared notes auto-expire after a set period to protect your privacy.
                    </p>
                    <Button asChild>
                        <a href="/">
                            <FileText className="h-4 w-4 mr-2" />
                            Create your own note on NerdsNote
                        </a>
                    </Button>
                </Card>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-muted/30">
                <div className="max-w-4xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
                    NerdsNote — Free, privacy-first notepad
                </div>
            </footer>
        </div>
    );
}
