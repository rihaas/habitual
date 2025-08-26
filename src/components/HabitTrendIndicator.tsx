"use client";

import * as React from "react";
import { format, subDays } from "date-fns";
import type { Habit } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, ArrowRight, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitTrendIndicatorProps {
  habit: Habit;
}

const isHabitCompletedOnDate = (habit: Habit, dateKey: string): boolean => {
  const completionData = habit.completed[dateKey];
  if (completionData === undefined) return false;

  if (habit.microHabits && habit.microHabits.length > 0) {
    if (typeof completionData !== 'object') return false;
    return habit.microHabits.every(mh => completionData[mh.id]);
  }
  if (habit.trackingType === 'Checkbox') {
    return completionData === 1;
  }
  if (habit.trackingType === 'Quantitative' && habit.goalValue) {
    return typeof completionData === 'number' && completionData >= habit.goalValue;
  }
  return false;
};

export function HabitTrendIndicator({ habit }: HabitTrendIndicatorProps) {
  const trend = React.useMemo(() => {
    const today = new Date();
    let completedDays = 0;
    const totalDays = 30;

    for (let i = 0; i < totalDays; i++) {
      const date = subDays(today, i);
      const dateKey = format(date, "yyyy-MM-dd");
      if (isHabitCompletedOnDate(habit, dateKey)) {
        completedDays++;
      }
    }

    const completionRate = completedDays / totalDays;

    if (completionRate >= 2 / 3) {
      return "Accelerating";
    }
    if (completionRate >= 1 / 3) {
      return "Cruising";
    }
    return "Breaking";
  }, [habit.completed]);

  const trendInfo = {
    Accelerating: {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      label: "Accelerating",
      description: "For the whole month, you're completing the habit at a frequency of 2 out of 3 days or more. Accelerating is giving it all for a specific reason. It could be a season of your life where you need to focus on getting something done and you just optimize everything in your life for that one purpose."
    },
    Cruising: {
      icon: <ArrowRight className="h-4 w-4 text-yellow-500" />,
      label: "Cruising",
      description: "For the whole month, you're completing the habit at a frequency of between 1 to 2 out of every 3 days. This is maintenance phase. You're not putting in enough effort into creating long term sustainable goals. You may want to scale the goal back or make it easier to encourage more compliance."
    },
    Breaking: {
      icon: <TrendingDown className="h-4 w-4 text-red-500" />,
      label: "Breaking",
      description: "For the whole month, you're completing the habit at a frequncy of less than 1 out of 3 days. You're slowing down or being inconsistent. If this is a desirable habit, then the habit may be too hard or you have too much going on in life to work on this habit. If this is a bad habit, then staying in the breaking phase may be desirable. Breaking does not equal failure. The first part of habit change is to become aware of your habits.  There is no need to change anything at first. The goal is to simply notice what is actually going on. Observe your thoughts and actions without judgment or internal criticism. The idea is to get you to recognize your habits and acknowledge the cues that trigger them. This will make it easier to discover which habits you should change and respond in a way that benefits you."
    },
  };

  const currentTrend = trendInfo[trend];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{currentTrend.icon}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="top" align="center">
            <h4 className="font-bold mb-2 flex items-center gap-2">{currentTrend.icon} {currentTrend.label}</h4>
            <p className="text-sm text-muted-foreground">{currentTrend.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
