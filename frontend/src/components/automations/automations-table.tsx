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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, Play, Pause, Copy, Trash, Filter } from "lucide-react"
import { toast } from "sonner"

const dummyAutomations = [
  {
    id: "auto_1",
    name: "Story Reply - Lead Gen",
    trigger: "Story Reply",
    status: "active",
    runs: 1240,
    ctr: "15.2%",
    created: "Oct 12, 2023",
    lastRun: "2 mins ago"
  },
  {
    id: "auto_2",
    name: "Comment 'LINK'",
    trigger: "Comment",
    status: "active",
    runs: 450,
    ctr: "28.5%",
    created: "Nov 01, 2023",
    lastRun: "1 hour ago"
  },
  {
    id: "auto_3",
    name: "Support FAQ Bot",
    trigger: "DM",
    status: "paused",
    runs: 3200,
    ctr: "8.1%",
    created: "Sep 15, 2023",
    lastRun: "3 days ago"
  },
]

export function AutomationsTable() {
  const [search, setSearch] = useState("")

  const filtered = dummyAutomations.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.trigger.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = (action: string, id: string) => {
    toast.success(`Action '${action}' triggered for ${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search automations..."
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
              <TableHead>Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Runs</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden sm:table-cell">Last Run</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No automations found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                      {item.trigger}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.status === 'active' ? (
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Paused</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.runs.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">{item.ctr}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{item.created}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{item.lastRun}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {item.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleAction('pause', item.id)}>
                            <Pause className="mr-2 h-4 w-4" /> Pause
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction('resume', item.id)}>
                            <Play className="mr-2 h-4 w-4" /> Resume
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleAction('duplicate', item.id)}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleAction('delete', item.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
