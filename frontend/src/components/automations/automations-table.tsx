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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, MessageCircle, ArrowDown, ArrowUpDown, Edit } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const dummyAutomations = [
  {
    id: "auto_1",
    name: "link",
    badge: "Auto DM Links from Comments",
    runs: 0,
    ctr: 0,
    modified: "31 minutes ago",
    lastRun: "-",
    status: "active"
  }
]

export function AutomationsTable() {
  const [search, setSearch] = useState("")
  const [automations, setAutomations] = useState<{
    id: string;
    name: string;
    badge: string;
    runs: number;
    ctr: number;
    modified: string;
    lastRun: string;
    status: string;
  }[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('replylink_automations')
    if (saved) {
      setAutomations(JSON.parse(saved))
    } else {
      setAutomations(dummyAutomations)
      localStorage.setItem('replylink_automations', JSON.stringify(dummyAutomations))
    }
  }, [])

  const router = useRouter()

  const filtered = automations.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = (action: string, id: string) => {
    if (action === 'edit') {
      router.push(`/automations/builder?id=${id}`)
    } else if (action === 'delete') {
      const updated = automations.filter(a => a.id !== id)
      setAutomations(updated)
      localStorage.setItem('replylink_automations', JSON.stringify(updated))
      toast.success("Automation deleted successfully")
    } else {
      toast.success(`Action '${action}' triggered for ${id}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search automations..."
          className="pl-8 bg-background border-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground w-[400px]">
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                </div>
              </TableHead>
              <TableHead className="font-semibold text-foreground text-center">Runs</TableHead>
              <TableHead className="font-semibold text-foreground text-center">CTR</TableHead>
              <TableHead className="font-semibold text-foreground">
                <div className="flex items-center gap-1">
                  Modified
                  <ArrowDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ml-1" />
                </div>
              </TableHead>
              <TableHead className="font-semibold text-foreground">Last Run</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No automations found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shrink-0 shadow-sm" />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20 rounded-full px-2 py-0 text-xs font-medium w-fit flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {item.badge}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-foreground">{item.runs}</TableCell>
                  <TableCell className="text-center font-medium text-foreground">{item.ctr}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.modified}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.lastRun}</TableCell>
                  <TableCell>
                    {item.status === "Draft" ? (
                      <Badge className="font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-none px-3">Draft</Badge>
                    ) : (
                      <div className={cn(
                        "w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors",
                        item.status === 'active' ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"
                      )}>
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                          item.status === 'active' ? "translate-x-5" : "translate-x-0"
                        )} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="outline" className="h-8 shadow-sm">
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Edit
                            <ChevronDown className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction('edit', item.id)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('delete', item.id)}>
                          Delete
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
