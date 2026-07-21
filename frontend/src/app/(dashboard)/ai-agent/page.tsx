"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function AIAgentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isActive, setIsActive] = useState(false)
  const [persona, setPersona] = useState("")
  const [fallbackMessage, setFallbackMessage] = useState("")
  const [calBookingLink, setCalBookingLink] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [accountId, setAccountId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch active account first
    const fetchAccountAndSettings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/login")
          return
        }
        const token = session.access_token
        
        // Mock getting active account - in a real app, you'd get this from context or an API
        const accountsRes = await fetch("http://127.0.0.1:8000/api/accounts/", { 
          headers: { "Authorization": `Bearer ${token}` } 
        })
        const accounts = await accountsRes.json()
        
        if (accounts && accounts.length > 0) {
          const activeAccount = accounts.find((a: any) => a.active) || accounts[0]
          setAccountId(activeAccount.instagram_account_id)
          
          // Fetch settings
          const settingsRes = await fetch(`http://127.0.0.1:8000/api/ai_agents/${activeAccount.instagram_account_id}`, { 
            headers: { "Authorization": `Bearer ${token}` } 
          })
          if (settingsRes.ok) {
            const settings = await settingsRes.json()
            setIsActive(settings.is_active || false)
            setPersona(settings.persona || "")
            setFallbackMessage(settings.fallback_message || "")
            setCalBookingLink(settings.cal_booking_link || "")
          }
        }
      } catch (err) {
        console.error("Failed to fetch AI agent settings", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAccountAndSettings()
  }, [])

  const handleSave = async () => {
    if (!accountId) {
      toast.error("No active Instagram account found.")
      return
    }
    
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }
      const token = session.access_token
      
      const res = await fetch(`http://127.0.0.1:8000/api/ai_agents/${accountId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          is_active: isActive,
          persona,
          fallback_message: fallbackMessage,
          cal_booking_link: calBookingLink
        })
      })
      
      if (res.ok) {
        toast.success("AI Agent settings saved successfully.")
      } else {
        const errorData = await res.json()
        toast.error(errorData.detail || "Failed to save AI Agent settings.")
      }
    } catch (err) {
      toast.error("An error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            AI Lead Conversations
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure your global autonomous AI assistant for Instagram DMs.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleSave} 
            disabled={loading || saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="max-w-3xl space-y-8">
          <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="space-y-2">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[350px]" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
            <div className="flex flex-row gap-3 mt-2">
              <Skeleton className="h-4 w-[80px] mt-2 shrink-0" />
              <div className="flex flex-wrap gap-2 w-full">
                 <Skeleton className="h-8 w-32 rounded-full" />
                 <Skeleton className="h-8 w-32 rounded-full" />
                 <Skeleton className="h-8 w-32 rounded-full" />
                 <Skeleton className="h-8 w-32 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-[200px] w-full rounded-md" />
          </div>
          
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[350px]" />
            </div>
            <Skeleton className="h-[100px] w-full rounded-md" />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl space-y-8">
          
          {/* Toggle */}
          <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Enable AI Assistant</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                When enabled, the AI will automatically reply to standard DMs using your Knowledge Base.
              </p>
            </div>
            <div 
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors shrink-0",
                isActive ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                isActive ? "translate-x-6" : "translate-x-0"
              )} />
            </div>
          </div>

          {/* Persona */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Persona Prompt</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Define the personality and goal of your AI. Tell it how to talk, what tone to use, and what it should try to achieve.
              </p>
            </div>
            
            <div className="flex flex-row items-start gap-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 shrink-0">Templates:</span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    label: "Sales Assistant",
                    prompt: "You are a friendly and enthusiastic sales representative for our brand. Your goal is to answer questions using the provided context and encourage users to book a free consultation. Keep responses short and use emojis."
                  },
                  {
                    label: "Support Agent",
                    prompt: "You are a professional customer support agent. Answer questions directly using the provided context. If the answer is not in the context, politely let them know that a human agent will assist them shortly. Be empathetic and clear."
                  },
                  {
                    label: "Playful Creator",
                    prompt: "You are a fun, energetic creator. Use casual language, lots of emojis, and hype up the user! Answer their questions using the context, and always end with a fun question to keep the conversation going."
                  },
                  {
                    label: "Lead Qualifier",
                    prompt: "You are an AI lead qualifier. Your goal is to ask 2-3 short qualifying questions (budget, timeline, needs) before handing them off to our team. Use the provided context to answer their questions along the way. Keep it natural."
                  },
                  {
                    label: "E-commerce Concierge",
                    prompt: "You are a helpful e-commerce shopping assistant. Recommend products from the context based on the user's needs, answer questions about shipping and returns, and provide direct links to purchase."
                  },
                  {
                    label: "Coach / Consultant",
                    prompt: "You are a professional business coach. Offer brief, high-value advice using the provided context, and naturally guide the user to book a discovery call or webinar using our link. Be professional yet encouraging."
                  },
                  {
                    label: "Booking Agent",
                    prompt: "You are an AI booking coordinator. Use the provided context to answer questions about services and pricing, then focus on getting the user to select a time slot on our calendar."
                  },
                  {
                    label: "Real Estate Agent",
                    prompt: "You are a friendly real estate assistant. Answer questions about property listings, neighborhoods, and pricing based on the context. Push to schedule a property viewing."
                  },
                  {
                    label: "SaaS Onboarding",
                    prompt: "You are a technical onboarding specialist. Help new users understand our software by answering their questions using the context. Keep answers brief and link to documentation when necessary."
                  }
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setPersona(preset.prompt)}
                    className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-100 dark:border-indigo-500/20 font-medium"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <Textarea 
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="You are a friendly and enthusiastic sales representative..."
              className="min-h-[180px] resize-y bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 text-sm leading-relaxed"
            />
          </div>

          {/* Fallback Message */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Fallback Message</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                If the AI cannot find an answer in the Knowledge Base or encounters an error, it will send this message.
              </p>
            </div>
            <Textarea 
              value={fallbackMessage}
              onChange={(e) => setFallbackMessage(e.target.value)}
              placeholder="I'm not entirely sure about that! Let me connect you with a human team member."
              className="min-h-[100px] resize-y bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
            />
          </div>
          
          {/* Integrations */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Integrations
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Connect external tools to give your AI Agent more capabilities.
              </p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Cal.com Booking Link
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={calBookingLink}
                  onChange={(e) => setCalBookingLink(e.target.value)}
                  placeholder="e.g. cal.com/username/15min"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-500">
                If provided, the AI will naturally share this link when users express interest in booking a call.
              </p>
            </div>
          </div>
          
        </div>
      )}
    </div>
  )
}
