"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Wand2, MessageCircle, PlusCircle, MessagesSquare } from "lucide-react"
import { useRealtimeQuery } from "@/hooks/use-realtime-query"

export function RecentActivity() {
  const { data, isLoading: loading } = useRealtimeQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const res = await fetch("http://127.0.0.1:8000/api/dashboard/activity")
      const json = await res.json()
      if (Array.isArray(json)) return json
      return []
    }
  }, ['automation_runs', 'messages'])

  const activity = data || [];

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'ai_agent':
        return { Icon: Wand2, bgClass: "bg-purple-500 text-white" };
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

  if (loading) {
    return (
      <div className="space-y-8 mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
            <Skeleton className="h-3 w-[50px]" />
          </div>
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
        <p className="text-sm text-muted-foreground">No recent activity found.</p>
        <p className="text-xs text-muted-foreground">Once your automations run, activity will show here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-2 max-h-[350px] overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-indigo-500/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500/20">
      {activity.map((item, index) => {
        // Format the date nicely
        const date = item.created_at ? new Date(item.created_at) : new Date();
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const { Icon, bgClass } = getTemplateIcon(item.automation_type);
        
        return (
          <div key={item.id || index} className="flex items-start">
            <div className={`h-9 w-9 mt-0.5 rounded-xl flex flex-shrink-0 items-center justify-center shadow-sm ${bgClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="ml-4 space-y-1 flex-1">
              <p className="text-sm font-medium leading-none">
                @{item.username} {
                  item.automation_type === 'ai_agent' ? 'messaged you' : 
                  item.automation_type === 'auto_reply_story' ? 'replied to your story' : 
                  (item.automation_type === 'auto_reply_dm' || item.automation_type === 'dm_reply') ? 'sent you a DM' : 
                  'commented'
                }
              </p>
              <p className="text-sm text-muted-foreground line-clamp-1 italic">
                "{item.comment}"
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                {item.automation_type === 'ai_agent' ? 'AI Agent handled via ' : 'Automated DM sent via '}
                <span className="font-medium text-foreground">{item.automation_name}</span>
              </p>
            </div>
            <div className="ml-auto font-medium text-xs text-muted-foreground whitespace-nowrap pl-2">
              {timeString}
            </div>
          </div>
        );
      })}
    </div>
  )
}
