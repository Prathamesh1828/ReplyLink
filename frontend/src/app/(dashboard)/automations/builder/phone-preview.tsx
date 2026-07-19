"use client"

import { cn } from "@/lib/utils"
import { Check, Heart, MessageCircle, Send, User, MoreHorizontal, ChevronLeft, Image as ImageIcon } from "lucide-react"

export interface BuilderState {
  automationName: string
  postSelection: string
  keywordType: string
  keywords: string[]
  publicReplyEnabled: boolean
  publicReplies: string[]
  openingMessageEnabled: boolean
  openingMessage: string
  buttonLabel: string
  askToFollowEnabled: boolean
  askToFollowMessage: string
  profileButtonLabel: string
  imFollowingButtonLabel: string
  finalMessage: string
  finalLink: string
  finalLinkLabel: string
  uploadedImage: string | null
  activeStep: number // 1 to 6
  replyRatio: number
  selectedPostIds: string[]
  automation_type?: string
}

export function PhonePreview({ state }: { state: BuilderState }) {
  return (
    <div className="w-[320px] h-[650px] bg-slate-900 rounded-[40px] border-[8px] border-slate-800 relative overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/10 text-white">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-slate-800 rounded-b-2xl z-50 flex items-end justify-center pb-1">
        <div className="w-12 h-1.5 rounded-full bg-black/40" />
      </div>

      {/* Dynamic Screen based on Active Step */}
      {state.activeStep === 1 ? (
        <PostSelectionScreen />
      ) : state.activeStep === 2 || state.activeStep === 3 ? (
        <CommentsScreen state={state} />
      ) : (
        <DMScreen state={state} />
      )}

      {/* Bottom Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-1.5 bg-white/30 rounded-full z-50" />
    </div>
  )
}

function PostSelectionScreen() {
  return (
    <div className="flex-1 bg-slate-950 flex flex-col relative pt-12 pb-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 pb-2 border-b border-white/10">
        <ChevronLeft className="w-6 h-6" />
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold">Posts</span>
          <span className="text-[10px] text-blue-400">username</span>
        </div>
        <div className="w-6 h-6" />
      </div>

      {/* Post */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-700" />
          <span className="text-sm font-medium">username</span>
        </div>
        <MoreHorizontal className="w-5 h-5 text-white/50" />
      </div>
      <div className="w-full aspect-square bg-gradient-to-br from-indigo-900/50 to-purple-900/50 relative flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-400">
            <Check className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-lg">All Posts & Reels</h3>
          <p className="text-sm text-white/60">This automation will work with all your posts and reels.</p>
        </div>
      </div>
      <div className="flex items-center gap-4 p-3 border-b border-white/10">
        <Heart className="w-6 h-6" />
        <MessageCircle className="w-6 h-6" />
        <Send className="w-6 h-6" />
      </div>
      <div className="p-3">
        <p className="text-sm">
          <span className="font-medium mr-2">username</span>
          Automation enabled for all posts and reels 🚀
        </p>
      </div>
    </div>
  )
}

function CommentsScreen({ state }: { state: BuilderState }) {
  const reply = state.publicReplies.length > 0 ? state.publicReplies[0] : "Please check the DM"
  const keyword = state.keywordType === 'any' ? "Awesome!" : (state.keywords[0] || "link")

  return (
    <div className="flex-1 bg-slate-950 flex flex-col relative pt-12 pb-6">
      <div className="w-full h-full opacity-50 pointer-events-none absolute inset-0 pt-12">
        {/* Post background */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-700" />
            <span className="text-sm font-medium">username</span>
          </div>
        </div>
        <div className="w-full aspect-square bg-gradient-to-br from-indigo-900/50 to-purple-900/50" />
      </div>

      {/* Bottom Sheet overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-slate-900 rounded-t-2xl shadow-lg border-t border-white/10 flex flex-col">
        <div className="flex flex-col items-center p-3 border-b border-white/10">
          <div className="w-10 h-1 rounded-full bg-white/20 mb-3" />
          <span className="text-sm font-semibold">Comments</span>
        </div>
        
        <div className="flex-1 p-4 space-y-6 overflow-hidden">
          {/* User Comment */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">lead_user</span>
                <span className="text-xs text-white/50">now</span>
              </div>
              <p className="text-sm mt-0.5">{keyword}</p>
              <span className="text-xs text-white/50 mt-1 block">Reply</span>
              
              {/* Automated Reply */}
              {state.publicReplyEnabled && (
                <div className="flex gap-3 mt-4">
                  <div className="w-6 h-6 rounded-full bg-slate-700 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">username</span>
                      <span className="text-xs text-white/50">now</span>
                    </div>
                    <p className="text-sm mt-0.5">{reply}</p>
                    <span className="text-xs text-white/50 mt-1 block">Reply</span>
                  </div>
                  <Heart className="w-3 h-3 text-white/30" />
                </div>
              )}
            </div>
            <Heart className="w-4 h-4 text-white/30 shrink-0 mt-1" />
          </div>
        </div>
        
        {/* Input area */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-4 mb-3 px-2">
             <span>❤️</span><span>🙌</span><span>🔥</span><span>👏</span><span>😢</span><span>😍</span><span>😮</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2">
            <div className="w-7 h-7 rounded-full bg-slate-700" />
            <span className="text-sm text-white/50 flex-1">Add a comment for lead_user</span>
            <span className="text-sm text-blue-400 font-medium">Post</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DMScreen({ state }: { state: BuilderState }) {
  return (
    <div className="flex-1 bg-slate-950 flex flex-col relative pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
        <ChevronLeft className="w-6 h-6" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-700" />
          <span className="text-sm font-semibold">username</span>
        </div>
        <div className="flex items-center gap-4">
          <User className="w-5 h-5" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Opening Message */}
        {state.openingMessageEnabled && (
          <div className="flex flex-col items-end gap-2">
            <div className="bg-slate-800 p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
              {state.openingMessage || "..."}
            </div>
            {state.buttonLabel && (
              <div className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-medium">
                {state.buttonLabel}
              </div>
            )}
          </div>
        )}

        {/* User Clicks Button (Simulated) */}
        {state.openingMessageEnabled && state.activeStep > 4 && (
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 shrink-0" />
              <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-sm text-sm">
                {state.buttonLabel}
              </div>
            </div>
          </div>
        )}

        {/* Ask to Follow */}
        {state.askToFollowEnabled && state.activeStep >= 5 && (
          <div className="flex flex-col items-end gap-2">
            <div className="bg-slate-800 p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
              {state.askToFollowMessage || "..."}
            </div>
            <div className="flex flex-col gap-1 w-[85%]">
               <div className="bg-slate-800 px-4 py-2 rounded-xl text-sm font-medium text-center text-white/80 border border-white/10">
                 {state.profileButtonLabel}
               </div>
               <div className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-medium text-center">
                 {state.imFollowingButtonLabel}
               </div>
            </div>
          </div>
        )}

        {/* User says I'm following */}
        {state.askToFollowEnabled && state.activeStep > 5 && (
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 shrink-0" />
              <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-sm text-sm">
                 {state.imFollowingButtonLabel}
              </div>
            </div>
          </div>
        )}

        {/* Final Compose Message */}
        {state.activeStep >= 6 && (
           <div className="flex flex-col items-end gap-2">
             <div className="bg-slate-800 p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm overflow-hidden">
               {state.uploadedImage && (
                 <img src={state.uploadedImage} alt="Uploaded preview" className="w-full h-auto rounded-lg mb-2 object-cover max-h-[150px]" />
               )}
               {state.finalMessage || "..."}
             </div>
             {state.finalLink && (
               <a 
                 href={state.finalLink.startsWith('http') ? state.finalLink : `https://${state.finalLink}`} 
                 target="_blank"
                 className="bg-slate-800 px-6 py-2 rounded-xl text-sm font-medium border border-white/10"
               >
                 {state.finalLinkLabel || "link"}
               </a>
             )}
           </div>
        )}

      </div>

      {/* Input bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 bg-slate-900 border border-white/10 rounded-full px-4 py-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
             <Image className="w-3 h-3" />
          </div>
          <span className="text-sm text-white/40 flex-1">Message...</span>
          <MessageCircle className="w-5 h-5 text-white/40" />
        </div>
      </div>
    </div>
  )
}

function Image(props: any) {
  return <ImageIcon {...props} />
}
