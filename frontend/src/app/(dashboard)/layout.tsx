"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:block h-full">
         <Sidebar />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/10">
          <AnimatePresence mode="wait">
             <motion.div
               key={pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
               className="h-full w-full p-4 md:p-6 lg:p-8"
             >
               {children}
             </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
