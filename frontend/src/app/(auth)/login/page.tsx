import { Metadata } from "next"
import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login | ReplyLink",
  description: "Login to your ReplyLink account.",
}

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to access your workspace.
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
