import { Metadata } from "next"
import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login | ReplyLink",
  description: "Login to your ReplyLink account.",
}

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col space-y-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-[28px] font-bold tracking-tight text-white">Welcome back</h1>
        <p className="text-[15px] text-slate-400">
          Sign in to manage your Instagram automations.
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
