"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { knowledgeApi, KnowledgeItem } from "@/lib/api/knowledge"
import { createClient } from "@/utils/supabase/client"
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
import { MoreHorizontal, Search, Trash, Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface KnowledgeTableProps {
  onEdit: (item: KnowledgeItem) => void
}

export function KnowledgeTable({ onEdit }: KnowledgeTableProps) {
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()
  const supabase = createClient()
  
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession()
      return data.session
    }
  })
  
  const userId = sessionData?.user?.id || "test_user_id"

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', userId],
    queryFn: () => knowledgeApi.getAll(userId as string),
    enabled: !!userId,
  })

  const deleteMutation = useMutation({
    mutationFn: knowledgeApi.delete,
    onSuccess: () => {
      toast.success("Knowledge item deleted.")
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    },
    onError: (error) => {
      toast.error("Failed to delete item.")
      console.error(error)
    }
  })

  const items = data?.items || []
  
  const filteredItems = items.filter(item => 
    item.question.toLowerCase().includes(search.toLowerCase()) || 
    item.answer.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead className="w-[150px]">Aliases</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No knowledge items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.question}</TableCell>
                  <TableCell className="max-w-[400px] truncate text-muted-foreground">
                    {item.answer}
                  </TableCell>
                  <TableCell>
                    {item.aliases && item.aliases.length > 0 ? (
                       <Badge variant="secondary">{item.aliases.length} aliases</Badge>
                    ) : (
                       <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this item?")) {
                              deleteMutation.mutate(item.id)
                            }
                          }}
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
