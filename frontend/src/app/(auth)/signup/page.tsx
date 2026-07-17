import { Metadata } from "next"
import SignupForm from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up | ReplyLink",
  description: "Create your ReplyLink account.",
}

export default function SignupPage() {
  return (
    <div className="w-full flex flex-col space-y-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-[28px] font-bold tracking-tight text-white">Create your ReplyLink account</h1>
      </div>
      <SignupForm />
    </div>
  )
}
