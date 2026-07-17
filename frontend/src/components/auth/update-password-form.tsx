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
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const updatePasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
})

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>

export default function UpdatePasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
    },
  })

  const onError = (errors: any) => {
    if (errors.password) {
      toast.error(errors.password.message)
    }
  }

  async function onSubmit(data: UpdatePasswordFormValues) {
    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: data.password
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success("Password updated successfully!")
    router.push("/dashboard")
    router.refresh()
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
            <Label htmlFor="password" className="text-slate-300">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <Input
                id="password"
                placeholder="Enter new password"
                type={showPassword ? "text" : "password"}
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
            Update password
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
