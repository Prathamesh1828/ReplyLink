import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewCharts } from "@/components/dashboard/overview-charts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import {
  MessageCircle,
  MousePointerClick,
  Users,
  Wand2,
  Camera,
  ArrowUpRight,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Dashboard | ReplyLink",
  description: "Overview of your ReplyLink workspace.",
}

const stats = [
  {
    title: "Messages Processed",
    value: "14,231",
    change: "+20.1%",
    icon: MessageCircle,
    trend: "up"
  },
  {
    title: "Leads Captured",
    value: "842",
    change: "+15.2%",
    icon: Users,
    trend: "up"
  },
  {
    title: "Automation CTR",
    value: "12.4%",
    change: "+4.1%",
    icon: MousePointerClick,
    trend: "up"
  },
  {
    title: "Active Automations",
    value: "12",
    change: "0%",
    icon: Wand2,
    trend: "neutral"
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
          <Button>
            <Camera className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
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
              <p className={`text-xs flex items-center ${stat.trend === 'up' ? 'text-green-500' : 'text-muted-foreground'}`}>
                {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
                {stat.change} from last month
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
