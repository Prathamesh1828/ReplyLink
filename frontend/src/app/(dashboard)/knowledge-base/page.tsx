"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KnowledgeTable } from "@/components/knowledge-base/knowledge-table"
import { KnowledgeDrawer } from "@/components/knowledge-base/knowledge-drawer"
import { KnowledgeItem } from "@/lib/api/knowledge"

export default function KnowledgeBasePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | undefined>(undefined)

  const handleCreate = () => {
    setEditingItem(undefined)
    setIsDrawerOpen(true)
  }

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item)
    setIsDrawerOpen(true)
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Manage the information the AI uses to answer customer questions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Knowledge
          </Button>
        </div>
      </div>

      <KnowledgeTable onEdit={handleEdit} />
      
      <KnowledgeDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen}
        item={editingItem}
      />
    </div>
  )
}
