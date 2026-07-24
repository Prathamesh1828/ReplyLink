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

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function OverviewCharts() {
  const { theme } = useTheme()
  const primaryColor = theme === "dark" ? "#6D5EF7" : "#6D5EF7"
  const secondaryColor = theme === "dark" ? "#22C55E" : "#22C55E"
  
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{name: string, total: number}[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/dashboard/chart`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChartData(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    const skeletonHeights = [40, 65, 35, 75, 45, 80, 50];
    return (
      <div className="w-full h-[350px] flex items-end justify-between px-2 pb-8 pt-4">
        {skeletonHeights.map((height, i) => (
          <Skeleton key={i} className="w-[10%] rounded-t-sm" style={{ height: `${height}%` }} />
        ))}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
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
          dataKey="total"
          stroke={primaryColor}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorMessages)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
