"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { get7DayHistory } from "@/lib/habits"
import { useMemo } from "react"
import { CardDescription } from "@/components/ui/card"

type HabitProgressChartProps = {
  completions: string[]
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function HabitProgressChart({ completions }: HabitProgressChartProps) {
  const chartData = useMemo(() => get7DayHistory(completions), [completions])

  return (
    <div className="space-y-2">
      <CardDescription>Last 7 Days</CardDescription>
      <ChartContainer config={chartConfig} className="h-24 w-full">
        <BarChart 
          accessibilityLayer 
          data={chartData} 
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={5}
            axisLine={false}
            fontSize={12}
          />
          <YAxis hide={true} domain={[0, 1]} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel indicator="dot" />}
          />
          <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
