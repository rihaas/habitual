'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Habit } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

interface ProgressTrackerProps {
  habits: Habit[];
  selectedDate: Date;
}

export function ProgressTracker({ habits, selectedDate }: ProgressTrackerProps) {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  const applicableHabits = habits.filter(h => {
    // This logic should match HabitList's filtering logic
    if (h.frequency === 'Daily') return true;
    // A more complex logic for weekly would be needed for accuracy
    if (h.frequency === 'Weekly') return true; 
    return false;
  });

  const completedCount = applicableHabits.filter(h => h.completed[dateKey]).length;
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
