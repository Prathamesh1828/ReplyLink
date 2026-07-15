import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react"

export const metadata: Metadata = {
  title: "Instagram | ReplyLink",
  description: "Connect and manage your Instagram business account.",
}

export default function InstagramPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Instagram Connection</h2>
        <p className="text-muted-foreground">
          Connect your Instagram business account to enable automations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Instagram Account
            </CardTitle>
            <CardDescription>
              Connect via Meta Business Suite to grant message permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">No account connected</p>
                <p className="text-xs text-muted-foreground">Connect your Instagram to start automating replies.</p>
              </div>
            </div>
            <Button className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Connect Instagram Account
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Requires an Instagram Business or Creator account linked to a Facebook Page.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>
              Ensure the following before connecting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { text: "Instagram Business or Creator account", done: false },
              { text: "Connected Facebook Page", done: false },
              { text: "Admin access to the Facebook Page", done: false },
              { text: "Instagram messaging API enabled", done: false },
            ].map((req, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${req.done ? "bg-green-100 dark:bg-green-500/10" : "bg-muted"}`}>
                  <CheckCircle className={`h-3.5 w-3.5 ${req.done ? "text-green-600" : "text-muted-foreground"}`} />
                </div>
                <span className={req.done ? "" : "text-muted-foreground"}>{req.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions Granted</CardTitle>
          <CardDescription>Once connected, ReplyLink will have access to:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Read DMs", "Send DMs", "Read Comments", "Reply to Comments", "Read Story Mentions", "Account Insights"].map((perm) => (
              <Badge key={perm} variant="secondary">{perm}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
