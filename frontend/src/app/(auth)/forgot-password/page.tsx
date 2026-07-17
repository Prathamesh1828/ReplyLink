import { Metadata } from "next"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password | ReplyLink",
  description: "Reset your ReplyLink password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full flex flex-col space-y-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-[28px] font-bold tracking-tight text-white">Reset password</h1>
        <p className="text-[15px] text-slate-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
