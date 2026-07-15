"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useTheme } from "next-themes"

const data = [
  { name: "Jan 1", messages: 120, leads: 10 },
  { name: "Jan 5", messages: 300, leads: 40 },
  { name: "Jan 10", messages: 250, leads: 35 },
  { name: "Jan 15", messages: 400, leads: 50 },
  { name: "Jan 20", messages: 350, leads: 45 },
  { name: "Jan 25", messages: 600, leads: 90 },
  { name: "Jan 30", messages: 550, leads: 85 },
]

export function OverviewCharts() {
  const { theme } = useTheme()
  const primaryColor = theme === "dark" ? "#6D5EF7" : "#6D5EF7"
  const secondaryColor = theme === "dark" ? "#22C55E" : "#22C55E"

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === "dark" ? "#111827" : "#ffffff",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
          itemStyle={{ color: "var(--foreground)" }}
        />
        <Area
          type="monotone"
          dataKey="messages"
          stroke={primaryColor}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorMessages)"
        />
        <Area
          type="monotone"
          dataKey="leads"
          stroke={secondaryColor}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorLeads)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
