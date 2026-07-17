import { Metadata } from "next"
import { InstagramClient } from "./instagram-client"
import { Suspense } from "react"
import { RefreshCw } from "lucide-react"

export const metadata: Metadata = {
  title: "Instagram | ReplyLink",
  description: "Connect and manage your Instagram business account.",
}

export default function InstagramPage() {
  return (
    <Suspense fallback={<div className="flex p-8 justify-center"><RefreshCw className="h-6 w-6 animate-spin" /></div>}>
      <InstagramClient />
    </Suspense>
  )
}
