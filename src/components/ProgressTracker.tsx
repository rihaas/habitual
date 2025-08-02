'use client';

import * as React from 'react';
import { format, differenceInDays, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Habit } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

interface ProgressTrackerProps {
  habits: Habit[];
  selectedDate: Date;
}

const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function ProgressTracker({ habits, selectedDate }: ProgressTrackerProps) {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const dayOfWeek = dayMap[selectedDate.getDay()];
  
  const applicableHabits = habits.filter(h => {
    switch (h.frequency) {
      case 'Daily':
        return true;
      case 'Weekly':
        return true;
      case 'Custom':
        return h.days?.includes(dayOfWeek) ?? false;
      case 'Every-n-days':
        if (!h.interval || !h.startDate) return false;
        const start = parseISO(h.startDate);
        const diff = differenceInDays(selectedDate, start);
        return diff >= 0 && diff % h.interval === 0;
      case 'N-times-week':
        // N-times-week habits are always applicable to be shown in progress
        // until they are completed for the week.
         return true;
      default:
        return false;
    }
  });

  const completedCount = applicableHabits.filter(h => {
      if (h.frequency === 'N-times-week' && h.timesPerWeek) {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        let completedInWeek = 0;
        for (let d = weekStart; d <= weekEnd; d.setDate(d.getDate() + 1)) {
            const currentKey = format(d, 'yyyy-MM-dd');
            if (h.completed[currentKey]) {
                completedInWeek++;
            }
        }
        return completedInWeek >= h.timesPerWeek;
      }
      return h.completed[dateKey]
    }).length;

  const totalCount = applicableHabits.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Daily Progress</CardTitle>
        <CardDescription>You're on your way!</CardDescription>
      </CardHeader>
      <CardContent>
        {totalCount > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-muted-foreground">
              <p className="text-sm font-medium">Today's Completion</p>
              <p className="text-sm font-bold">{completedCount} / {totalCount}</p>
            </div>
            <Progress value={progressPercentage} aria-label={`${Math.round(progressPercentage)}% complete`} />
            {progressPercentage === 100 && (
                <div className="flex items-center text-green-600 font-semibold p-3 bg-green-100 rounded-md">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    <p>Great job! All habits completed!</p>
                </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No habits scheduled for today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
