"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { MessageSquare, Bot, UserPlus, Mail, AtSign, Calendar, Clock, Activity, Share2 } from "lucide-react"
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
      <SheetContent className="sm:max-w-[480px] p-0 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <div className="px-6 py-6 bg-gradient-to-b from-primary/5 to-transparent border-b">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow-sm ring-2 ring-primary/20">
                <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <SheetTitle className="text-2xl font-bold tracking-tight">{contact.name}</SheetTitle>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 flex-1 overflow-y-auto space-y-8">
          {/* Details Grid */}
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider">First Contact</span>
              </div>
              <p className="text-sm font-medium pl-1">{new Date(contact.firstContact).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Last Active</span>
              </div>
              <p className="text-sm font-medium pl-1">{new Date(contact.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Messages</span>
              </div>
              <p className="text-sm font-medium pl-1">{contact.messages}</p>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="p-1.5 rounded-md bg-pink-500/10 text-pink-500">
                  <Share2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Source</span>
              </div>
              <div className="pl-1"><Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">{contact.source}</Badge></div>
            </div>
          </div>

          {/* Timeline */}
          {/* Timeline */}
          <div className="bg-background rounded-3xl p-6 border shadow-sm">
            <h4 className="text-base font-bold tracking-tight mb-6 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Activity Timeline
            </h4>
            <div className="relative space-y-0">
              {contact.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-4 pb-8 last:pb-0 relative">
                  {/* Vertical Line */}
                  {idx < contact.timeline.length - 1 && (
                    <div className="absolute left-[15px] top-8 w-[2px] h-[calc(100%-16px)] bg-gradient-to-b from-border to-transparent" />
                  )}
                  {/* Icon */}
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full shrink-0 z-10 ring-4 ring-background shadow-sm",
                    event.type === "dm_received" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30" : 
                    event.type === "ai_reply" ? "bg-primary/10 text-primary" : 
                    "bg-green-50 text-green-600 dark:bg-green-900/30"
                  )}>
                    {getTimelineIcon(event.type)}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className={cn(
                      "text-sm",
                      event.type === "ai_reply" ? "bg-primary/10 text-foreground p-3 rounded-2xl rounded-tl-sm w-fit max-w-[95%]" : 
                      event.type === "dm_received" ? "bg-muted text-foreground p-3 rounded-2xl rounded-tr-sm w-fit max-w-[95%]" : 
                      "text-muted-foreground italic text-sm mt-1"
                    )}>
                      {event.text}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-2 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
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
