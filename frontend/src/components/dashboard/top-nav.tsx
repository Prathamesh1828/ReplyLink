"use client"

import { Menu, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "./theme-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-[240px]">
             <SheetTitle className="sr-only">Menu</SheetTitle>
             <SheetDescription className="sr-only">Sidebar navigation menu</SheetDescription>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex flex-1 items-center justify-end space-x-4">
        <div className="flex items-center gap-2">
           <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
