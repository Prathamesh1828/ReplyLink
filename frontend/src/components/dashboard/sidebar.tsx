"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Wand2,
  Camera,
  LifeBuoy,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Automations", href: "/automations", icon: Wand2 },
  { title: "Templates", href: "/templates", icon: MessageSquare },
  { title: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Instagram", href: "/instagram", icon: Camera },
  { title: "AI Settings", href: "/ai-settings", icon: Sparkles },
]

const bottomNavItems = [
  { title: "Billing", href: "/billing", icon: CreditCard },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Support", href: "/support", icon: LifeBuoy },
]

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 h-full",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex h-14 items-center border-b px-4 py-4 justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>ReplyLink</span>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary mx-auto">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-none">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="flex items-center gap-4">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <nav className="grid gap-1 mb-4">
          {bottomNavItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="flex items-center gap-4">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>
        
        <div className="flex items-center justify-center">
           <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 text-muted-foreground", isCollapsed ? "" : "w-full flex justify-start px-2")}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="mr-2 h-4 w-4" />
                  <span className="text-sm">Collapse</span>
                </>
              )}
            </Button>
        </div>
      </div>
    </div>
  )
}
