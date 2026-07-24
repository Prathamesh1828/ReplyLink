"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { Check, Heart, MessageCircle, Send, User, MoreHorizontal, ChevronLeft, Image as ImageIcon, Phone, Video, Camera, Mic, Smile, PlusCircle, Home, PlaySquare, Navigation, Search, Bookmark } from "lucide-react"

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
  reactToStoryReply?: boolean
  activeStep: number // 1 to 6
  replyRatio: number
  selectedPostIds: string[]
  automation_type?: string
}
function getRelativeTime(timestamp?: string) {
  if (!timestamp) return '1d';
  const postDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - postDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks > 0) return `${diffWeeks}w`;
  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMins > 0) return `${diffMins}m`;
  return 'now';
}

export function PhonePreview({ state, media = [], newKeyword = "" }: { state: BuilderState, media?: any[], newKeyword?: string }) {
  const [account, setAccount] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/accounts/`, {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const accs = await res.json()
          if (accs && accs.length > 0) {
            const active = accs.find((a: any) => a.active) || accs[0]
            if (active) {
               try {
                 const profRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/accounts/${active.id}/profile`, {
                   headers: { "Authorization": `Bearer ${session.access_token}` }
                 })
                 if (profRes.ok) {
                   const profile = await profRes.json()
                   setAccount({ ...active, ...profile })
                 } else {
                   setAccount(active)
                 }
               } catch (e) {
                 setAccount(active)
               }
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch account for phone preview:", e)
      }
    }
    fetchAccount()
  }, [])

  return (
    <div className="w-[320px] h-[650px] bg-slate-900 rounded-[40px] border-[8px] border-slate-800 relative overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/10 text-white">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-slate-800 rounded-b-2xl z-50 flex items-end justify-center pb-1">
        <div className="w-12 h-1.5 rounded-full bg-black/40" />
      </div>

      {/* iOS Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-10 z-40 flex items-center justify-between px-6 pointer-events-none">
        <span className="text-[13px] font-semibold tracking-tight text-white mt-1">{currentTime}</span>
        <div className="flex items-center gap-1.5 mt-1">
          {/* Cellular */}
          <svg width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="7.33331" width="3" height="3.66667" rx="0.5" fill="white"/>
            <rect x="4.66699" y="5.5" width="3" height="5.5" rx="0.5" fill="white"/>
            <rect x="9.33301" y="2.75" width="3" height="8.25" rx="0.5" fill="white"/>
            <rect x="14" width="3" height="11" rx="0.5" fill="white"/>
          </svg>
          {/* Wifi */}
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.394 2.51515C13.5135 0.707071 10.8711 0 8 0C5.12888 0 2.48648 0.707071 0.60604 2.51515C0.347571 2.76263 0.35414 3.16162 0.620402 3.40067L1.92131 4.56902C2.17646 4.79798 2.56475 4.77609 2.79373 4.5202C4.19539 2.94613 6.13842 2.16498 8 2.16498C9.86158 2.16498 11.8046 2.94613 13.2063 4.5202C13.4352 4.77609 13.8235 4.79798 14.0787 4.56902L15.3796 3.40067C15.6459 3.16162 15.6524 2.76263 15.394 2.51515ZM12.1818 5.72727C11.1219 4.66667 9.61053 4.14815 8 4.14815C6.38947 4.14815 4.87811 4.66667 3.81822 5.72727C3.55171 5.98064 3.55627 6.38923 3.82907 6.63468L5.13289 7.80808C5.38531 8.03535 5.77259 8.01684 6.00282 7.76599C6.55026 7.16902 7.28825 6.84848 8 6.84848C8.71175 6.84848 9.44974 7.16902 9.99718 7.76599C10.2274 8.01684 10.6147 8.03535 10.8671 7.80808L12.1709 6.63468C12.4437 6.38923 12.4483 5.98064 12.1818 5.72727ZM8 11C8.89543 11 9.62121 10.2742 9.62121 9.37879C9.62121 8.48336 8.89543 7.75758 8 7.75758C7.10457 7.75758 6.37879 8.48336 6.37879 9.37879C6.37879 10.2742 7.10457 11 8 11Z" fill="white"/>
          </svg>
          {/* Battery */}
          <div className="w-[22px] h-[11px] rounded-[3px] border border-white/60 p-[1px] relative flex items-center ml-0.5">
             <div className="bg-white h-full w-[85%] rounded-[1px]" />
             <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[4px] bg-white/60 rounded-r-sm" />
          </div>
        </div>
      </div>

      {/* Dynamic Screen based on Active Step */}
      {(state.automation_type === 'dm_reply' || state.automation_type === 'auto_reply_dm') ? (
        <DMScreen state={state} account={account} newKeyword={newKeyword} media={media} />
      ) : state.activeStep === 1 ? (
        <PostSelectionScreen state={state} account={account} media={media} />
      ) : state.activeStep === 3 && state.automation_type !== 'auto_reply_story' ? (
        <CommentsScreen state={state} account={account} media={media} newKeyword={newKeyword} />
      ) : (
        <DMScreen state={state} account={account} newKeyword={newKeyword} media={media} />
      )}

      {/* Bottom Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-1.5 bg-white/30 rounded-full z-50" />
    </div>
  )
}

function PostSelectionScreen({ state, account, media = [] }: { state: BuilderState, account: any, media?: any[] }) {
  const isNoPost = state.postSelection === 'manual' && state.selectedPostIds.length === 0;
  const selectedPost = state.postSelection === 'manual' && state.selectedPostIds.length > 0 && media.length > 0
    ? media.find(m => m.id === state.selectedPostIds[0])
    : null;

  if (state.automation_type === 'auto_reply_story') {
    return (
      <div className="flex-1 bg-gradient-to-b from-[#1a1525] to-[#12131a] flex flex-col relative pt-10 pb-4 min-h-0">
        {/* Story Progress Bar */}
        <div className="px-3 pt-2">
           <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-white w-[75%]" />
           </div>
        </div>

        {/* Story Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <div className="flex items-center gap-2">
            {account?.profile_picture_url ? (
              <img src={account.profile_picture_url} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800" />
            )}
            <span className="text-[14px] font-semibold text-white shadow-sm">{account?.username || "username"}</span>
          </div>
          <div className="w-6 h-6 flex items-center justify-center">
             <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="white"/>
             </svg>
          </div>
        </div>

        {/* Content Area */}
        {selectedPost ? (
           <div className="flex-1 relative bg-black mt-2 min-h-0">
             <img src={selectedPost.media_url || selectedPost.thumbnail_url} className="w-full h-full object-cover" />
           </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {isNoPost ? (
              <div className="flex flex-col items-center justify-center gap-4 mt-6">
                <div className="w-[84px] h-[84px] rounded-full bg-white/5 flex items-center justify-center mb-1">
                  <ImageIcon className="w-10 h-10 text-white/50" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-[19px] tracking-tight text-white">No story selected</h3>
                  <p className="text-[15px] text-blue-100/60 font-medium">Select a story to see the preview.</p>
                </div>
              </div>
            ) : state.postSelection === 'next' ? (
              <div className="flex flex-col items-center justify-center gap-4 mt-6">
                 <div className="w-[84px] h-[84px] rounded-full bg-[#5c4ce5]/20 flex items-center justify-center mb-1">
                   <div className="w-9 h-9 rounded-full border-[2.5px] border-[#a176ff] flex items-center justify-center">
                      <PlusCircle className="w-5 h-5 text-[#a176ff] stroke-[3]" />
                   </div>
                 </div>
                 <div className="flex flex-col gap-2">
                   <h3 className="font-bold text-[19px] text-white">Next Story</h3>
                   <p className="text-[15px] text-blue-100/60 font-medium leading-relaxed">This automation will work with your<br/>next published story.</p>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 mt-6">
                 <div className="w-[84px] h-[84px] rounded-full bg-[#5c4ce5]/20 flex items-center justify-center mb-1">
                   <div className="w-9 h-9 rounded-full border-[2.5px] border-[#a176ff] flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#a176ff] stroke-[3.5]" />
                   </div>
                 </div>
                 <div className="flex flex-col gap-2">
                   <h3 className="font-bold text-[19px] text-white">All Stories</h3>
                   <p className="text-[15px] text-blue-100/60 font-medium leading-relaxed">This automation will work with all of<br/>your stories.</p>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="px-3 pt-4 pb-1">
          <div className="flex items-center gap-4">
             <div className="flex-1 h-[42px] border border-white/20 rounded-full flex items-center px-4 bg-transparent">
               <span className="text-[14px] text-white/60 font-medium tracking-wide">Send message...</span>
             </div>
             <Heart className="w-[26px] h-[26px] text-white shrink-0" />
             <Send className="w-[24px] h-[24px] text-white shrink-0 transform -rotate-12" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#0f1115] flex flex-col relative pt-12 pb-2">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-3 pb-3 border-b border-white/10">
        <ChevronLeft className="w-7 h-7 text-white" />
        <div className="flex flex-col items-center">
          <span className="text-[15px] font-bold text-white">Posts</span>
          <span className="text-[12px] text-blue-400 font-medium">{account?.username || "username"}</span>
        </div>
        <div className="w-7 h-7" />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Post Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            {account?.profile_picture_url ? (
              <img src={account.profile_picture_url} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800" />
            )}
            <span className="text-[14px] font-bold text-white">{account?.username || "username"}</span>
          </div>
          <MoreHorizontal className="w-5 h-5 text-white" />
        </div>

        {/* Content Area */}
        {selectedPost ? (
          <div className="flex-1 relative bg-black border-t border-b border-white/5">
            <img src={selectedPost.media_url || selectedPost.thumbnail_url} className="w-full h-full object-cover" />
            {selectedPost.media_type === 'VIDEO' && (
              <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-xs text-white">🎥</div>
            )}
            {selectedPost.media_type === 'CAROUSEL_ALBUM' && (
              <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-xs text-white">📚</div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-[#090a0c] flex flex-col items-center justify-center p-6 text-center border-t border-b border-white/5">
            {isNoPost ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#1e293b] flex items-center justify-center mb-2">
                  <ImageIcon className="w-8 h-8 text-white/50" />
                </div>
                <h3 className="font-bold text-[22px] tracking-tight text-white">No post or reel selected</h3>
                <p className="text-[15px] text-blue-100/50">Please select a post or reel to preview</p>
              </div>
            ) : state.postSelection === 'next' ? (
              <div className="flex flex-col items-center justify-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-400">
                   <Check className="w-8 h-8 text-indigo-400" />
                 </div>
                 <h3 className="font-bold text-xl text-white">Next Post / Reel</h3>
                 <p className="text-[15px] text-white/50">This automation will work with your next published post or reel.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-400">
                   <Check className="w-8 h-8 text-indigo-400" />
                 </div>
                 <h3 className="font-bold text-xl text-white">All Posts & Reels</h3>
                 <p className="text-[15px] text-white/50">This automation will work with all your posts and reels.</p>
              </div>
            )}
          </div>
        )}
        
        {(!isNoPost || selectedPost) && (
          <div className="bg-[#0f1115]">
            {selectedPost ? (
              <>
                <div className="flex items-center justify-between p-3 pb-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-[22px] h-[22px] text-white" />
                      <span className="text-white text-[14px] font-medium">{selectedPost.like_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-[22px] h-[22px] text-white transform -scale-x-100" />
                      <span className="text-white text-[14px] font-medium">{selectedPost.comments_count || 0}</span>
                    </div>
                    <Send className="w-[22px] h-[22px] text-white" />
                  </div>
                  <Bookmark className="w-[22px] h-[22px] text-white" />
                </div>
                <div className="px-3 pb-3">
                  <p className="text-[14px] text-white line-clamp-2">
                    <span className="font-bold mr-1.5">{account?.username || "username"}</span>
                    {selectedPost.caption || ""}
                  </p>
                  <p className="text-[12px] text-white/50 mt-1">{getRelativeTime(selectedPost.timestamp)}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 p-3">
                  <Heart className="w-6 h-6 text-white" />
                  <MessageCircle className="w-6 h-6 text-white" />
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div className="p-3 pt-0">
                  <p className="text-[14px] text-white">
                    <span className="font-bold mr-2">{account?.username || "username"}</span>
                    {state.postSelection === 'next' ? "Automation enabled for your next post 🚀" : "Automation enabled for all posts and reels 🚀"}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-around px-2 py-3 mt-auto bg-[#0f1115]">
         <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor">
           <path fillRule="evenodd" clipRule="evenodd" d="M20.479 7.57827L15.093 3.12502C13.2787 1.62499 10.7213 1.62499 8.90703 3.12502L3.52097 7.57827C2.55059 8.38059 2 9.59706 2 10.8663V18.8739C2 20.5419 3.28643 22 5 22H7C8.65685 22 10 20.6569 10 19V15.6848C10 15.0044 10.5044 14.5587 11 14.5587H13C13.4956 14.5587 14 15.0044 14 15.6848V19C14 20.6569 15.3431 22 17 22H19C20.7136 22 22 20.5419 22 18.8739V10.8663C22 9.59706 21.4494 8.38059 20.479 7.57827Z" />
         </svg>
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="w-6 h-6 text-white">
           <rect x="3" y="3" width="18" height="18" rx="5"/>
           <polygon points="10,8 16,12 10,16"/>
         </svg>
         <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[26px] h-[26px] text-white">
           <path d="M9.61109 12.4L10.8183 18.5355C11.0462 19.6939 12.6026 19.9244 13.1565 18.8818L19.0211 7.84263C19.248 7.41555 19.2006 6.94354 18.9737 6.58417M9.61109 12.4L5.22642 8.15534C4.41653 7.37131 4.97155 6 6.09877 6H17.9135C18.3758 6 18.7568 6.24061 18.9737 6.58417M9.61109 12.4L18.9737 6.58417M19.0555 6.53333L18.9737 6.58417" stroke="currentColor" strokeWidth={2} />
         </svg>
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="w-6 h-6 text-white">
           <circle cx="11" cy="11" r="7"/>
           <line x1="16.65" y1="16.65" x2="21" y2="21"/>
         </svg>
         {account?.profile_picture_url ? (
            <img src={account.profile_picture_url} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-800 ring-1 ring-white/20" />
          )}
      </div>
    </div>
  )
}

function CommentsScreen({ state, account, media = [], newKeyword }: { state: BuilderState, account: any, media?: any[], newKeyword?: string }) {
  const reply = state.publicReplies.length > 0 ? state.publicReplies[0] : "Please check the DM"
  const keyword = state.keywordType === 'any' ? "Awesome!" : (state.keywords[0] || newKeyword || "link")
  
  const isNoPost = state.postSelection === 'manual' && state.selectedPostIds.length === 0;
  const selectedPost = state.postSelection === 'manual' && state.selectedPostIds.length > 0 && media.length > 0
    ? media.find(m => m.id === state.selectedPostIds[0])
    : null;

  return (
    <div className="flex-1 bg-[#0f1115] flex flex-col relative pt-12 pb-2 min-h-0">
      {/* Background (Post view) */}
      <div className="absolute inset-0 pt-12 flex flex-col pointer-events-none opacity-90">
        {/* Top Nav */}
        <div className="flex items-center justify-between px-3 pb-3 border-b border-white/10">
          <ChevronLeft className="w-7 h-7 text-white" />
          <div className="flex flex-col items-center">
            <span className="text-[15px] font-bold text-white">Posts</span>
            <span className="text-xs text-white/50">{account?.username || "username"}</span>
          </div>
          <div className="w-7" />
        </div>
        
        {/* Post Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            {account?.profile_picture_url ? (
              <img src={account.profile_picture_url} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800" />
            )}
            <span className="text-[14px] font-bold text-white">{account?.username || "username"}</span>
          </div>
          <MoreHorizontal className="w-5 h-5 text-white" />
        </div>

        {/* Post Image */}
        {selectedPost ? (
          <div className="w-full aspect-square bg-black border-t border-b border-white/5 relative">
            <img src={selectedPost.media_url || selectedPost.thumbnail_url} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-square bg-[#090a0c] border-t border-b border-white/5 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-400">
               <Check className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[68%] bg-[#1e1e24] rounded-t-2xl shadow-2xl border-t border-white/5 flex flex-col z-10">
        <div className="flex flex-col items-center p-3 border-b border-white/5 relative shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-white/20 mb-3" />
          <span className="text-sm font-semibold text-white">Comments</span>
          <Send className="w-5 h-5 text-white absolute right-4 top-1/2 -translate-y-1/2 mt-1" />
        </div>
        
        <div className="flex-1 p-4 space-y-5 overflow-y-auto min-h-0">
          {/* User Comment */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#A855F7] shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-white">username</span>
                <span className="text-[13px] text-white/50">now</span>
              </div>
              <p className="text-[14px] text-white">{keyword}</p>
              <span className="text-[12px] text-white/50 mt-1 block font-semibold tracking-wide">Reply</span>
            </div>
            <Heart className="w-3.5 h-3.5 text-white/40 shrink-0 mt-2" />
          </div>

          {/* Automated Reply */}
          {state.publicReplyEnabled && (
            <div className="flex gap-3 ml-11">
              {account?.profile_picture_url ? (
                <img src={account.profile_picture_url} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-700 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-white">{account?.username || "your_username"}</span>
                  <span className="text-[13px] text-white/50">now</span>
                </div>
                <p className="text-[14px] text-white">{reply}</p>
                <span className="text-[12px] text-white/50 mt-1 block font-semibold tracking-wide">Reply</span>
              </div>
              <Heart className="w-3.5 h-3.5 text-white/40 shrink-0 mt-2" />
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="p-3 shrink-0">
          <div className="flex items-center gap-4 mb-3 px-2 text-xl">
             <span>❤️</span><span>🙌</span><span>🔥</span><span>👏</span><span>😢</span><span>😍</span><span>😮</span>
          </div>
          <div className="flex items-center gap-2 bg-[#2c2c35] rounded-full px-4 py-2.5">
            {account?.profile_picture_url ? (
              <img src={account.profile_picture_url} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-700" />
            )}
            <span className="text-[14px] text-white/50 flex-1 ml-1">Add a comment for username</span>
            <Smile className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DMScreen({ state, account, newKeyword = "", media = [] }: { state: BuilderState, account: any, newKeyword?: string, media?: any[] }) {
  return (
    <div className="flex-1 bg-[#0f1115] flex flex-col relative pt-12 pb-2 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-7 h-7 text-white" />
          <div className="flex items-center gap-2">
            {account?.profile_picture_url ? (
              <img src={account.profile_picture_url} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800" />
            )}
            <span className="text-[15px] font-bold text-white">{account?.username || "username"}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 pr-1">
          <Phone className="w-6 h-6 text-white" strokeWidth={1.5} />
          <Video className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6 min-h-0">
        
        {/* Lead User sends keyword DM */}
        <div className="flex flex-col items-end gap-1.5 mt-2 mb-8">
          {state.automation_type === 'auto_reply_story' && (
             <div className="bg-[#262626] rounded-2xl p-1.5 flex items-center gap-3 pr-4 max-w-[75%] relative">
                <img src={media?.[0]?.media_url || media?.[0]?.thumbnail_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=500&fit=crop"} className="w-10 h-14 object-cover rounded-xl" />
                <span className="text-[14px] text-white/80">Replied to your story</span>
             </div>
          )}
          <div className="bg-[#5c4ce5] px-5 py-2.5 rounded-3xl text-[15px] text-white max-w-[75%] relative">
            {state.keywordType === 'any' ? "Awesome!" : (newKeyword || state.keywords[0] || "link")}
            {state.reactToStoryReply && (
              <div className="absolute -bottom-2 -left-2 bg-[#262626] rounded-full flex items-center justify-center text-[11px] w-[22px] h-[22px] shadow-sm ring-2 ring-[#0f1115] z-10">
                ❤️
              </div>
            )}
          </div>
        </div>

        {/* Opening Message Section */}
        {state.openingMessageEnabled && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-end gap-2 w-full">
                {account?.profile_picture_url ? (
                  <img src={account.profile_picture_url} className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-700 shrink-0" />
                )}
                <div className="bg-[#262626] p-3 rounded-2xl rounded-bl-sm max-w-[75%] flex flex-col gap-3">
                  <span className="text-[15px] text-white leading-snug">
                    {state.openingMessage || "..."}
                  </span>
                  {state.buttonLabel && (
                    <div className="bg-white/10 px-4 py-2.5 rounded-xl text-[15px] font-semibold text-white text-center cursor-pointer">
                      {state.buttonLabel}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Clicks Button (Simulated Lead User) */}
            {state.activeStep >= 4 && (
              <div className="flex flex-col items-end gap-2">
                <div className="bg-[#5c4ce5] px-5 py-2.5 rounded-3xl text-[15px] text-white max-w-[75%]">
                  {state.buttonLabel}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ask to Follow Section */}
        {state.askToFollowEnabled && state.activeStep >= 5 && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-end gap-2 w-full">
                {account?.profile_picture_url ? (
                  <img src={account.profile_picture_url} className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-700 shrink-0" />
                )}
                <div className="bg-[#262626] p-3 rounded-2xl rounded-bl-sm max-w-[75%] flex flex-col gap-3 w-full">
                  <span className="text-[15px] text-white leading-snug">
                    {state.askToFollowMessage || "..."}
                  </span>
                  <div className="flex flex-col gap-2 w-full">
                     <div className="bg-white/10 px-4 py-2.5 rounded-xl text-[15px] font-semibold text-center text-white cursor-pointer w-full">
                       {state.profileButtonLabel}
                     </div>
                     <div className="bg-white/10 px-4 py-2.5 rounded-xl text-[15px] font-semibold text-center text-white cursor-pointer w-full">
                       {state.imFollowingButtonLabel}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User says I'm following (Simulated Lead User) */}
            {state.activeStep >= 5 && (
              <div className="flex flex-col items-end gap-2">
                <div className="bg-[#5c4ce5] px-5 py-2.5 rounded-3xl text-[15px] text-white max-w-[75%]">
                   {state.imFollowingButtonLabel}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Compose Message */}
        {state.activeStep >= 6 && (
           <div className="flex flex-col items-start gap-2">
             <div className="flex items-end gap-2 w-full">
               {account?.profile_picture_url ? (
                 <img src={account.profile_picture_url} className="w-7 h-7 rounded-full object-cover shrink-0" />
               ) : (
                 <div className="w-7 h-7 rounded-full bg-slate-700 shrink-0" />
               )}
               <div className="bg-[#262626] p-3 rounded-2xl rounded-bl-sm max-w-[75%] flex flex-col gap-3">
                 <div className="flex flex-col gap-2">
                   {state.uploadedImage && (
                     <img src={state.uploadedImage} alt="Uploaded preview" className="w-full h-auto rounded-lg object-cover max-h-[150px]" />
                   )}
                   <span className="text-[15px] text-white leading-snug">
                     {state.finalMessage || "..."}
                   </span>
                 </div>
                 {state.finalLink && (
                   <a 
                     href={state.finalLink.startsWith('http') ? state.finalLink : `https://${state.finalLink}`} 
                     target="_blank"
                     className="bg-white/10 px-4 py-2.5 rounded-xl text-[15px] font-semibold text-white text-center w-full"
                   >
                     {state.finalLinkLabel || "link"}
                   </a>
                 )}
               </div>
             </div>
           </div>
        )}

      </div>

      {/* Input bar */}
      <div className="px-3 pb-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#4f46e5] flex items-center justify-center shrink-0">
           <Camera className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center flex-1 bg-[#1f2937] rounded-full px-4 py-2 h-10">
          <span className="text-[15px] text-white/40 flex-1">Message....</span>
          <div className="flex items-center gap-3 shrink-0 text-white">
             <Mic className="w-5 h-5" strokeWidth={1.5} />
             <ImageIcon className="w-5 h-5" strokeWidth={1.5} />
             <Smile className="w-5 h-5" strokeWidth={1.5} />
             <PlusCircle className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Image(props: any) {
  return <ImageIcon {...props} />
}
