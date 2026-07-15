"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { MessageSquare, Bot, UserPlus, Mail, AtSign, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineEvent {
  type: "dm_received" | "ai_reply" | "captured"
  text: string
  time: string
}

export interface Contact {
  id: string
  name: string
  handle: string
  email: string | null
  source: string
  status: string
  firstContact: string
  lastActive: string
  messages: number
  timeline: TimelineEvent[]
}

interface ContactDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getTimelineIcon(type: string) {
  switch (type) {
    case "dm_received":
      return <MessageSquare className="h-4 w-4 text-blue-500" />
    case "ai_reply":
      return <Bot className="h-4 w-4 text-primary" />
    case "captured":
      return <UserPlus className="h-4 w-4 text-green-500" />
    default:
      return <MessageSquare className="h-4 w-4" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "lead":
      return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">Lead</Badge>
    case "customer":
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Customer</Badge>
    case "unqualified":
      return <Badge variant="secondary">Unqualified</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function ContactDrawer({ open, onOpenChange, contact }: ContactDrawerProps) {
  if (!contact) return null

  const initials = contact.name.split(" ").map(n => n[0]).join("")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] flex flex-col h-full overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-xl">{contact.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-1">
                <AtSign className="h-3 w-3" />
                {contact.handle.replace("@", "")}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
              <p className="text-sm font-medium">{contact.email || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              {getStatusBadge(contact.status)}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> First Contact</p>
              <p className="text-sm font-medium">{new Date(contact.firstContact).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Last Active</p>
              <p className="text-sm font-medium">{new Date(contact.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Messages</p>
              <p className="text-sm font-medium">{contact.messages}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Source</p>
              <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">{contact.source}</Badge>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Activity Timeline</h4>
            <div className="relative space-y-0">
              {contact.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-3 pb-6 last:pb-0 relative">
                  {/* Vertical Line */}
                  {idx < contact.timeline.length - 1 && (
                    <div className="absolute left-[11px] top-7 w-[2px] h-[calc(100%-12px)] bg-muted" />
                  )}
                  {/* Icon */}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted shrink-0 z-10">
                    {getTimelineIcon(event.type)}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-relaxed",
                      event.type === "captured" ? "text-muted-foreground italic" : ""
                    )}>
                      {event.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(event.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
