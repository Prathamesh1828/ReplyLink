import { Metadata } from "next"
import UpdatePasswordForm from "@/components/auth/update-password-form"

export const metadata: Metadata = {
  title: "Update Password | ReplyLink",
  description: "Update your ReplyLink password.",
}

export default function UpdatePasswordPage() {
  return (
    <div className="w-full flex flex-col space-y-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-[28px] font-bold tracking-tight text-white">Update password</h1>
        <p className="text-[15px] text-slate-400">
          Please enter your new password below.
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  )
}
