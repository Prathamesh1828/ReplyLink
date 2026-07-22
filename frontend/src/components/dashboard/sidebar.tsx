"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Wand2,
  LifeBuoy,
  User,
  Sparkles,
} from "lucide-react"
import { Instagram } from "@/components/icons"
import { UserNav } from "./user-nav"
import { SupportModal } from "./support-modal"

import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Automations", href: "/automations", icon: Wand2 },
  { title: "Templates", href: "/templates", icon: MessageSquare },
  { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { title: "AI Agent", href: "/ai-agent", icon: Sparkles },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Instagram", href: "/instagram", icon: Instagram },
  { title: "Settings", href: "/settings", icon: Settings },
]

const bottomNavItems = [
  { title: "Billing", href: "/billing", icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const [supportOpen, setSupportOpen] = useState(false)

  return (
    <div
      className="w-[220px] relative flex flex-col border-r bg-sidebar text-sidebar-foreground h-full flex-shrink-0 transition-none"
    >
      <div className="flex h-14 items-center border-b px-6 py-4 justify-between">
        <div className="flex items-center font-bold text-[22px] tracking-tight truncate">
          <span className="truncate">
            <span className="text-foreground dark:text-white">Reply</span>
            <span className="bg-gradient-to-r from-[#a855f7] to-[#3b82f6] bg-clip-text text-transparent">Link</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-none">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <nav className="grid gap-1 mb-4">
          {bottomNavItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setSupportOpen(true)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LifeBuoy className="h-4 w-4 shrink-0" />
            <span className="truncate">Support</span>
          </button>
        </nav>
        
        <div className="pt-2 flex items-center justify-start ml-2 border-t">
          <UserNav />
        </div>
      </div>
      
      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  )
}
