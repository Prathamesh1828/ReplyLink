"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Trash2, Edit, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function KnowledgeBasePage() {
  const router = useRouter()
  const supabase = createClient()
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [aliasesText, setAliasesText] = useState("")

  const fetchFaqs = async (uid: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }
      const token = session.access_token
      
      const res = await fetch(`http://127.0.0.1:8000/api/knowledge?user_id=${uid}`, { 
        headers: { "Authorization": `Bearer ${token}` } 
      })
      if (res.ok) {
        const data = await res.json()
        setFaqs(data.items || [])
      }
    } catch (err) {
      console.error("Failed to fetch FAQs", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchAccountAndFaqs = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/login")
          return
        }
        const token = session.access_token
        
        const accountsRes = await fetch("http://127.0.0.1:8000/api/accounts/", { 
          headers: { "Authorization": `Bearer ${token}` } 
        })
        const accounts = await accountsRes.json()
        
        if (accounts && accounts.length > 0) {
          const uid = accounts[0].user_id
          setUserId(uid)
          await fetchFaqs(uid)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to fetch account for knowledge base", err)
        setLoading(false)
      }
    }
    
    fetchAccountAndFaqs()
  }, [])

  const handleOpenModal = (faq: any = null) => {
    if (faq) {
      setEditingId(faq.id)
      setQuestion(faq.question)
      setAnswer(faq.answer)
      setAliasesText(faq.aliases ? faq.aliases.join(", ") : "")
    } else {
      setEditingId(null)
      setQuestion("")
      setAnswer("")
      setAliasesText("")
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!userId) return
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and Answer are required.")
      return
    }

    const aliases = aliasesText.split(",").map(s => s.trim()).filter(s => s.length > 0)
    const payload = { question, answer, aliases }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }
      const token = session.access_token
      
      let res;
      if (editingId) {
        res = await fetch(`http://127.0.0.1:8000/api/knowledge/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`http://127.0.0.1:8000/api/knowledge?user_id=${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        })
      }

      if (res.ok) {
        toast.success(editingId ? "FAQ updated" : "FAQ added")
        setIsModalOpen(false)
        fetchFaqs(userId)
      } else {
        toast.error("Failed to save FAQ")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }
      const token = session.access_token
      
      const res = await fetch(`http://127.0.0.1:8000/api/knowledge/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        toast.success("FAQ deleted")
        if (userId) fetchFaqs(userId)
      }
    } catch (err) {
      toast.error("Failed to delete FAQ")
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-500" />
            Knowledge Base
          </h2>
          <p className="text-muted-foreground mt-1">
            Train your AI agent by adding Frequently Asked Questions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add FAQ
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[180px]">
              <div>
                <Skeleton className="h-5 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed">
          <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No knowledge added yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-2">
            Add questions and answers to train your AI on how to respond to your customers.
          </p>
          <Button onClick={() => handleOpenModal()} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white">
            Add your first FAQ
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {faqs.map(faq => (
            <div key={faq.id} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{faq.question}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                  {faq.answer}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(faq)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(faq.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <Input 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                placeholder="What is your return policy?" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Related Phrases / Aliases (comma separated, optional)</label>
              <Input 
                value={aliasesText} 
                onChange={(e) => setAliasesText(e.target.value)} 
                placeholder="refunds, can I return, money back" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer</label>
              <Textarea 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)} 
                placeholder="You can return any item within 30 days..." 
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-indigo-600 text-white">Save FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
