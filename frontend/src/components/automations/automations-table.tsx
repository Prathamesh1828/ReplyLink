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
import { Skeleton } from "@/components/ui/skeleton"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, MessageCircle, ArrowDown, ArrowUpDown, Edit, Trash2, PlusCircle, MessagesSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { Instagram } from "@/components/icons"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

const dummyAutomations = [
  {
    id: "auto_1",
    name: "link",
    badge: "Auto DM Links from Comments",
    runs: 0,
    ctr: 0,
    modified: "31 minutes ago",
    lastRun: "-",
    status: "active",
    automation_type: "auto_dm_comments"
  }
]

const getTemplateIcon = (type: string) => {
  switch (type) {
    case 'auto_dm_comments':
      return { Icon: MessageCircle, bgClass: "bg-[#0ea5e9] text-white" };
    case 'story_reply':
    case 'auto_reply_story':
      return { Icon: PlusCircle, bgClass: "bg-[#10b981] text-white" };
    case 'dm_reply':
    case 'auto_reply_dm':
      return { Icon: MessagesSquare, bgClass: "bg-[#f97316] text-white" };
    default:
      return { Icon: MessageCircle, bgClass: "bg-[#0ea5e9] text-white" };
  }
};

const getTemplateName = (type: string) => {
  switch (type) {
    case 'auto_dm_comments':
      return "Auto-DM Links from Comments";
    case 'story_reply':
    case 'auto_reply_story':
      return "Auto-Respond to Story Replies";
    case 'dm_reply':
    case 'auto_reply_dm':
      return "Auto-Respond to DMs";
    default:
      return "Auto-DM Links from Comments";
  }
};

import { useRealtimeQuery } from "@/hooks/use-realtime-query"

const rowGrid = "grid grid-cols-[3fr_1fr_1fr_1.2fr_1.2fr_1fr_1.2fr] items-center justify-items-center w-full gap-4 px-4"

export function AutomationsTable() {
  const [search, setSearch] = useState("")
  const [templateFilter, setTemplateFilter] = useState("all")
  const [automationToDelete, setAutomationToDelete] = useState<{id: string, name: string} | null>(null)
  const [deleteCountdown, setDeleteCountdown] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [search, templateFilter])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (automationToDelete && deleteCountdown > 0) {
      timer = setTimeout(() => {
        setDeleteCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [automationToDelete, deleteCountdown])

  const getTimeAgo = (dateStr: string) => {
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
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  const { data: rawAutomations, isLoading: loading } = useRealtimeQuery({
    queryKey: ['automations'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/automations/`)
      const data = await res.json()
      if (Array.isArray(data)) {
        return data.map(item => ({
          id: item.id,
          name: item.name || "link",
          badge: getTemplateName(item.automation_type),
          runs: item.runs_count || 0,
          ctr: item.clicks_count || 0,
          modified: item.updated_at ? getTimeAgo(item.updated_at) : "Just now",
          lastRun: item.last_run_at ? getTimeAgo(item.last_run_at) : "-",
          status: item.status || "active",
          automation_type: item.automation_type || "auto_dm_comments"
        }))
      }
      return dummyAutomations
    }
  }, ['automations', 'automation_runs'])

  const automations = rawAutomations || dummyAutomations;

  const router = useRouter()

  const filtered = automations.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchesTemplate = templateFilter === "all" || a.automation_type === templateFilter
    return matchesSearch && matchesTemplate
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedAutomations = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const queryClient = useQueryClient();

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (id.startsWith('auto_')) {
      // Dummy data, just ignore
      return;
    }

    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/automations/${id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, active: newStatus === 'Active' })
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['automations'] })
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
        setDeleteCountdown(3)
      }
    } else {
      toast.success(`Action '${action}' triggered for ${id}`)
    }
  }

  const confirmDelete = async () => {
    if (!automationToDelete) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/automations/${automationToDelete.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['automations'] })
        toast.success(`Automation "${automationToDelete.name}" deleted`)
      } else {
        toast.error("Failed to delete automation")
      }
    } catch (err) {
      toast.error("Failed to delete automation")
    } finally {
      setAutomationToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 w-full max-w-2xl">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search automations..."
            className="pl-8 bg-background border-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "border-input bg-background font-normal text-muted-foreground min-w-[200px] justify-between")}>
            {templateFilter === 'all' ? 'All Templates' : getTemplateName(templateFilter)}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[250px]">
            <DropdownMenuItem onClick={() => setTemplateFilter('all')}>All Templates</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTemplateFilter('auto_dm_comments')}>Auto-DM Links from Comments</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTemplateFilter('auto_reply_story')}>Auto-Respond to Story Replies</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTemplateFilter('auto_reply_dm')}>Auto-Respond to DMs</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className={cn("w-full border-b hover:bg-transparent h-12", rowGrid)}>
              <TableHead className="justify-self-start flex items-center gap-1 font-semibold text-foreground h-12 w-full">
                Name
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
              </TableHead>
              <TableHead className="flex items-center justify-center font-semibold text-foreground h-12 w-full">Runs</TableHead>
              <TableHead className="flex items-center justify-center font-semibold text-foreground h-12 w-full">CTR</TableHead>
              <TableHead className="flex items-center justify-center font-semibold text-foreground h-12 w-full gap-1">
                Modified
                <ArrowDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ml-1" />
              </TableHead>
              <TableHead className="flex items-center justify-center font-semibold text-foreground h-12 w-full">Last Run</TableHead>
              <TableHead className="flex items-center justify-center font-semibold text-foreground h-12 w-full">Status</TableHead>
              <TableHead className="flex items-center justify-center font-semibold text-foreground h-12 w-full">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className={cn("w-full border-b", rowGrid)}>
                  <TableCell className="justify-self-start flex items-center gap-3 w-full py-4">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="flex flex-col gap-2 w-full">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center justify-center w-full"><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell className="flex items-center justify-center w-full"><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell className="flex items-center justify-center w-full"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="flex items-center justify-center w-full"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="flex items-center justify-center w-full"><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                  <TableCell className="flex items-center justify-center w-full"><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow className="w-full">
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground w-full">
                  No automations found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAutomations.map((item) => {
                const { Icon, bgClass } = getTemplateIcon(item.automation_type);
                return (
                <TableRow key={item.id} className={cn("group w-full border-b transition-colors hover:bg-muted/50", rowGrid)}>
                  <TableCell className="justify-self-start flex items-center gap-3 w-full py-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${bgClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1.5 truncate w-full">
                      <span className="font-medium text-foreground truncate leading-none">{item.name}</span>
                      <div className="flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 w-fit px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20 leading-none">
                        <Icon className="w-3 h-3" /> {getTemplateName(item.automation_type)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center justify-center font-medium text-foreground w-full">{item.runs}</TableCell>
                  <TableCell className="flex items-center justify-center font-medium text-foreground w-full">{item.ctr}</TableCell>
                  <TableCell className="flex items-center justify-center text-muted-foreground text-sm w-full">{item.modified}</TableCell>
                  <TableCell className="flex items-center justify-center text-muted-foreground text-sm w-full">{item.lastRun}</TableCell>
                  <TableCell className="flex items-center justify-center w-full">
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
                  <TableCell className="flex items-center justify-center w-full">
                    <div className="flex items-center justify-end w-full">
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
                );
              })
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
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteCountdown > 0}
              className="bg-[#ff5b5b] hover:bg-[#ff4040]"
            >
              {deleteCountdown > 0 ? `Delete (${deleteCountdown})` : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
