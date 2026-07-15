import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Save, Building, Globe, Bell, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Settings | ReplyLink",
  description: "Manage your workspace settings.",
}

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 max-w-4xl">
      <div className="pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your workspace and account preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Workspace
          </CardTitle>
          <CardDescription>General workspace information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input id="workspace-name" placeholder="My Workspace" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="workspace-url">Workspace URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">replylink.app/</span>
              <Input id="workspace-url" placeholder="my-workspace" className="max-w-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "New lead captured", description: "Get notified when a new lead is captured via automation.", default: true },
            { label: "AI escalation", description: "Get notified when the AI is unsure and escalates to a human.", default: true },
            { label: "Weekly digest", description: "Receive a weekly summary of your automation performance.", default: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <input type="checkbox" defaultChecked={item.default} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions for your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Workspace</p>
              <p className="text-xs text-muted-foreground">Permanently delete this workspace and all its data.</p>
            </div>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </CardContent>
      </Card>

      <Button>
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  )
}
