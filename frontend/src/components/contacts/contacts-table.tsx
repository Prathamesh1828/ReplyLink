"use client"

import { useState, useEffect } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ExternalLink, Filter, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { ContactDrawer, Contact } from "./contact-drawer"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"



import { useRealtimeQuery } from "@/hooks/use-realtime-query"

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const now = new Date();
  
  // Convert to UTC for accurate comparison since backend dates are UTC
  const utcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  
  const seconds = Math.floor((utcNow - utcDate) / 1000);
  
  // Just in case time sync is slightly off
  if (seconds < 60) return "Just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  
  if (days >= 30 && days < 60) return "1 month ago";
  
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const rowGrid = "grid grid-cols-[3fr_1.5fr_0.6fr] sm:grid-cols-[3fr_1.5fr_1fr_0.6fr] md:grid-cols-[3fr_1.5fr_1fr_1.6fr_1.6fr_0.6fr] items-center justify-items-center w-full gap-4 px-4"

import { createClient } from "@/utils/supabase/client"

export function ContactsTable() {
  const [search, setSearch] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [sourceFilter, setSourceFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const supabase = createClient()

  useEffect(() => {
    setCurrentPage(1)
  }, [search, sourceFilter])

  const { data, isLoading } = useRealtimeQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return []
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/contacts`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const json = await res.json()
      if (Array.isArray(json)) return json
      console.error("API did not return an array:", json)
      return []
    }
  }, ['automations', 'automation_runs', 'messages'])
  
  const contacts = data || []

  const filtered = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      
    const matchesSource = sourceFilter === "All" || c.source === sourceFilter
    
    return matchesSearch && matchesSource
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedContacts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "border-input bg-background font-normal text-muted-foreground min-w-[200px] justify-between")}>
                {sourceFilter === "All" ? "All Sources" : sourceFilter}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setSourceFilter("All")}>All Sources</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSourceFilter("Comment")}>Comment</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSourceFilter("Story Reply")}>Story Reply</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSourceFilter("DM")}>DM</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className={cn("w-full border-b hover:bg-transparent", rowGrid)}>
                <TableHead className="justify-self-start flex items-center gap-2 cursor-pointer hover:text-foreground select-none h-12 w-full">
                  <span className="font-semibold text-foreground">Username</span>
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </TableHead>
                <TableHead className="flex items-center justify-center h-12 w-full">Source</TableHead>
                <TableHead className="hidden sm:flex items-center justify-center h-12 w-full">Messages</TableHead>
                <TableHead className="hidden md:flex items-center justify-center h-12 w-full">First Contact</TableHead>
                <TableHead className="hidden md:flex items-center justify-center h-12 w-full">Last Active</TableHead>
                <TableHead className="flex items-center justify-center h-12 w-full"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className={cn("w-full border-b", rowGrid)}>
                    <TableCell className="justify-self-start flex items-center gap-3 w-full py-4">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="flex items-center justify-center w-full">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="hidden sm:flex items-center justify-center w-full">
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell className="hidden md:flex items-center justify-center w-full">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="hidden md:flex items-center justify-center w-full">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="flex items-center justify-center w-full">
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow className="w-full">
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground w-full">
                    No contacts found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedContacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className={cn("cursor-pointer transition-colors hover:bg-muted/50 w-full border-b", rowGrid)}
                    onClick={() => handleOpen(contact)}
                  >
                    <TableCell className="justify-self-start flex items-center gap-3 w-full py-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="text-sm font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {contact.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[15px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {contact.handle.startsWith("@") ? contact.handle : `@${contact.handle}`}
                      </span>
                    </TableCell>
                    <TableCell className="flex items-center justify-center w-full">
                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">{contact.source}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:flex items-center justify-center font-medium w-full">{contact.messages}</TableCell>
                    <TableCell className="hidden md:flex items-center justify-center text-muted-foreground w-full">{formatDate(contact.firstContact)}</TableCell>
                    <TableCell className="hidden md:flex items-center justify-center text-muted-foreground w-full">{formatDate(contact.lastActive)}</TableCell>
                    <TableCell className="flex items-center justify-center w-full">
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 rounded-lg px-3 flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "h-8 w-8 p-0 rounded-lg font-medium",
                    currentPage === i + 1 
                      ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" 
                      : "bg-transparent text-slate-600 border-slate-200 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                  )}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 rounded-lg px-3 flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <ContactDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        contact={selectedContact}
      />
    </>
  )
}
