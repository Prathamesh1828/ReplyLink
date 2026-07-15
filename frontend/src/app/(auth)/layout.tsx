"use client"

import { motion } from "framer-motion"
import { Sparkles, MessageCircle, BarChart3, Users } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex relative w-1/2 bg-slate-950 overflow-hidden flex-col justify-between p-12 text-white">
        {/* Animated Background Blobs */}
        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[100px]"
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ReplyLink</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-bold leading-tight mb-6">
              Automate your Instagram conversations with AI.
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Turn DMs and comments into sales effortlessly. Built for modern businesses looking to scale.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-slate-300">
                <div className="p-2 rounded-full bg-white/5 border border-white/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <span>Intelligent auto-replies to stories and comments</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="p-2 rounded-full bg-white/5 border border-white/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span>Capture leads directly into the built-in CRM</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="p-2 rounded-full bg-white/5 border border-white/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <span>Advanced analytics to track conversion rates</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} ReplyLink. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 flex-col justify-center items-center p-6 lg:p-8">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ReplyLink</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
