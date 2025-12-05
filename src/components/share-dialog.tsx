import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Share2, Mail, MessageCircle, Copy, Check, X, Facebook, Linkedin } from "lucide-react"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  activeNote: { title: string; content: string } | undefined
}

export function ShareDialog({ isOpen, onClose, activeNote }: ShareDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false)

  if (!isOpen) return null

  const shareUrl = "https://nerdsnote.com"
  const shareText = "Check out NerdsNote - the best free, distraction-free online notepad! 📝✨ #NerdsNote #Productivity"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const getNoteShareText = () => {
    if (!activeNote) return ""
    return `${activeNote.title}\n\n${activeNote.content}\n\n---\nShared via ${shareUrl}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-0 max-w-md w-full overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share & Connect
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Share the App Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Share NerdsNote App</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full justify-start gap-2 h-11" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="p-1 bg-black text-white rounded-full">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </div>
                  Twitter / X
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-11" asChild>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="p-1 bg-blue-600 text-white rounded-full">
                    <Facebook className="h-3 w-3 fill-current" />
                  </div>
                  Facebook
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-11" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="p-1 bg-blue-700 text-white rounded-full">
                    <Linkedin className="h-3 w-3 fill-current" />
                  </div>
                  LinkedIn
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-11" onClick={handleCopyLink}>
                <div className="p-1 bg-muted-foreground text-white rounded-full">
                  {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </div>
                {copiedLink ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or send this note</span>
            </div>
          </div>

          {/* Send Content Section */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="w-full justify-start gap-2 h-12 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/30 dark:hover:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-900"
                asChild
                disabled={!activeNote}
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(getNoteShareText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <div className="font-medium text-left">WhatsApp</div>
                    <div className="text-[10px] opacity-70 font-normal text-left">Send as message</div>
                  </div>
                </a>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start gap-2 h-12"
                asChild
                disabled={!activeNote}
              >
                <a
                  href={`mailto:?subject=${encodeURIComponent(activeNote?.title || "Note from NerdsNote")}&body=${encodeURIComponent(getNoteShareText())}`}
                >
                  <Mail className="h-5 w-5" />
                  <div>
                    <div className="font-medium text-left">Email</div>
                    <div className="text-[10px] opacity-70 font-normal text-left">Send to friend</div>
                  </div>
                </a>
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Sending a note automatically adds a "Shared via NerdsNote" footer.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/10 text-center">
          <p className="text-sm text-muted-foreground">
            Thank you for sharing! It helps us keep NerdsNote free. ❤️
          </p>
        </div>
      </Card>
    </div>
  )
}

