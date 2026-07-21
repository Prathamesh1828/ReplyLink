import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageCircle, PlusCircle, MessageSquare, MessagesSquare, Bot, UserPlus, AtSign, ArrowRight } from "lucide-react"
import { Instagram } from "@/components/icons"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Templates | ReplyLink",
  description: "Choose a template to get started with automation",
}

const templates = [
  {
    id: "auto_dm_comments",
    title: "Auto-DM Links from Comments",
    description: "Automatically send a DM with your configured message and link when someone comments using a configured keyword.",
    status: "active",
    iconClass: "bg-[#0ea5e9]",
    IconComponent: MessageCircle,
  },
  {
    id: "auto_reply_story",
    title: "Auto-Respond to Story Replies",
    description: "Automatically reply to users who respond to your Instagram Stories.",
    status: "active",
    iconClass: "bg-[#10b981]",
    IconComponent: PlusCircle,
  },
  {
    id: "auto_reply_dm",
    title: "Auto-Respond to DMs",
    description: "Automatically reply to incoming Instagram DMs using your configured workflow.",
    status: "active",
    iconClass: "bg-[#f97316]",
    IconComponent: MessagesSquare,
  },
  {
    id: "t_4",
    title: "AI Lead Conversations",
    description: "Use AI to answer FAQs, qualify leads, continue conversations, and convert prospects automatically.",
    status: "active",
    isAi: true,
    iconClass: "bg-gradient-to-br from-orange-400 to-pink-400",
    IconComponent: Bot,
  },

  {
    id: "t_7",
    title: "DM to New Followers",
    description: "Automatically send a welcome message to every new Instagram follower.",
    status: "coming_soon",
    iconClass: "bg-gradient-to-br from-indigo-300 to-indigo-400",
    IconComponent: UserPlus,
  },

  {
    id: "t_9",
    title: "Reply to Story Mentions",
    description: "Automatically respond when someone mentions your account in their Instagram Story.",
    status: "coming_soon",
    iconClass: "bg-gradient-to-br from-purple-300 to-purple-400",
    IconComponent: AtSign,
  }
]

export default function TemplatesPage() {
  return (
    <div className="flex-1 space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
        <p className="text-muted-foreground">
          Choose a template to get started with automation
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const isActive = template.status === "active"
          return (
            <Card 
              key={template.id} 
              className={cn(
                "flex flex-col relative",
                isActive ? "hover:shadow-md transition-all group cursor-pointer" : "border-dashed opacity-60",
                template.isAi ? "border-orange-200 shadow-sm" : ""
              )}
            >
              <CardHeader className="flex-none pb-4">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm",
                    template.iconClass
                  )}>
                    <template.IconComponent className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {template.isAi && (
                      <Badge className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-3">
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        AI Powered
                      </Badge>
                    )}
                    {!isActive && (
                      <Badge variant="outline" className="rounded-full bg-slate-100 text-slate-500 font-normal">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="mt-5 text-xl font-semibold">
                  {template.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              </CardContent>
              <CardFooter className="pt-2 pb-6">
                {isActive ? (
                  <Link 
                    href={template.isAi ? `/ai-agent` : `/automations/builder?type=${template.id}`} 
                    className={cn(buttonVariants({ variant: "default" }), "w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors border-none shadow-sm")}
                  >
                    Use Template <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full justify-center h-11 opacity-50 cursor-not-allowed text-muted-foreground font-normal bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800" disabled>
                    Coming Soon
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
