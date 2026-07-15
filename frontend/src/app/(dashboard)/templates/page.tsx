import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageSquare, Copy, Search, Plus, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Templates | ReplyLink",
  description: "Manage your message reply templates.",
}

const templates = [
  {
    id: "t_1",
    name: "Welcome Message",
    category: "Onboarding",
    preview: "Hey {name}! Thanks for reaching out 👋 We're excited to help you with...",
    usageCount: 342,
  },
  {
    id: "t_2",
    name: "Pricing Inquiry",
    category: "Sales",
    preview: "Great question! Our plans start at $29/mo. Here's a quick breakdown...",
    usageCount: 218,
  },
  {
    id: "t_3",
    name: "Link Request Reply",
    category: "Lead Gen",
    preview: "Here's the link you requested! 🔗 Check it out and let me know if you have any questions.",
    usageCount: 567,
  },
  {
    id: "t_4",
    name: "Out of Office",
    category: "Support",
    preview: "Thanks for your message! We're currently away but will get back to you within 24 hours.",
    usageCount: 89,
  },
]

export default function TemplatesPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground">
            Pre-built message templates for common responses.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates..." className="pl-8" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow group cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {template.name}
                </CardTitle>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{template.preview}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Used {template.usageCount} times</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
