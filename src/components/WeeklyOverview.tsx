"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { subDays, format } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Habit } from "@/lib/types"

interface WeeklyOverviewProps {
  habits: Habit[]
}

const isHabitCompleted = (habit: Habit, dateKey: string) => {
    const progress = habit.completed[dateKey];
    if (progress === undefined) return false;

    if (habit.trackingType === 'Checkbox') {
      return progress === 1;
    }
    if (habit.trackingType === 'Quantitative' && habit.goalValue) {
      return progress >= habit.goalValue;
    }
    return false;
}

export function WeeklyOverview({ habits }: WeeklyOverviewProps) {
  const chartData = React.useMemo(() => {
    const today = new Date()
    const data = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i)
      const dateKey = format(date, "yyyy-MM-dd")
      const dayName = format(date, "EEE")
      
      const completedCount = habits.filter(
        (habit) => isHabitCompleted(habit, dateKey)
      ).length

      return {
        date: dayName,
        completed: completedCount,
      }
    })
    return data
  }, [habits])

  const chartConfig = {
    completed: {
      label: "Habits Completed",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Overview</CardTitle>
        <CardDescription>Your habit completion for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
