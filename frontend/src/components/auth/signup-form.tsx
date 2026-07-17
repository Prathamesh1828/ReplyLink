"use client"

import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
})

type SignupFormValues = z.infer<typeof signupSchema>

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

export default function SignupForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    // If session exists, auto-confirm is on → go to dashboard
    if (signUpData.session) {
      toast.success("Account created successfully!")
      router.push("/dashboard")
      router.refresh()
      return
    }

    // No session means email confirmation is required
    toast.success("Account created! Check your email to confirm your account.")
    router.push("/login")
  }

  const onError = (errors: any) => {
    if (errors.email) {
      toast.error("Invalid email: " + errors.email.message)
    } else if (errors.password) {
      toast.error(errors.password.message)
    } else if (errors.fullName) {
      toast.error(errors.fullName.message)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6"
    >
      <form onSubmit={handleSubmit(onSubmit, onError)} autoComplete="off">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <Input
                id="fullName"
                placeholder="Enter your full name"
                autoCapitalize="words"
                autoComplete="off"
                autoCorrect="off"
                disabled={isLoading}
                className="pl-10 h-11 bg-[#1A1A24] border-white/10 rounded-xl focus-visible:ring-violet-500 text-slate-200 transition-colors"
                {...register("fullName")}
              />
            </div>
            {errors.fullName && (
              <p className="text-sm text-red-400">{errors.fullName.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                autoCapitalize="none"
                autoComplete="off"
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
          
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <Input
                id="password"
                placeholder="Enter strong password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isLoading}
                className="pl-10 pr-10 h-11 bg-[#1A1A24] border-white/10 rounded-xl focus-visible:ring-violet-500 text-slate-200 transition-colors"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
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
            Create Account
          </Button>
        </div>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase bg-[#15151C] px-4 text-slate-500 font-medium tracking-widest">
          or
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading} 
          className="w-full h-11 bg-[#1A1A24] border-white/10 hover:bg-[#20202A] hover:text-white text-slate-300 rounded-xl transition-all active:scale-[0.98]" 
          onClick={handleGoogleLogin}
        >
          <GoogleIcon />
          Continue with Google
        </Button>
      </div>

      <p className="text-center text-[14px] text-slate-400 mt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          Log In
        </Link>
      </p>
    </motion.div>
  )
}
