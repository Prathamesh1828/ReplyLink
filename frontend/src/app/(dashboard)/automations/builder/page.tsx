"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, X, Plus, Sparkles, MessageCircle, PlusCircle, MessagesSquare, Info, Image as ImageIcon, Link as LinkIcon, Smile, Trash2, Edit2, Check, ExternalLink, Loader2, Heart, AlertTriangle } from "lucide-react"
import { Instagram } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import EmojiPicker from "emoji-picker-react"
import { PhonePreview, BuilderState } from "./phone-preview"
import { cn } from "@/lib/utils"

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className={cn(
        "w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors shrink-0",
        checked ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"
      )}
    >
      <div className={cn(
        "w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
        checked ? "translate-x-5" : "translate-x-0"
      )} />
    </div>
  )
}

function Slider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null)
  
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    onChange(Math.round(percent * 100))
  }

  return (
    <div className="py-4">
      <div 
        ref={trackRef}
        className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full relative cursor-pointer"
        onMouseDown={(e) => {
          handleDrag(e)
          const onMouseMove = (ev: MouseEvent) => handleDrag(ev as any)
          const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
          }
          window.addEventListener('mousemove', onMouseMove)
          window.addEventListener('mouseup', onMouseUp)
        }}
      >
        <div className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full" style={{ width: `${value}%` }} />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-sm cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{ left: `calc(${value}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

