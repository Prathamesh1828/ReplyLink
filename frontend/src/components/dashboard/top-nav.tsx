"use client"

import { Menu, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "./theme-toggle"
import { UserNav } from "./user-nav"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
             <SheetTitle className="sr-only">Menu</SheetTitle>
             <SheetDescription className="sr-only">Sidebar navigation menu</SheetDescription>
            <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex flex-1 items-center justify-end space-x-4">
        <div className="w-full max-w-sm ml-auto mr-4 relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 bg-muted/50 border-none focus-visible:ring-1 h-9 rounded-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="default" size="sm" className="hidden sm:flex h-8 rounded-full px-4">
             <Plus className="mr-2 h-4 w-4" />
             Create
           </Button>
           <ThemeToggle />
           <UserNav />
        </div>
      </div>
    </header>
  )
}
