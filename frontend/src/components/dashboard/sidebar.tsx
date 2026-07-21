"use client"

import { useState, useRef, useEffect } from "react"
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

import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Automations", href: "/automations", icon: Wand2 },
  { title: "Templates", href: "/templates", icon: MessageSquare },
  { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Instagram", href: "/instagram", icon: Instagram },
  { title: "AI Agent", href: "/ai-agent", icon: Sparkles },
]

const bottomNavItems = [
  { title: "Billing", href: "/billing", icon: CreditCard },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Support", href: "/support", icon: LifeBuoy },
]

export function Sidebar() {
  const pathname = usePathname()
  const [width, setWidth] = useState(240)
  const isResizing = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      let newWidth = e.clientX
      if (newWidth < 200) newWidth = 200
      if (newWidth > 400) newWidth = 400
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = "default"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = "col-resize"
  }

  return (
    <div
      style={{ width: `${width}px` }}
      className="relative flex flex-col border-r bg-sidebar text-sidebar-foreground h-full flex-shrink-0 transition-none"
    >
      <div 
        className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary z-50"
        onMouseDown={handleMouseDown}
      />
      
      <div className="flex h-14 items-center border-b px-4 py-4 justify-between">
        <div className="flex items-center gap-2 font-semibold truncate">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="truncate">ReplyLink</span>
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
        </nav>
      </div>
    </div>
  )
}
