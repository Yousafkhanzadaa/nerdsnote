import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
      <Card className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-md p-0 shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 p-4">
          <h3 className="flex min-w-0 items-center gap-2 text-base font-semibold sm:text-lg">
            <MessageSquare className="h-5 w-5 shrink-0 text-primary" />
            <span className="truncate">Send Feedback</span>
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 shrink-0 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">Thank You!</h3>
              <p className="text-center text-muted-foreground">
                Your feedback has been received.
              </p>
              <Button onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                We'd love to hear your thoughts, suggestions, or report any issues.
              </p>
              <div className="space-y-3">
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="min-h-[100px]"
                  required
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || !feedback.trim()}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Feedback"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/10 text-center">
          <p className="text-center text-xs text-muted-foreground mt-4">
            Your feedback helps us improve NerdsNote.
          </p>
        </div>
      </Card>
    </div>
  )
}
