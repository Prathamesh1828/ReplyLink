"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, ExternalLink, Filter } from "lucide-react"
import { ContactDrawer, Contact } from "./contact-drawer"

const dummyContacts: Contact[] = [
  {
    id: "c_1",
    name: "Sarah Johnson",
    handle: "@sarahjohnson",
    email: "sarah.j@email.com",
    source: "Story Reply",
    status: "lead",
    firstContact: "2024-01-12T10:30:00Z",
    lastActive: "2024-01-14T14:22:00Z",
    messages: 12,
    timeline: [
      { type: "dm_received", text: "Hey, I'd love to know more about your services!", time: "2024-01-14T14:22:00Z" },
      { type: "ai_reply", text: "Thanks for reaching out, Sarah! We offer three plans…", time: "2024-01-14T14:22:05Z" },
      { type: "dm_received", text: "What's the pricing?", time: "2024-01-13T09:15:00Z" },
      { type: "ai_reply", text: "Our starter plan begins at $29/mo. I can send you a link!", time: "2024-01-13T09:15:08Z" },
      { type: "captured", text: "Lead captured via Story Reply automation", time: "2024-01-12T10:30:00Z" },
    ]
  },
  {
    id: "c_2",
    name: "Mike Ross",
    handle: "@mikeross_fit",
    email: null,
    source: "Comment",
    status: "customer",
    firstContact: "2023-12-05T08:00:00Z",
    lastActive: "2024-01-10T16:45:00Z",
    messages: 34,
    timeline: [
      { type: "dm_received", text: "Just signed up! Thanks for the help.", time: "2024-01-10T16:45:00Z" },
      { type: "ai_reply", text: "Welcome aboard, Mike! Let us know if you need anything.", time: "2024-01-10T16:45:03Z" },
      { type: "captured", text: "Lead captured via Comment automation", time: "2023-12-05T08:00:00Z" },
    ]
  },
  {
    id: "c_3",
    name: "Emily Davis",
    handle: "@emilyd",
    email: "emily@company.co",
    source: "DM",
    status: "lead",
    firstContact: "2024-01-08T11:20:00Z",
    lastActive: "2024-01-13T18:00:00Z",
    messages: 5,
    timeline: [
      { type: "dm_received", text: "Do you offer enterprise plans?", time: "2024-01-13T18:00:00Z" },
      { type: "ai_reply", text: "Yes! We have custom enterprise solutions. Let me connect you with our team.", time: "2024-01-13T18:00:04Z" },
      { type: "captured", text: "Lead captured via DM automation", time: "2024-01-08T11:20:00Z" },
    ]
  },
  {
    id: "c_4",
    name: "Alex Wong",
    handle: "@alexwong",
    email: null,
    source: "Story Reply",
    status: "unqualified",
    firstContact: "2024-01-11T07:30:00Z",
    lastActive: "2024-01-11T07:31:00Z",
    messages: 1,
    timeline: [
      { type: "dm_received", text: "🔥", time: "2024-01-11T07:30:00Z" },
      { type: "ai_reply", text: "Thanks for the love! Check out our latest post for more 🙌", time: "2024-01-11T07:30:05Z" },
    ]
  },
  {
    id: "c_5",
    name: "Jordan Lee",
    handle: "@jordanlee.co",
    email: "jordan@lee.co",
    source: "Comment",
    status: "customer",
    firstContact: "2023-11-20T15:00:00Z",
    lastActive: "2024-01-12T12:10:00Z",
    messages: 22,
    timeline: [
      { type: "dm_received", text: "Can I upgrade my plan?", time: "2024-01-12T12:10:00Z" },
      { type: "ai_reply", text: "Of course! Here's a link to manage your subscription.", time: "2024-01-12T12:10:06Z" },
      { type: "captured", text: "Lead captured via Comment automation", time: "2023-11-20T15:00:00Z" },
    ]
  },
]

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ContactsTable() {
  const [search, setSearch] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filtered = dummyContacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleOpen = (contact: Contact) => {
    setSelectedContact(contact)
    setIsDrawerOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="hidden sm:flex">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Messages</TableHead>
                <TableHead className="hidden md:table-cell">First Contact</TableHead>
                <TableHead className="hidden md:table-cell">Last Active</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No contacts found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer"
                    onClick={() => handleOpen(contact)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {contact.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.handle}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">{contact.source}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{contact.messages}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{formatDate(contact.firstContact)}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{formatDate(contact.lastActive)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ContactDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        contact={selectedContact}
      />
    </>
  )
}