const getTemplateDetails = (type: string | undefined) => {
  const safeType = type || 'auto_dm_comments';
  switch (safeType) {
    case 'auto_dm_comments':
      return { Icon: MessageCircle, bgClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400", name: "Auto-DM Links from Comments" };
    case 'story_reply':
    case 'auto_reply_story':
      return { Icon: PlusCircle, bgClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", name: "Auto-Respond to Story Replies" };
    case 'dm_reply':
    case 'auto_reply_dm':
      return { Icon: MessagesSquare, bgClass: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400", name: "Auto-Respond to DMs" };
    default:
      return { Icon: MessageCircle, bgClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400", name: "Auto-DM Links from Comments" };
  }
};

export default function AutomationBuilderPage() {
  const router = useRouter()
  
  const [state, setState] = useState<BuilderState>({
    automationName: "New Automation",
    postSelection: "all",
    keywordType: "specific",
    keywords: [],
    publicReplyEnabled: false,
    publicReplies: [
      "Please check the DM",
      "Thanks! Please see DM",
      "Sorted! Please check your DM"
    ],
    openingMessageEnabled: false,
    openingMessage: "Hey there! Thank you so much for your interest 🤩 I'm super glad you're here! ✨ Just click below and I'll send you the details in a sec!",
    buttonLabel: "Send me the details",
    askToFollowEnabled: false,
    askToFollowMessage: "Oh no! It appears that you aren't following me 👀. If you would go to my profile and click the follow button, it would mean a lot. After completing that, you will receive the details ✨ when you click the \"I'm following\" button below.",
    profileButtonLabel: "Visit Profile",
    imFollowingButtonLabel: "I'm following ✅",
    finalMessage: "Here is the link as promised! 👇",
    finalLink: "",
    finalLinkLabel: "",
    uploadedImage: null,
    activeStep: 1,
    replyRatio: 75,
    selectedPostIds: [],
  })

  const [editingName, setEditingName] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")
  
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [tempLinkLabel, setTempLinkLabel] = useState("")
  const [tempLinkUrl, setTempLinkUrl] = useState("")
  
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [tempName, setTempName] = useState("")
  const [nameError, setNameError] = useState(false)

  const [isLimitReached, setIsLimitReached] = useState(false)
  const [isLoadingCheck, setIsLoadingCheck] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    const type = params.get('type')
    
    if (id) {
      setIsLoadingCheck(false)
      fetch(`http://127.0.0.1:8000/api/automations/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.config) {
            setState({
              ...data.config,
              automation_type: data.automation_type,
              automationName: data.name
            })
          }
        })
        .catch(err => console.error("Failed to load automation:", err))
    } else {
      if (type) {
        updateState({ automation_type: type })
      }
      
      // Check limits before allowing creation
      fetch("http://127.0.0.1:8000/api/automations/")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length >= 5) {
            setIsLimitReached(true)
          } else {
            setIsNameModalOpen(true)
          }
          setIsLoadingCheck(false)
        })
        .catch(err => {
          console.error("Failed to check limits", err)
          setIsNameModalOpen(true)
          setIsLoadingCheck(false)
        })
    }
  }, [])
  
  type EmojiTarget = { type: 'publicReply', index: number } | { type: 'openingMessage' } | { type: 'finalMessage' } | { type: 'askToFollowMessage' } | { type: 'profileButtonLabel' } | { type: 'imFollowingButtonLabel' } | { type: 'buttonLabel' } | null
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<EmojiTarget>(null)

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleGlobalClick = () => setActiveEmojiPicker(null)
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [])

  const updateState = (updates: Partial<BuilderState>) => {
    setState(s => ({ ...s, ...updates }))
  }

  const uploadImageToServer = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('http://127.0.0.1:8000/api/automations/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        updateState({ uploadedImage: data.url });
      }
    } catch (err) {
      console.error("Failed to upload image", err);
    }
  }

  const [media, setMedia] = useState<any[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)

  useEffect(() => {
    if (state.postSelection === 'manual' && media.length === 0 && !isLoadingMedia) {
      setIsLoadingMedia(true)
      const endpoint = state.automation_type === 'auto_reply_story' 
        ? 'http://127.0.0.1:8000/api/auth/meta/stories'
        : 'http://127.0.0.1:8000/api/auth/meta/media'
        
      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          if (data && data.media) {
            setMedia(data.media)
          }
        })
        .catch(err => console.error("Failed to load media:", err))
        .finally(() => setIsLoadingMedia(false))
    }
  }, [state.postSelection, state.automation_type])
  const [isSaving, setIsSaving] = useState(false)

  const saveAutomation = async () => {
    setIsSaving(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      
      const method = id ? 'PUT' : 'POST'
      const url = id 
        ? `http://127.0.0.1:8000/api/automations/${id}`
        : 'http://127.0.0.1:8000/api/automations/'

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.automationName,
          automation_type: state.automation_type || 'dm_reply',
          status: 'Active',
          config: state,
          active: true
        })
      })
      if (res.ok) {
        router.push("/automations")
      } else {
        console.error("Failed to save automation")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const getStepNumber = (stepId: number) => {
    let num = 1;
    const isDm = state.automation_type === 'dm_reply' || state.automation_type === 'auto_reply_dm';
    const isStory = state.automation_type === 'auto_reply_story';
    
    if (stepId === 1) return 1;
    if (!isDm) num++;
    
    if (stepId === 2) return num;
    num++;
    
    if (stepId === 3) return num;
    if (!isStory && !isDm) num++;
    
    if (stepId === 4) return num;
    num++;
    
    if (stepId === 5) return num;
    num++;
    
    return num;
  }

  return (
    <>
      {isLoadingCheck ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : isLimitReached ? (
        <div className="flex flex-col h-[50vh] items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Free Tier Limit Reached</h2>
          <p className="text-muted-foreground max-w-md pb-4">
            You have reached the maximum number of automations (5) allowed on your current plan. Please upgrade to create more automations.
          </p>
          <Button onClick={() => router.back()} className="bg-indigo-600 hover:bg-indigo-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      ) : (
    <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden -mx-6 -mt-6">
      
      {/* LEFT COLUMN: Configuration Form */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-slate-50/50 dark:bg-background pb-32">
        <div className="max-w-2xl mx-auto p-8 space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/automations")} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  Create New Automation
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Template: 
                  <span className={cn("px-2 py-0.5 rounded-full flex items-center gap-1 font-medium", getTemplateDetails(state.automation_type).bgClass)}>
                    {(() => {
                      const { Icon, name } = getTemplateDetails(state.automation_type);
                      return (
                        <>
                          <Icon className="w-3.5 h-3.5" /> {name}
                        </>
                      );
                    })()}
                  </span>
                </div>
              </div>
            </div>
            
            <Button onClick={saveAutomation} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Publish Automation
            </Button>
          </div>

          {/* Name Field */}
          <div className="bg-card border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Automation Name:</span>
              {editingName ? (
                <div className="flex items-center gap-2">
                   <Input 
                     autoFocus
                     value={state.automationName}
                     onChange={e => updateState({ automationName: e.target.value })}
                     className="h-8 py-1"
                     onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                   />
                   <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingName(false)}>
                     <Check className="w-4 h-4 text-green-600" />
                   </Button>
                </div>
              ) : (
                <span className="font-medium text-muted-foreground">{state.automationName}</span>
              )}
            </div>
            {!editingName && (
              <Button size="icon" variant="ghost" onClick={() => setEditingName(true)}>
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
          </div>

          {/* STEP 1 */}
          {state.automation_type !== 'dm_reply' && state.automation_type !== 'auto_reply_dm' && (
          <div 
            className={cn("bg-card border rounded-xl shadow-sm overflow-hidden transition-all duration-300", state.activeStep === 1 ? "ring-2 ring-indigo-500 border-transparent" : "opacity-80 hover:opacity-100")}
            onClick={() => updateState({ activeStep: 1 })}
          >
            <div className="p-4 border-b bg-slate-50/50 dark:bg-muted/20 flex gap-3">
               <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{getStepNumber(1)}</div>
               <div>
                 <h3 className="font-semibold text-foreground">
                   {state.automation_type === 'auto_reply_story' ? "Story Selection" : "Select Post or Reel"}
                 </h3>
                 <p className="text-sm text-muted-foreground">
                   {state.automation_type === 'auto_reply_story' 
                     ? "This automation runs on replies to your active Instagram Stories" 
                     : "Choose which posts or reels will trigger this automation"}
                 </p>
               </div>
            </div>
            <div className="p-4 space-y-3">
               {['manual', 'all', 'next'].map(opt => (
                 <div 
                   key={opt}
                   onClick={(e) => { e.stopPropagation(); updateState({ postSelection: opt, activeStep: 1 }) }}
                   className={cn(
                     "border rounded-lg p-4 cursor-pointer transition-all",
                     state.postSelection === opt ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5 ring-1 ring-indigo-500" : "hover:border-slate-300"
                   )}
                 >
                   <div className="flex items-center gap-3">
                     <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", state.postSelection === opt ? "border-indigo-600" : "border-slate-300")}>
                        {state.postSelection === opt && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                     </div>
                     <span className="font-medium text-sm">
                       {opt === 'manual' 
                         ? (state.automation_type === 'auto_reply_story' ? 'Manually select story' : 'Manually select post or reel') 
                         : opt === 'all' 
                           ? (state.automation_type === 'auto_reply_story' ? 'All active stories' : 'All posts or reels') 
                           : (state.automation_type === 'auto_reply_story' ? 'Next story' : 'Next post or reel')}
                     </span>
                   </div>
                   {opt === 'all' && state.postSelection === 'all' && (
                     <p className="text-xs text-muted-foreground mt-2 ml-7">
                       {state.automation_type === 'auto_reply_story' ? 'This automation will work with all your active stories.' : 'This automation will work with all your posts and reels.'}
                     </p>
                   )}
                   {opt === 'manual' && state.postSelection === 'manual' && (
                     <div className="mt-4 ml-7">
                       {isLoadingMedia ? (
                         <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                           <Loader2 className="w-4 h-4 animate-spin" /> Fetching your Instagram posts...
                         </div>
                       ) : media.length > 0 ? (
                         <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                           {media.map((item: any) => {
                             const isSelected = state.selectedPostIds.includes(item.id)
                             return (
                               <div 
                                 key={item.id}
                                 onClick={(e) => {
                                   e.stopPropagation()
                                   const newIds = isSelected 
                                     ? state.selectedPostIds.filter(id => id !== item.id)
                                     : [...state.selectedPostIds, item.id]
                                   updateState({ selectedPostIds: newIds })
                                 }}
                                 className={cn(
                                   "relative aspect-square rounded-md overflow-hidden cursor-pointer group border-2 transition-all",
                                   isSelected ? "border-indigo-600" : "border-transparent hover:border-indigo-300"
                                 )}
                               >
                                 <img 
                                   src={item.thumbnail_url || item.media_url} 
                                   alt={item.caption || "Instagram Post"} 
                                   className="w-full h-full object-cover"
                                 />
                                 <div className="absolute top-1 right-1 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white font-medium">
                                   {item.media_type === 'VIDEO' ? '🎥' : item.media_type === 'CAROUSEL_ALBUM' ? '📚' : '🖼'}
                                 </div>
                                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6 flex items-center gap-3 text-xs text-white font-medium">
                                   {state.automation_type === 'auto_reply_story' ? (
                                     <div className="flex w-full justify-between items-center text-[10.5px] font-semibold tracking-wide">
                                       <span>{new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                       <span>{new Date(item.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                     </div>
                                   ) : (
                                     <>
                                       <div className="flex items-center gap-1">
                                         <Heart className="w-3.5 h-3.5" />
                                         {item.like_count || 0}
                                       </div>
                                       <div className="flex items-center gap-1">
                                         <MessageCircle className="w-3.5 h-3.5" />
                                         {item.comments_count || 0}
                                       </div>
                                     </>
                                   )}
                                 </div>
                                 {isSelected && (
                                   <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center backdrop-blur-[1px]">
                                     <div className="bg-indigo-600 text-white rounded-full p-1 shadow-md">
                                       <Check className="w-4 h-4" />
                                     </div>
                                   </div>
                                 )}
                               </div>
                             )
                           })}
                         </div>
                       ) : (
                         <div className="text-sm text-muted-foreground py-4 bg-slate-50 dark:bg-slate-900 rounded-md px-3 border border-dashed">
                           No recent posts found on your connected Instagram account.
                         </div>
                       )}
                     </div>
                   )}
                 </div>
                 ))}
            </div>
          </div>

          )}

          {/* STEP 2 */}
          <div 
            className={cn("bg-card border rounded-xl shadow-sm overflow-hidden transition-all duration-300", state.activeStep === 2 ? "ring-2 ring-indigo-500 border-transparent" : "opacity-80 hover:opacity-100")}
            onClick={() => updateState({ activeStep: 2 })}
          >
            <div className="p-4 border-b bg-slate-50/50 dark:bg-muted/20 flex gap-3">
               <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{getStepNumber(2)}</div>
               <div>
                 <h3 className="font-semibold text-foreground">Define Keywords</h3>
                 <p className="text-sm text-muted-foreground">Add keywords that will trigger this automation when found in a {state.automation_type === 'dm_reply' || state.automation_type === 'auto_reply_dm' ? 'DM' : 'comment'}</p>
               </div>
            </div>
            <div className="p-4 space-y-4">
               <div 
                 onClick={() => updateState({ keywordType: 'specific' })}
                 className={cn("border rounded-lg p-4 cursor-pointer transition-all", state.keywordType === 'specific' ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5 ring-1 ring-indigo-500" : "")}
               >
                 <div className="flex items-center gap-3 mb-4">
                   <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", state.keywordType === 'specific' ? "border-indigo-600" : "border-slate-300")}>
                      {state.keywordType === 'specific' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                   </div>
                   <span className="font-medium text-sm">Specific keyword or reaction</span>
                 </div>
                 
                 {state.keywordType === 'specific' && (
                   <div className="ml-7 space-y-4">
                     <div className="flex flex-wrap items-center gap-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 shadow-sm">
                       {state.keywords.map(kw => (
                         <div key={kw} className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2 py-1 rounded-md text-sm flex items-center gap-1.5 font-medium">
                           {kw}
                           <X 
                             className="w-3.5 h-3.5 cursor-pointer hover:text-indigo-900 dark:hover:text-indigo-100" 
                             onClick={() => updateState({ keywords: state.keywords.filter(k => k !== kw) })}
                           />
                         </div>
                       ))}
                       <input 
                         placeholder={state.keywords.length === 0 ? "Enter keyword that will trigger the automations" : ""}
                         value={newKeyword}
                         onChange={e => setNewKeyword(e.target.value)}
                         className="flex-1 bg-transparent min-w-[120px] outline-none placeholder:text-muted-foreground"
                         onKeyDown={e => {
                           if (e.key === 'Enter' && newKeyword.trim()) {
                             e.preventDefault()
                             if (!state.keywords.includes(newKeyword.trim())) {
                               updateState({ keywords: [...state.keywords, newKeyword.trim()] })
                             }
                             setNewKeyword("")
                           } else if (e.key === 'Backspace' && newKeyword === '' && state.keywords.length > 0) {
                             updateState({ keywords: state.keywords.slice(0, -1) })
                           }
                         }}
                       />
                     </div>
                     <p className="text-xs text-muted-foreground mt-2">Hint: Type a keyword and press Enter, or select from the examples below.</p>
                     
                     <div className="flex items-center gap-2 text-sm pt-2">
                       <span className="text-muted-foreground">Examples:</span>
                       {["link", "buy", "shop", "promo"].map(example => (
                         <div 
                           key={example} 
                           onClick={() => {
                             if (!state.keywords.includes(example)) {
                               updateState({ keywords: [...state.keywords, example] })
                             }
                           }}
                           className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors text-muted-foreground hover:text-foreground border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                         >
                           {example}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>

               <div 
                 onClick={() => updateState({ keywordType: 'any' })}
                 className={cn("border rounded-lg p-4 cursor-pointer transition-all", state.keywordType === 'any' ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5 ring-1 ring-indigo-500" : "")}
               >
                 <div className="flex items-center gap-3">
                   <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", state.keywordType === 'any' ? "border-indigo-600" : "border-slate-300")}>
                      {state.keywordType === 'any' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                   </div>
                   <span className="font-medium text-sm">Any word or comment</span>
                 </div>
               </div>
            </div>
          </div>

          {/* STEP 3 (Story React) */}
          {state.automation_type === 'auto_reply_story' && (
            <div 
              className={cn("bg-card border rounded-xl shadow-sm overflow-hidden transition-all duration-300", state.activeStep === 3 ? "ring-2 ring-indigo-500 border-transparent" : "opacity-80 hover:opacity-100")}
              onClick={() => updateState({ activeStep: 3 })}
            >
              <div className="p-4 flex gap-3 items-center justify-between">
                 <div className="flex gap-3 items-center">
                   <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{getStepNumber(3)}</div>
                   <div className="flex flex-col">
                     <h3 className="font-semibold text-foreground flex items-center gap-1.5">React story replies with ❤️</h3>
                     <p className="text-[13px] text-muted-foreground mt-0.5">Automatically react to story replies with a heart emoji</p>
                   </div>
                 </div>
                 <Toggle checked={state.reactToStoryReply || false} onChange={v => updateState({ reactToStoryReply: v })} />
              </div>
            </div>
          )}

          {/* STEP 3 (Comments React) */}
          {state.automation_type !== 'auto_reply_story' && state.automation_type !== 'dm_reply' && state.automation_type !== 'auto_reply_dm' && (
          <div 
            className={cn("bg-card border rounded-xl shadow-sm overflow-hidden transition-all duration-300", state.activeStep === 3 ? "ring-2 ring-indigo-500 border-transparent" : "opacity-80 hover:opacity-100")}
            onClick={() => updateState({ activeStep: 3 })}
          >
            <div className="p-4 border-b bg-slate-50/50 dark:bg-muted/20 flex gap-3 items-start justify-between">
               <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{getStepNumber(3)}</div>
                 <div>
                   <h3 className="font-semibold text-foreground flex items-center gap-2">Public reply to comments <Info className="w-4 h-4 text-muted-foreground"/></h3>
                   <p className="text-sm text-muted-foreground">Configure how the automation will respond to comments</p>
                 </div>
               </div>
               <Toggle checked={state.publicReplyEnabled} onChange={v => updateState({ publicReplyEnabled: v })} />
            </div>
            
            {state.publicReplyEnabled && (
              <div className="p-4 space-y-4">
                 <div className="space-y-3 relative">
                    {state.publicReplies.map((reply, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input 
                            value={reply}
                            onChange={(e) => {
                              const newArr = [...state.publicReplies]
                              newArr[idx] = e.target.value
                              updateState({ publicReplies: newArr })
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                updateState({ publicReplies: [...state.publicReplies, ""] })
                              }
                            }}
                            className="pr-10 rounded-lg dark:bg-slate-900/50"
                            placeholder="Type a reply..."
                          />
                          <Smile 
                            className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEmojiPicker(activeEmojiPicker?.type === 'publicReply' && activeEmojiPicker.index === idx ? null : { type: 'publicReply', index: idx })
                            }}
                          />
                          {activeEmojiPicker?.type === 'publicReply' && activeEmojiPicker.index === idx && (
                            <div className="absolute right-0 top-full mt-2 z-50 shadow-xl" onClick={e => e.stopPropagation()}>
                              <EmojiPicker 
                                onEmojiClick={(emojiData) => {
                                  const newArr = [...state.publicReplies]
                                  newArr[idx] = reply + emojiData.emoji
                                  updateState({ publicReplies: newArr })
                                }} 
                              />
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="shrink-0 text-muted-foreground hover:text-destructive rounded-lg border-input"
                          onClick={() => {
                            updateState({ publicReplies: state.publicReplies.filter((_, i) => i !== idx) })
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full border-dashed rounded-lg bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      onClick={() => updateState({ publicReplies: [...state.publicReplies, ""] })}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Comment Reply
                    </Button>
                 </div>

                 <div className="pt-4 border-t">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="font-medium text-sm">Reply Ratio</span>
                     <Info className="w-4 h-4 text-muted-foreground" />
                   </div>
                   <Slider 
                     value={state.replyRatio}
                     onChange={(v) => updateState({ replyRatio: v })}
                   />
                   <p className="text-xs text-muted-foreground mt-2">Set the percentage of comments that will receive automated replies</p>
                 </div>
              </div>
            )}
          </div>
          )}

          {/* STEP 4 */}
          <div 
            className={cn("bg-card border rounded-xl shadow-sm overflow-hidden transition-all duration-300", state.activeStep === 4 ? "ring-2 ring-indigo-500 border-transparent" : "opacity-80 hover:opacity-100")}
            onClick={() => updateState({ activeStep: 4 })}
          >
            <div className="p-4 border-b bg-slate-50/50 dark:bg-muted/20 flex gap-3 items-start justify-between">
               <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{getStepNumber(4)}</div>
                 <div>
                   <h3 className="font-semibold text-foreground flex items-center gap-2">Opening Message <Info className="w-4 h-4 text-muted-foreground"/></h3>
                   <p className="text-sm text-muted-foreground">This is the first message users see in their DM {state.automation_type === 'dm_reply' || state.automation_type === 'auto_reply_dm' ? 'as an automated response.' : 'after commenting on your post or reel.'}</p>
                 </div>
               </div>
               <Toggle checked={state.openingMessageEnabled} onChange={v => updateState({ openingMessageEnabled: v })} />
            </div>
            
            {state.openingMessageEnabled && (
              <div className="p-4 space-y-4">
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-medium text-sm">Message</span>
                     <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{state.openingMessage.length} / 1000</span>
                   </div>
                   <div className="relative">
                     <Textarea 
                       value={state.openingMessage}
                       onChange={e => updateState({ openingMessage: e.target.value })}
                       className="min-h-[100px] resize-none pr-10"
                     />
                     <Smile 
                       className="w-4 h-4 absolute right-3 bottom-3 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                       onClick={(e) => {
                         e.stopPropagation();
                         setActiveEmojiPicker(activeEmojiPicker?.type === 'openingMessage' ? null : { type: 'openingMessage' })
                       }}
                     />
                     {activeEmojiPicker?.type === 'openingMessage' && (
                       <div className="absolute right-0 bottom-full mb-2 z-50 shadow-xl" onClick={e => e.stopPropagation()}>
                         <EmojiPicker onEmojiClick={(emojiData) => updateState({ openingMessage: state.openingMessage + emojiData.emoji })} />
                       </div>
                     )}
                   </div>
                 </div>

                 <div>
                   <span className="font-medium text-sm block mb-2">Button label</span>
                     <div className="relative">
                       <Input 
                         value={state.buttonLabel}
                         onChange={e => updateState({ buttonLabel: e.target.value })}
                         className="pr-10"
                       />
                       <Smile 
                         className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                         onClick={(e) => {
                           e.stopPropagation();
                           setActiveEmojiPicker(activeEmojiPicker?.type === 'buttonLabel' ? null : { type: 'buttonLabel' })
                         }}
                       />
                       {activeEmojiPicker?.type === 'buttonLabel' && (
                         <div className="absolute right-0 top-full mt-2 z-50 shadow-xl" onClick={e => e.stopPropagation()}>
                           <EmojiPicker onEmojiClick={(emojiData) => updateState({ buttonLabel: state.buttonLabel + emojiData.emoji })} />
                         </div>
                       )}
                     </div>
                 </div>
              </div>
            )}
          </div>

          {/* STEP 5 */}
          <div 
            className={cn("bg-card border rounded-xl shadow-sm overflow-hidden transition-all duration-300", state.activeStep === 5 ? "ring-2 ring-indigo-500 border-transparent" : "opacity-80 hover:opacity-100")}
            onClick={() => updateState({ activeStep: 5 })}
          >
            <div className="p-4 flex gap-3 items-start justify-between">
               <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-indigo-600/80 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{getStepNumber(5)}</div>
                 <div>
                   <h3 className="font-semibold text-foreground flex items-center gap-2">Ask to follow before sending the details <Info className="w-4 h-4 text-muted-foreground"/></h3>
                   <p className="text-sm text-muted-foreground">Request users to follow your account before sending the details</p>
                 </div>
               </div>
               <Toggle checked={state.askToFollowEnabled} onChange={v => updateState({ askToFollowEnabled: v })} />
            </div>
            
            {state.askToFollowEnabled && (
              <div className="p-4 border-t space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">Message</span>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{state.askToFollowMessage.length} / 1000</span>
                  </div>
                  <div className="relative">
                    <Textarea 
                      value={state.askToFollowMessage}
                      onChange={e => updateState({ askToFollowMessage: e.target.value })}
                      className="min-h-[80px] resize-none pr-10"
                    />
                    <Smile 
                      className="w-4 h-4 absolute right-3 bottom-3 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEmojiPicker(activeEmojiPicker?.type === 'askToFollowMessage' ? null : { type: 'askToFollowMessage' })
                      }}
                    />
                    {activeEmojiPicker?.type === 'askToFollowMessage' && (
                      <div className="absolute right-0 top-full mt-2 z-50 shadow-xl" onClick={e => e.stopPropagation()}>
                        <EmojiPicker onEmojiClick={(emojiData) => updateState({ askToFollowMessage: state.askToFollowMessage + emojiData.emoji })} />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-sm block mb-2">Profile Button</span>
                    <div className="relative">
                      <Input 
                        value={state.profileButtonLabel} 
                        onChange={e => updateState({ profileButtonLabel: e.target.value })} 
                        className="pr-10"
                      />
                      <Smile 
                        className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEmojiPicker(activeEmojiPicker?.type === 'profileButtonLabel' ? null : { type: 'profileButtonLabel' })
                        }}
                      />
                      {activeEmojiPicker?.type === 'profileButtonLabel' && (
                        <div className="absolute right-0 top-full mt-2 z-50 shadow-xl" onClick={e => e.stopPropagation()}>
                          <EmojiPicker onEmojiClick={(emojiData) => updateState({ profileButtonLabel: state.profileButtonLabel + emojiData.emoji })} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-sm block mb-2">Following button</span>
                    <div className="relative">
                      <Input 
                        value={state.imFollowingButtonLabel} 
                        onChange={e => updateState({ imFollowingButtonLabel: e.target.value })} 
                        className="pr-10"
                      />
                      <Smile 
                        className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEmojiPicker(activeEmojiPicker?.type === 'imFollowingButtonLabel' ? null : { type: 'imFollowingButtonLabel' })
                        }}
                      />
                      {activeEmojiPicker?.type === 'imFollowingButtonLabel' && (
                        <div className="absolute right-0 top-full mt-2 z-50 shadow-xl" onClick={e => e.stopPropagation()}>
                          <EmojiPicker onEmojiClick={(emojiData) => updateState({ imFollowingButtonLabel: state.imFollowingButtonLabel + emojiData.emoji })} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 6 */}
          <div 
            className={cn("bg-card border rounded-xl shadow-sm overflow-hidden transition-all duration-300", state.activeStep === 6 ? "ring-2 ring-indigo-500 border-transparent" : "opacity-80 hover:opacity-100")}
            onClick={() => updateState({ activeStep: 6 })}
          >
            <div className="p-4 border-b bg-slate-50/50 dark:bg-muted/20 flex gap-3 items-start justify-between">
               <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{getStepNumber(6)}</div>
                 <div>
                   <h3 className="font-semibold text-foreground flex items-center gap-2">Compose Message</h3>
                   <p className="text-sm text-muted-foreground">Write the message that will be sent to users</p>
                 </div>
               </div>
            </div>
            <div className="p-4 space-y-4">
               <div>
                 <span className="font-medium text-sm block mb-2 text-muted-foreground">Upload an image to include in your message (Optional)</span>
                 <div 
                   className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-muted/20 cursor-pointer transition-colors relative"
                   onDragOver={e => e.preventDefault()}
                   onDrop={e => {
                     e.preventDefault()
                     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                       const file = e.dataTransfer.files[0]
                       if (file.type.startsWith('image/')) {
                         uploadImageToServer(file)
                       }
                     }
                   }}
                   onClick={() => document.getElementById('image-upload-input')?.click()}
                 >
                   <input 
                     type="file" 
                     id="image-upload-input" 
                     className="hidden" 
                     accept="image/png, image/jpeg" 
                     onChange={e => {
                       if (e.target.files && e.target.files[0]) {
                         uploadImageToServer(e.target.files[0])
                       }
                     }} 
                   />
                   {state.uploadedImage ? (
                     <div className="w-full relative group flex items-center justify-center">
                       <img src={state.uploadedImage} alt="Uploaded" className="max-h-[200px] rounded-md object-contain" />
                       <div 
                         className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-900/80 cursor-pointer"
                         onClick={(e) => {
                           e.stopPropagation()
                           updateState({ uploadedImage: null })
                           const input = document.getElementById('image-upload-input') as HTMLInputElement
                           if (input) input.value = ''
                         }}
                       >
                         <Trash2 className="w-4 h-4" />
                       </div>
                     </div>
                   ) : (
                     <>
                       <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                         <ImageIcon className="w-7 h-7 text-muted-foreground" />
                       </div>
                       <span className="text-base font-semibold text-foreground mb-1.5">Click to upload or drag and drop</span>
                       <span className="text-sm text-muted-foreground">PNG, JPG up to 10MB</span>
                     </>
                   )}
                 </div>
               </div>
               
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="font-medium text-sm">Message</span>
                   <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{(state.finalMessage || '').length} / 1000</span>
                 </div>
                 <div className="relative">
                    <Textarea 
                      value={state.finalMessage || ''}
                      onChange={e => updateState({ finalMessage: e.target.value })}
                      className="min-h-[100px] resize-none pr-10"
                    />
                    <Smile 
                      className="w-4 h-4 absolute right-3 bottom-3 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEmojiPicker(activeEmojiPicker?.type === 'finalMessage' ? null : { type: 'finalMessage' })
                      }}
                    />
                    {activeEmojiPicker?.type === 'finalMessage' && (
                      <div className="absolute right-0 bottom-full mb-2 z-50 shadow-xl" onClick={e => e.stopPropagation()}>
                        <EmojiPicker onEmojiClick={(emojiData) => updateState({ finalMessage: state.finalMessage + emojiData.emoji })} />
                      </div>
                    )}
                 </div>
                 
                 <div>
                   {state.finalLink ? (
                     <div className="border rounded-lg p-3 flex justify-between items-center bg-background shadow-sm mt-2">
                       <div className="flex flex-col gap-1">
                         <a href={state.finalLink.startsWith('http') ? state.finalLink : `https://${state.finalLink}`} target="_blank" className="flex items-center gap-1.5 font-medium text-sm hover:underline cursor-pointer">
                           {state.finalLinkLabel || 'link'} <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                         </a>
                         <a href={state.finalLink.startsWith('http') ? state.finalLink : `https://${state.finalLink}`} target="_blank" className="text-xs text-muted-foreground hover:underline">
                           {state.finalLink}
                         </a>
                       </div>
                       <div className="flex items-center gap-3">
                         <Edit2 
                           className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                           onClick={() => {
                             setTempLinkLabel(state.finalLinkLabel || "link")
                             setTempLinkUrl(state.finalLink)
                             setIsLinkModalOpen(true)
                           }}
                         />
                         <Trash2 
                           className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-destructive transition-colors" 
                           onClick={() => updateState({ finalLink: '', finalLinkLabel: '' })}
                         />
                       </div>
                     </div>
                   ) : (
                     <Button 
                       variant="outline" 
                       className="w-full mt-2 rounded-lg bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50"
                       onClick={() => {
                         setTempLinkLabel("")
                         setTempLinkUrl("")
                         setIsLinkModalOpen(true)
                       }}
                     >
                       <Plus className="w-4 h-4 mr-2" /> Add Link
                     </Button>
                   )}
                 </div>
                 
                 <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                   <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
                       <DialogTitle>Add Link</DialogTitle>
                       <p className="text-sm text-muted-foreground mt-1">Enter a button label and link URL to add a new link.</p>
                     </DialogHeader>
                     <div className="grid gap-4 py-4">
                       <div className="flex flex-col gap-2">
                         <label className="text-sm font-medium">Button Label <span className="text-destructive">*</span></label>
                         <Input 
                           value={tempLinkLabel}
                           onChange={e => setTempLinkLabel(e.target.value)}
                           onKeyDown={e => {
                             if (e.key === 'Enter' && tempLinkLabel.trim() && tempLinkUrl.trim()) {
                               updateState({ finalLink: tempLinkUrl, finalLinkLabel: tempLinkLabel });
                               setIsLinkModalOpen(false);
                             }
                           }}
                           placeholder="e.g., Visit Website" 
                         />
                       </div>
                       <div className="flex flex-col gap-2">
                         <label className="text-sm font-medium">Button Link <span className="text-destructive">*</span></label>
                         <Input 
                           value={tempLinkUrl}
                           onChange={e => setTempLinkUrl(e.target.value)}
                           onKeyDown={e => {
                             if (e.key === 'Enter' && tempLinkLabel.trim() && tempLinkUrl.trim()) {
                               updateState({ finalLink: tempLinkUrl, finalLinkLabel: tempLinkLabel });
                               setIsLinkModalOpen(false);
                             }
                           }}
                           placeholder="e.g., https://example.com" 
                         />
                       </div>
                     </div>
                     <DialogFooter>
                       <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>Cancel</Button>
                       <Button 
                         className="bg-indigo-500 hover:bg-indigo-600 text-white" 
                         disabled={!tempLinkLabel.trim() || !tempLinkUrl.trim()}
                         onClick={() => {
                           updateState({ finalLink: tempLinkUrl, finalLinkLabel: tempLinkLabel })
                           setIsLinkModalOpen(false)
                         }}
                       >
                         Save
                       </Button>
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
               </div>
            </div>
          </div>

        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 lg:right-[400px] xl:right-[500px] bg-background/80 backdrop-blur-md border-t p-4 z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
           <div className="max-w-2xl mx-auto flex gap-4">
             <Button 
               variant="outline" 
               className="flex-1 bg-background hover:bg-slate-50"
               onClick={async () => {
                 const params = new URLSearchParams(window.location.search)
                 const editId = params.get('id')
                 
                 const payload = {
                   name: state.automationName || "link",
                   automation_type: state.automation_type || "auto_dm_comments",
                   status: "Draft",
                   config: state,
                   active: false
                 }
                 
                 try {
                   const method = editId ? "PUT" : "POST"
                   const url = editId 
                     ? `http://127.0.0.1:8000/api/automations/${editId}` 
                     : `http://127.0.0.1:8000/api/automations/`
                     
                   const res = await fetch(url, {
                     method,
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify(payload)
                   })
                   if (res.ok) router.push('/automations')
                 } catch (err) {
                   console.error("Failed to save automation", err)
                 }
               }}
             >
               Save as Draft
             </Button>
             <Button 
               className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
               onClick={async () => {
                 const params = new URLSearchParams(window.location.search)
                 const editId = params.get('id')
                 
                 const payload = {
                   name: state.automationName || "link",
                   automation_type: state.automation_type || "auto_dm_comments",
                   status: "Active",
                   config: state,
                   active: true
                 }
                 
                 try {
                   const method = editId ? "PUT" : "POST"
                   const url = editId 
                     ? `http://127.0.0.1:8000/api/automations/${editId}` 
                     : `http://127.0.0.1:8000/api/automations/`
                     
                   const res = await fetch(url, {
                     method,
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify(payload)
                   })
                   if (res.ok) router.push('/automations')
                 } catch (err) {
                   console.error("Failed to save automation", err)
                 }
               }}
             >
               <Play className="w-4 h-4 mr-2" /> Activate
             </Button>
           </div>
         </div>
      </div>

      {/* RIGHT COLUMN: Phone Preview */}
      <div className="hidden lg:flex w-[400px] xl:w-[500px] bg-slate-100/50 dark:bg-[#090E17] border-l items-center justify-center relative p-4 xl:p-8 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Scaled Container for Phone Preview */}
        <div className="transform scale-[0.8] xl:scale-[0.85] origin-center transition-transform">
          <PhonePreview state={state} media={media} newKeyword={newKeyword} />
        </div>
      </div>

      <Dialog open={isNameModalOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <DialogTitle className="text-xl">Name Your Automation</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[15px] text-muted-foreground mb-6">
              Give your automation a descriptive name to easily identify it later.
            </p>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2.5">Automation Name</label>
              <input
                type="text"
                placeholder="e.g., Message Responder"
                value={tempName}
                onChange={(e) => {
                  setTempName(e.target.value)
                  if (e.target.value.trim()) setNameError(false)
                }}
                maxLength={50}
                className={cn(
                  "flex h-11 w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
                  nameError ? "border-red-500 focus-visible:ring-red-500" : "border-input"
                )}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (!tempName.trim()) {
                      setNameError(true)
                      return
                    }
                    updateState({ automationName: tempName.trim() })
                    setIsNameModalOpen(false)
                  }
                }}
              />
              <div className="flex items-center justify-between mt-1.5">
                {nameError ? (
                  <span className="text-xs font-medium text-red-500 flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Please enter an automation name
                  </span>
                ) : (
                  <span />
                )}
                <span className={cn("text-xs", nameError ? "text-red-500" : "text-muted-foreground")}>
                  {tempName.length}/50 characters
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push('/templates')}>
              Cancel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white" 
              onClick={() => {
                if (!tempName.trim()) {
                  setNameError(true)
                  return
                }
                updateState({ automationName: tempName.trim() })
                setIsNameModalOpen(false)
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    )}
    </>
  )
}
