import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, X, Loader2, CheckCircle, Check } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const t = useTranslations("FeedbackDialog")
  const tCommon = useTranslations("Common")
  const [feedback, setFeedback] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!feedback.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await addDoc(collection(db, "nerdsnote"), {
        content: feedback,
        email: email.trim() || null, // Save email if provided, otherwise null
        timestamp: new Date(),
        userAgent: navigator.userAgent,
      })
      setIsSuccess(true)
      setFeedback("")
      setEmail("")
      setTimeout(() => {
        onClose()
        setIsSuccess(false) // Reset for next time
      }, 2000)
    } catch (err) {
      console.error("Error adding feedback: ", err)
      setError("Failed to send feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="p-0 max-w-md w-full overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Send Feedback
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">{t("thankYouTitle")}</h3>
              <p className="text-center text-muted-foreground">
                {t("thankYouDescription")}
              </p>
              <Button onClick={onClose} className="mt-4">
                {tCommon("close")}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t("description")}
              </p>
              <div className="space-y-3">
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t("placeholder")}
                  className="min-h-[100px]"
                  required
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || !feedback.trim()}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("sending")}
                    </>
                  ) : (
                    t("sendFeedback")
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/10 text-center">
          <p className="text-center text-xs text-muted-foreground mt-4">
            {t("footer")}
          </p>
        </div>
      </Card>
    </div>
  )
}
