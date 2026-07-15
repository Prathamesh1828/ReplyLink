import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, ExternalLink, LifeBuoy, MessageCircle, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Support | ReplyLink",
  description: "Get help and support for ReplyLink.",
}

export default function SupportPage() {
  return (
    <div className="flex-1 space-y-6 max-w-4xl">
      <div className="pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
        <p className="text-muted-foreground">
          Find answers, read the docs, or reach out to our team.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-base">Documentation</CardTitle>
            <CardDescription>Read our comprehensive guides and API docs.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" size="sm">
              Open Docs <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <MessageCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-base">Live Chat</CardTitle>
            <CardDescription>Chat with our support team in real time.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" size="sm">
              Start Chat <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                <Mail className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-base">Email Support</CardTitle>
            <CardDescription>Send us an email and we'll respond within 24h.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" size="sm">
              Send Email <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Submit a Request
          </CardTitle>
          <CardDescription>Describe your issue and our team will get back to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Brief description of the issue" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Describe what happened, what you expected, and any steps to reproduce..."
            />
          </div>
          <Button>Submit Request</Button>
        </CardContent>
      </Card>
    </div>
  )
}
