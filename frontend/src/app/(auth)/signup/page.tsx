import { Metadata } from "next"
import SignupForm from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up | ReplyLink",
  description: "Create your ReplyLink account.",
}

export default function SignupPage() {
  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to get started.
        </p>
      </div>
      <SignupForm />
    </div>
  )
}
