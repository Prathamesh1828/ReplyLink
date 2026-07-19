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

import { DashboardStats } from "@/components/dashboard/dashboard-stats"

import { ConnectAccountButton } from "@/components/dashboard/connect-account-button"
import { createClient } from "@/utils/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  let isConnected = false
  if (session) {
    const { data } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1)
      
    if (data && data.length > 0) {
      isConnected = true
    }
  }

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
          <ConnectAccountButton initialIsConnected={isConnected} />
          <Link href="/templates">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Automation
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
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
              Latest interactions handled by ReplyLink.
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
