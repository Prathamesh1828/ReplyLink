"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useTheme } from "next-themes"
import {
  ArrowUpRight,
  TrendingUp,
  MessageCircle,
  Users,
  MousePointerClick,
  Clock,
} from "lucide-react"

const messageData = [
  { day: "Mon", messages: 120, replies: 115 },
  { day: "Tue", messages: 280, replies: 270 },
  { day: "Wed", messages: 195, replies: 190 },
  { day: "Thu", messages: 350, replies: 340 },
  { day: "Fri", messages: 410, replies: 395 },
  { day: "Sat", messages: 180, replies: 175 },
  { day: "Sun", messages: 90, replies: 88 },
]

const sourceData = [
  { name: "DMs", value: 45 },
  { name: "Comments", value: 35 },
  { name: "Story Replies", value: 20 },
]

const COLORS = ["#6D5EF7", "#22C55E", "#F59E0B"]

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  volume: Math.floor(Math.random() * 60) + 5,
}))

const stats = [
  { title: "Avg Response Time", value: "1.2s", change: "-0.3s", icon: Clock, trend: "up" },
  { title: "Reply Rate", value: "98.4%", change: "+1.2%", icon: MessageCircle, trend: "up" },
  { title: "Leads This Week", value: "142", change: "+23.5%", icon: Users, trend: "up" },
  { title: "Conversion Rate", value: "8.7%", change: "+2.1%", icon: MousePointerClick, trend: "up" },
]

export default function AnalyticsPage() {
  const { theme } = useTheme()

  return (
    <div className="flex-1 space-y-6">
      <div className="pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Track performance metrics and message trends.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs flex items-center text-green-500">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stat.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Messages vs Replies</CardTitle>
            <CardDescription>Weekly message volume and AI reply count.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={messageData}>
                <defs>
                  <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D5EF7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6D5EF7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#111827" : "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                />
                <Area type="monotone" dataKey="messages" stroke="#6D5EF7" strokeWidth={2} fillOpacity={1} fill="url(#colorMsg)" />
                <Area type="monotone" dataKey="replies" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorReply)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Message Sources</CardTitle>
            <CardDescription>Breakdown of message origins.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={5}
                >
                  {sourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardContent className="pt-0 flex items-center justify-center gap-4">
            {sourceData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                {item.name}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hourly Message Volume</CardTitle>
          <CardDescription>Best times for engagement.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" stroke="#888" fontSize={10} tickLine={false} axisLine={false} interval={2} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#111827" : "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              />
              <Bar dataKey="volume" fill="#6D5EF7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
