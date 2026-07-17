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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, MessageCircle, ArrowDown, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { Instagram } from "@/components/icons"
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
  const [automationToDelete, setAutomationToDelete] = useState<{id: string, name: string} | null>(null)
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
    fetch("http://127.0.0.1:8000/api/automations/")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map(item => ({
            id: item.id,
            name: item.name || "link",
            badge: "Auto DM Links from Comments",
            runs: item.runs_count || 0,
            ctr: item.clicks_count || 0,
            modified: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "Just now",
            lastRun: "-",
            status: item.status || "active"
          }))
          setAutomations(mapped)
        }
      })
      .catch(err => {
        console.error("Failed to load automations", err)
        setAutomations(dummyAutomations)
      })
  }, [])

  const router = useRouter()

  const filtered = automations.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (id.startsWith('auto_')) {
      setAutomations(automations.map(a => 
        a.id === id ? { ...a, status: currentStatus === 'Active' ? 'Inactive' : 'Active' } : a
      ))
      return;
    }

    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/automations/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, active: newStatus === 'Active' })
      });
      if (res.ok) {
        setAutomations(automations.map(a => a.id === id ? { ...a, status: newStatus } : a))
        if (newStatus === 'Active') {
          toast.success("Automation activated")
        } else {
          toast.error("Automation deactivated")
        }
      } else {
        toast.error("Failed to update status")
      }
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const handleAction = async (action: string, id: string) => {
    if (action === 'edit') {
      router.push(`/automations/builder?id=${id}`)
    } else if (action === 'delete') {
      const automation = automations.find(a => a.id === id)
      if (automation) {
        setAutomationToDelete({ id, name: automation.name })
      }
    } else {
      toast.success(`Action '${action}' triggered for ${id}`)
    }
  }

  const confirmDelete = async () => {
    if (!automationToDelete) return
    const id = automationToDelete.id
    
    if (id.startsWith('auto_')) {
      setAutomations(automations.filter(a => a.id !== id))
      toast.success("Automation deleted successfully")
      setAutomationToDelete(null)
      return
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/automations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAutomations(automations.filter(a => a.id !== id))
        toast.success("Automation deleted successfully")
      } else {
        toast.error("Failed to delete automation")
      }
    } catch (err) {
      console.error("Failed to delete", err)
      toast.error("Failed to delete automation")
    }
    setAutomationToDelete(null)
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
                          <Instagram className="h-3 w-3" />
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
                      <div 
                        onClick={() => toggleStatus(item.id, item.status)}
                        className={cn(
                        "w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors",
                        item.status === 'Active' ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"
                      )}>
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                          item.status === 'Active' ? "translate-x-5" : "translate-x-0"
                        )} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end">
                      <div className="flex items-center border rounded-md shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                        <Button 
                          variant="ghost" 
                          className="h-8 px-3 rounded-none hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={() => handleAction('edit', item.id)}
                        >
                          <Edit className="h-4 w-4 mr-2 text-slate-700 dark:text-slate-300" />
                          <span className="font-medium text-blue-600 dark:text-blue-500">Edit</span>
                        </Button>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 px-2 rounded-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                            <ChevronDown className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 min-w-0">
                            <DropdownMenuItem 
                              onClick={() => handleAction('delete', item.id)}
                              className="text-red-600 dark:text-red-500 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer font-medium"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={!!automationToDelete} onOpenChange={(open) => !open && setAutomationToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Automation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{automationToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setAutomationToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
