"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { flushSync } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [fallbackAnimation, setFallbackAnimation] = React.useState<{x: number, y: number, isDark: boolean} | null>(null)

  const toggleTheme = (event: React.MouseEvent) => {
    const newTheme = isDark ? "light" : "dark"
    const x = event.clientX
    const y = event.clientY

    // Use native View Transitions API if supported
    // Note: cast to any to handle experimental types in some TS configs
    if (typeof document !== 'undefined' && (document as any).startViewTransition) {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      const transition = (document as any).startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme)
        })
      })

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
        
        document.documentElement.animate(
          {
            clipPath: isDark ? [...clipPath].reverse() : clipPath,
          },
          {
            duration: 500,
            easing: "ease-in-out",
            pseudoElement: isDark
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)",
          }
        )
      })
    } else {
      // Cross-browser fallback: A solid color sweep overlay
      setFallbackAnimation({ x, y, isDark: !isDark })
      setTimeout(() => {
        setTheme(newTheme)
        setTimeout(() => setFallbackAnimation(null), 100)
      }, 500) // Wait for overlay to expand before switching theme under it
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="relative z-50"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Cross-browser Fallback Overlay */}
      <AnimatePresence>
        {fallbackAnimation && (
          <motion.div
            initial={{ 
              clipPath: `circle(0px at ${fallbackAnimation.x}px ${fallbackAnimation.y}px)`,
              opacity: 1
            }}
            animate={{ 
              clipPath: `circle(150% at ${fallbackAnimation.x}px ${fallbackAnimation.y}px)`,
              opacity: 1
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`fixed inset-0 z-40 pointer-events-none ${
              fallbackAnimation.isDark ? 'bg-[#0B1120]' : 'bg-[#F8FAFC]'
            }`}
          />
        )}
      </AnimatePresence>
    </>
  )
}
