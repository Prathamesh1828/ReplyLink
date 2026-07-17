import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewCharts } from "@/components/dashboard/overview-charts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import {
  MousePointerClick,
  Users,
  Wand2,
  Camera,
  ArrowUpRight,
  Plus
} from "lucide-react"
import { Instagram } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Dashboard | ReplyLink",
  description: "Overview of your ReplyLink workspace.",
}

const stats = [
  {
    title: "Total Automations",
    value: "12",
    description: "Total automations created by the user.",
    icon: Wand2,
  },
  {
    title: "Messages Sent",
    value: "14,231",
    description: "Total Instagram DMs successfully sent by ReplyLink automations.",
    icon: Instagram,
  },
  {
    title: "Conversations Started",
    value: "3,102",
    description: "Total conversations where a contact replied after receiving an automated DM.",
    icon: Users,
  },
  {
    title: "Link Clicks",
    value: "1,452",
    description: "Total tracked clicks on links sent through ReplyLink automations.",
    icon: MousePointerClick,
  },
]

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your Instagram account today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/instagram" className={buttonVariants({ variant: "default" })}>
            <Instagram className="mr-2 h-4 w-4" />
            Connect Account
          </Link>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Automation
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Message Trends</CardTitle>
            <CardDescription>
              Volume of DMs and comments processed over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewCharts />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest interactions handled by AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
