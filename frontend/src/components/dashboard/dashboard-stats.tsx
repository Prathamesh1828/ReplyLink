"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wand2, MousePointerClick, Users } from "lucide-react"
import { Instagram } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { useRealtimeQuery } from "@/hooks/use-realtime-query"

export function DashboardStats() {
  const { data, isLoading } = useRealtimeQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch("http://127.0.0.1:8000/api/dashboard/stats")
      const json = await res.json()
      if (json.detail) throw new Error(json.detail)
      return json
    }
  }, ['automations', 'automation_runs', 'contacts'])

  const stats = data || {
    total_automations: 0,
    messages_sent: 0,
    conversations_started: 0,
    link_clicks: 0
  };

  const statItems = [
    {
      title: "Total Automations",
      value: stats.total_automations.toString(),
      description: "Total automations created by the user.",
      icon: Wand2,
    },
    {
      title: "Messages Sent",
      value: stats.messages_sent.toString(),
      description: "Total Instagram DMs successfully sent by ReplyLink automations.",
      icon: Instagram,
    },
    {
      title: "Conversations Started",
      value: stats.conversations_started.toString(),
      description: "Total conversations where a contact replied after receiving an automated DM.",
      icon: Users,
    },
    {
      title: "Link Clicks",
      value: stats.link_clicks.toString(),
      description: "Total tracked clicks on links sent through ReplyLink automations.",
      icon: MousePointerClick,
    },
  ];

  return (
    <>
      {statItems.map((stat, i) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
