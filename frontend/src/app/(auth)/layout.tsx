"use client"

import { motion } from "framer-motion"
import { Sparkles, Lock, BarChart3, Users } from "lucide-react"
import { Instagram } from "@/components/icons"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0F] font-sans text-slate-200">
      
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex relative w-1/2 bg-[#0A0A0F] border-r border-white/5 overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Animated Background Blobs */}
        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-violet-600/10 blur-[120px]"
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
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ReplyLink</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-md mt-12"
          >
            <h1 className="text-[32px] font-bold leading-tight mb-6">
              Automate your Instagram conversations with AI.
            </h1>
            <p className="text-slate-400 text-[16px] mb-10 leading-relaxed">
              Turn DMs and comments into sales effortlessly. Built for modern businesses looking to scale.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-slate-300">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Instagram className="h-5 w-5 text-violet-400" />
                </div>
                <span className="text-[15px]">Intelligent auto-replies to stories and comments</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Users className="h-5 w-5 text-violet-400" />
                </div>
                <span className="text-[15px]">Capture leads directly into the built-in CRM</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <BarChart3 className="h-5 w-5 text-violet-400" />
                </div>
                <span className="text-[15px]">Advanced analytics to track conversion rates</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-[13px] text-slate-500">
          © {new Date().getFullYear()} ReplyLink. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex flex-1 flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden p-6 lg:p-8">
        
        {/* Background Glow for Right Side */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Mobile Logo */}
        <div className="lg:hidden flex justify-center mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">ReplyLink</span>
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="relative z-10 w-full max-w-[460px]">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-[#15151C] border border-white/5 rounded-2xl p-8 shadow-2xl"
          >
            {children}
          </motion.div>

          {/* Trust Indicator Footer */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[13px] text-slate-500">
            <Lock className="h-3.5 w-3.5" />
            <span>Secure authentication powered by Supabase</span>
          </div>
        </div>
      </div>
      
    </div>
  )
}
