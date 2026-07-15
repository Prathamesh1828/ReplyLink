import { Metadata } from "next"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password | ReplyLink",
  description: "Reset your ReplyLink password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
