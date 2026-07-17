"use client"

import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Loader2, Mail, CheckCircle2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onError = (errors: any) => {
    if (errors.email) {
      toast.error("Invalid email: " + errors.email.message)
    }
  }

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center space-y-4 text-center p-6 border border-emerald-500/20 bg-[#15151C] rounded-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-2">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-[15px] font-medium text-slate-200">
          Check your inbox
        </p>
        <p className="text-[14px] text-slate-400">
          We've sent a password reset link to your email. If it doesn't appear within a few minutes, check your spam folder.
        </p>
        <Link href="/login" className="w-full mt-4">
          <Button 
            variant="outline" 
            className="w-full h-11 bg-[#1A1A24] border-white/10 hover:bg-[#20202A] hover:text-white text-slate-300 rounded-xl transition-all"
          >
            Return to login
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6"
    >
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                className="pl-10 h-11 bg-[#1A1A24] border-white/10 rounded-xl focus-visible:ring-violet-500 text-slate-200 transition-colors"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>
          
          <Button 
            disabled={isLoading} 
            className="w-full mt-2 h-11 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98]" 
            type="submit"
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send reset link
          </Button>
        </div>
      </form>

      <div className="text-center text-[14px]">
        <Link
          href="/login"
          className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </motion.div>
  )
}
