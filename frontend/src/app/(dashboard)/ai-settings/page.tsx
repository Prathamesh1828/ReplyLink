import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Save, RotateCcw, Gauge, MessageSquare, BrainCircuit } from "lucide-react"

export const metadata: Metadata = {
  title: "AI Settings | ReplyLink",
  description: "Configure your AI assistant behavior and personality.",
}

export default function AISettingsPage() {
  return (
    <div className="flex-1 space-y-6 max-w-4xl">
      <div className="pb-4">
        <h2 className="text-3xl font-bold tracking-tight">AI Settings</h2>
        <p className="text-muted-foreground">
          Fine-tune how the AI responds to conversations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AI Personality
          </CardTitle>
          <CardDescription>
            Define the tone and style for AI-generated replies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="business-name">Business Name</Label>
            <Input id="business-name" placeholder="Your business name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="personality">AI Persona / System Prompt</Label>
            <textarea
              id="personality"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="You are a helpful, friendly assistant for our business. Always be polite and professional. If you don't know the answer, let the user know you'll connect them with a team member."
            />
            <p className="text-xs text-muted-foreground">This prompt shapes all AI-generated replies.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Response Behaviour
          </CardTitle>
          <CardDescription>
            Control how creative or deterministic the AI should be.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {["Professional", "Friendly", "Casual", "Formal", "Enthusiastic"].map((tone) => (
                <Badge
                  key={tone}
                  variant={tone === "Friendly" ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                >
                  {tone}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label htmlFor="max-length">Max Response Length (words)</Label>
            <Input id="max-length" type="number" defaultValue="150" className="max-w-[200px]" />
          </div>
          <div className="grid gap-2">
            <Label>Fallback Behaviour</Label>
            <p className="text-sm text-muted-foreground">
              What to do when the AI is unsure about a response.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Escalate to human", active: true },
                { label: "Reply with generic response", active: false },
                { label: "Don't reply", active: false },
              ].map((opt) => (
                <Badge
                  key={opt.label}
                  variant={opt.active ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
        <Button variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
