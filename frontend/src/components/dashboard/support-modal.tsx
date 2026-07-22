"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LifeBuoy, MessageSquare, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

interface SupportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const [tab, setTab] = useState<"support" | "feedback">("support")
  const [subject, setSubject] = useState("")
  const [details, setDetails] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here we would handle the submission
    console.log({ type: tab, subject, details })
    setSubject("")
    setDetails("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 gap-6">
        <DialogHeader className="gap-2 text-left">
          <DialogTitle className="text-xl font-bold">Support & Feedback</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Share product ideas or ask for help. We'll route this to the team with your account context. You can also email us using the link below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full rounded-lg bg-muted/50 p-1">
          <button
            onClick={() => setTab("support")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
              tab === "support" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LifeBuoy className="h-4 w-4" />
            Support
          </button>
          <button
            onClick={() => setTab("feedback")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
              tab === "feedback" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {tab === "support" ? (
                <>
                  <p>Describe what you're trying to do and what's blocking you. Include errors or steps to reproduce if relevant.</p>
                  <p className="mt-2 text-foreground font-medium">Our team will contact you very shortly.</p>
                </>
              ) : (
                <p>Help us make ReplyLink better than ever</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
              <Input
                id="subject"
                placeholder={tab === "support" ? "e.g. Cannot connect Instagram account" : "e.g. Suggestion for automation templates"}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details" className="text-base font-medium">Details</Label>
              <Textarea
                id="details"
                placeholder="Write as much context as helps..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="min-h-[120px] resize-none"
                required
              />
            </div>
          </div>

          <Button type="submit" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
            Send to team
          </Button>
        </form>

        <div className="border-t pt-6">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Email us</p>
              <p className="text-muted-foreground">
                For support or feedback, you can also write to us at{" "}
                <a href="mailto:hello@replylink.com" className="text-[#4F46E5] hover:underline">
                  hello@replylink.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
