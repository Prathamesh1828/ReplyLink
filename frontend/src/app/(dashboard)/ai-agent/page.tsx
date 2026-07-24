"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Save, Loader2, GripVertical, Plus, Trash2, Calendar, MessageSquare, Search, CheckSquare, MessageCircle, PlusCircle, MessagesSquare } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { ConnectInstagramDialog } from "@/components/dashboard/connect-instagram-dialog"

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

export default function AIAgentPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Base State
  const [isActive, setIsActive] = useState(false)
  const [persona, setPersona] = useState("")
  const [fallbackMessage, setFallbackMessage] = useState("")
  const [calBookingLink, setCalBookingLink] = useState("")
  
  // Config State
  const [aiGoal, setAiGoal] = useState("Sales Assistant")
  const [tone, setTone] = useState("Friendly")
  const [replyDelay, setReplyDelay] = useState("Instant")
  const [messageLength, setMessageLength] = useState("Short")
  const [useEmojis, setUseEmojis] = useState(true)
  const [conversationMemory, setConversationMemory] = useState(true)
  const [leadQualificationEnabled, setLeadQualificationEnabled] = useState(false)
  const [qualificationQuestions, setQualificationQuestions] = useState<string[]>([
    "Name", "Email", "Phone Number", "Budget", "Business / Requirement"
  ])
  const [bookingProvider, setBookingProvider] = useState("cal.com")
  
  // AI Activation State
  const [activation, setActivation] = useState("after_keyword_automation")
  const [automationIds, setAutomationIds] = useState<string[]>([])
  const [activeAutomations, setActiveAutomations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  const [humanHandoffEnabled, setHumanHandoffEnabled] = useState(false)
  const [humanHandoffTriggers, setHumanHandoffTriggers] = useState<string[]>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [showConnectDialog, setShowConnectDialog] = useState(false)

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
        const accountsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/accounts/`, { 
          headers: { "Authorization": `Bearer ${token}` } 
        })
        const accounts = await accountsRes.json()
        
        if (accounts && accounts.length > 0) {
          const activeAccount = accounts.find((a: any) => a.active) || accounts[0]
          setAccountId(activeAccount.instagram_account_id)
          
          // Fetch active automations
          const automationsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/automations/`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
          if (automationsRes.ok) {
            const allAutomations = await automationsRes.json()
            setActiveAutomations(allAutomations.filter((a: any) => a.active === true && a.automation_type !== "ai_agent"))
          }
          
          // Fetch settings
          const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/ai_agents/${activeAccount.instagram_account_id}`, { 
            headers: { "Authorization": `Bearer ${token}` } 
          })
          if (settingsRes.ok) {
            const settings = await settingsRes.json()
            setIsActive(settings.is_active || false)
            setPersona(settings.persona || "")
            setFallbackMessage(settings.fallback_message || "")
            setCalBookingLink(settings.cal_booking_link || "")
            
            if (settings.config) {
              const cfg = settings.config
              if (cfg.aiGoal) setAiGoal(cfg.aiGoal)
              if (cfg.tone) setTone(cfg.tone)
              if (cfg.replyDelay) setReplyDelay(cfg.replyDelay)
              if (cfg.messageLength) setMessageLength(cfg.messageLength)
              if (cfg.useEmojis !== undefined) setUseEmojis(cfg.useEmojis)
              if (cfg.conversationMemory !== undefined) setConversationMemory(cfg.conversationMemory)
              if (cfg.leadQualificationEnabled !== undefined) setLeadQualificationEnabled(cfg.leadQualificationEnabled)
              if (cfg.qualificationQuestions) setQualificationQuestions(cfg.qualificationQuestions)
              if (cfg.bookingProvider) setBookingProvider(cfg.bookingProvider)
              if (cfg.activation) setActivation(cfg.activation)
              if (cfg.automation_ids) setAutomationIds(cfg.automation_ids)
              
              if (cfg.aiTrigger && !cfg.activation) {
                if (cfg.aiTrigger === "Every Incoming Message") setActivation("all_dms")
                else setActivation("after_keyword_automation")
              }
              
              if (cfg.humanHandoffEnabled !== undefined) setHumanHandoffEnabled(cfg.humanHandoffEnabled)
              if (cfg.humanHandoffTriggers) setHumanHandoffTriggers(cfg.humanHandoffTriggers)
            }
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
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/ai_agents/${accountId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          is_active: isActive,
          persona,
          fallback_message: fallbackMessage,
          cal_booking_link: calBookingLink,
          config: {
            aiGoal,
            tone,
            replyDelay,
            messageLength,
            useEmojis,
            conversationMemory,
            leadQualificationEnabled,
            qualificationQuestions,
            bookingProvider,
            activation,
            automation_ids: automationIds,
            humanHandoffEnabled,
            humanHandoffTriggers
          }
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

  const addQuestion = () => {
    setQualificationQuestions([...qualificationQuestions, ""])
  }
  
  const updateQuestion = (index: number, val: string) => {
    const newQ = [...qualificationQuestions]
    newQ[index] = val
    setQualificationQuestions(newQ)
  }
  
  const removeQuestion = (index: number) => {
    setQualificationQuestions(qualificationQuestions.filter((_, i) => i !== index))
  }
  
  const toggleHandoffTrigger = (trigger: string) => {
    if (humanHandoffTriggers.includes(trigger)) {
      setHumanHandoffTriggers(humanHandoffTriggers.filter(t => t !== trigger))
    } else {
      setHumanHandoffTriggers([...humanHandoffTriggers, trigger])
    }
  }

  const tones = ["Friendly", "Professional", "Luxury", "Playful", "Technical", "Minimal"]

  const filteredAutomations = activeAutomations.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.keyword && a.keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const toggleAutomationSelection = (id: string) => {
    if (automationIds.includes(id)) {
      setAutomationIds(automationIds.filter(aId => aId !== id))
    } else {
      setAutomationIds([...automationIds, id])
    }
  }

  const selectAllAutomations = () => {
    setAutomationIds(activeAutomations.map(a => a.id))
  }

  const clearAllAutomations = () => {
    setAutomationIds([])
  }

  return (
    <div className="flex-1 space-y-6 pb-20">
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
        <div className="max-w-3xl space-y-6">
          <ConnectInstagramDialog open={showConnectDialog} onOpenChange={setShowConnectDialog} />
          
          {/* 1. AI Assistant Toggle */}
          <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/30 transition-colors">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Enable AI Assistant</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                When enabled, the AI will automatically reply to standard DMs using your Knowledge Base.
              </p>
            </div>
            <div 
              onClick={() => {
                if (!accountId) {
                  setShowConnectDialog(true)
                  return
                }
                setIsActive(!isActive)
              }}
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

          {/* 7. AI Activation */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Activation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Choose when your AI Assistant should start handling Instagram conversations.
              </p>
            </div>
            <div className="space-y-3">
              <Select value={activation} onValueChange={setActivation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select activation mode">
                    {activation === "all_dms" ? (
                      "All DMs"
                    ) : (
                      <div className="flex items-center gap-2">
                        After Keyword Automation
                        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_dms">All DMs</SelectItem>
                  <SelectItem value="after_keyword_automation">
                    <div className="flex items-center gap-2">
                      After Keyword Automation
                      <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {activation === "all_dms" 
                  ? "The AI will automatically respond to every incoming Instagram DM."
                  : "The selected keyword automation will execute normally. Once it has finished, if the customer continues the conversation, the AI Assistant will automatically take over."}
              </p>
            </div>
          </div>

          {/* AI Enabled Automations (Conditional) */}
          <AnimatePresence>
            {activation === "after_keyword_automation" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Enabled Automations</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Select which keyword automations should hand over the conversation to the AI Assistant after they complete.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search automations..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="text-sm font-medium text-slate-500">
                        {automationIds.length} of {activeAutomations.length} selected
                      </span>
                      <Button variant="outline" size="sm" onClick={selectAllAutomations} className="h-9">
                        <CheckSquare className="w-4 h-4 mr-2" /> All
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearAllAutomations} className="h-9">
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {filteredAutomations.length === 0 ? (
                      <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                        No active keyword automations found. Create some in the Automations tab first!
                      </div>
                    ) : (
                      filteredAutomations.map((auto) => {
                        const isSelected = automationIds.includes(auto.id)
                        const { Icon: TemplateIcon, bgClass } = getTemplateIcon(auto.automation_type)
                        const templateName = getTemplateName(auto.automation_type)
                        
                        return (
                          <div 
                            key={auto.id}
                            onClick={() => toggleAutomationSelection(auto.id)}
                            className={cn(
                              "flex items-center p-3 rounded-lg border cursor-pointer transition-all",
                              isSelected 
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                                : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900"
                            )}
                          >
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => {}} 
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-3 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {auto.name || "Untitled Automation"}
                              </p>
                              <div className="flex items-center mt-1.5 text-xs text-slate-500 dark:text-slate-400 gap-2">
                                <div className={cn("p-1 rounded flex items-center justify-center shadow-sm", bgClass)}>
                                  <TemplateIcon className="w-3 h-3" />
                                </div>
                                <span className="truncate">
                                  {templateName} {auto.keyword ? `• Keyword: "${auto.keyword}"` : "• Any Message"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. AI Goal */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Goal</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                What is the primary objective of this AI Assistant?
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Primary Goal
              </label>
              <Select value={aiGoal} onValueChange={setAiGoal}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales Assistant">Sales Assistant</SelectItem>
                  <SelectItem value="Support Agent">Support Agent</SelectItem>
                  <SelectItem value="Lead Qualification">Lead Qualification</SelectItem>
                  <SelectItem value="Appointment Booking">Appointment Booking</SelectItem>
                  <SelectItem value="Product Recommendation">Product Recommendation</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 3. AI Persona */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Persona</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Define the personality and instructions for your AI. Tell it how to talk and what tone to use.
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
                  }
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setPersona(preset.prompt)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-row items-start gap-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 shrink-0">Tone:</span>
              <div className="flex flex-wrap items-center gap-2">
                {tones.map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full font-medium transition-colors border",
                      tone === t 
                        ? "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:border-slate-800"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Persona Prompt
              </label>
              <Textarea 
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="You are a friendly and enthusiastic sales representative..."
                className="min-h-[140px] resize-y bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* 4. AI Behaviour */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Behaviour</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Control how the AI responds and remembers past interactions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Reply Delay
                </label>
                <Select value={replyDelay} onValueChange={setReplyDelay}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select delay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instant">Instant (0s)</SelectItem>
                    <SelectItem value="2s">2 seconds</SelectItem>
                    <SelectItem value="5s">5 seconds</SelectItem>
                    <SelectItem value="10s">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Makes the bot feel more human.</p>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Message Length
                </label>
                <Select value={messageLength} onValueChange={setMessageLength}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short">Short (1-2 sentences)</SelectItem>
                    <SelectItem value="Medium">Medium (3-4 sentences)</SelectItem>
                    <SelectItem value="Detailed">Detailed (Paragraphs)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Guide the verbosity of responses.</p>
              </div>
            </div>

            <div className="flex flex-col space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Use Emojis</span>
                  <p className="text-xs text-slate-500">Allow AI to insert emojis naturally.</p>
                </div>
                <div 
                  onClick={() => setUseEmojis(!useEmojis)}
                  className={cn("w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors shrink-0", useEmojis ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", useEmojis ? "translate-x-5" : "translate-x-0")} />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Conversation Memory</span>
                  <p className="text-xs text-slate-500">Remember context from the last 10 messages.</p>
                </div>
                <div 
                  onClick={() => setConversationMemory(!conversationMemory)}
                  className={cn("w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors shrink-0", conversationMemory ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")}
                >
                  <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", conversationMemory ? "translate-x-5" : "translate-x-0")} />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Lead Qualification */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Lead Qualification</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Have the AI ask a series of questions to qualify leads before proceeding.
                </p>
              </div>
              <div 
                onClick={() => setLeadQualificationEnabled(!leadQualificationEnabled)}
                className={cn("w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors shrink-0", leadQualificationEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")}
              >
                <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", leadQualificationEnabled ? "translate-x-5" : "translate-x-0")} />
              </div>
            </div>
            
            {leadQualificationEnabled && (
              <div className="pt-4 space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Qualification Questions
                </label>
                <div className="space-y-2">
                  {qualificationQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="text-slate-400 cursor-move">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        value={q}
                        onChange={(e) => updateQuestion(idx, e.target.value)}
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950/50"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(idx)} className="h-9 w-9 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addQuestion} className="mt-2 text-xs h-8">
                  <Plus className="w-3 h-3 mr-1" /> Add Question
                </Button>
              </div>
            )}
          </div>
          
          {/* 6. Booking Integration */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Booking
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Connect your calendar to let AI naturally schedule meetings.
              </p>
            </div>
            
            {bookingProvider && (
              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cal.com Link
                </label>
                <div className="flex gap-2 relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    value={calBookingLink}
                    onChange={(e) => setCalBookingLink(e.target.value)}
                    placeholder="e.g. cal.com/username/15min"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950/50"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  If provided, the AI will naturally share this link when users express interest in booking a call.
                </p>
              </div>
            )}
          </div>

          {/* 8. Human Handoff */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Human Handoff</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Automatically stop the AI and notify a human under specific conditions.
                </p>
              </div>
              <div 
                onClick={() => setHumanHandoffEnabled(!humanHandoffEnabled)}
                className={cn("w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors shrink-0", humanHandoffEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")}
              >
                <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", humanHandoffEnabled ? "translate-x-5" : "translate-x-0")} />
              </div>
            </div>
            
            {humanHandoffEnabled && (
              <div className="pt-4 space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Handoff Triggers
                </label>
                <div className="space-y-3 mt-2">
                  {["User requests pricing", "User wants a demo", "User asks for a human", "AI confidence is low"].map(trigger => (
                    <label key={trigger} className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={humanHandoffTriggers.includes(trigger)}
                        onChange={() => toggleHandoffTrigger(trigger)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{trigger}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 9. Fallback Message */}
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
              className="min-h-[80px] resize-y bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
            />
          </div>
          
        </div>
      )}
    </div>
  )
}
