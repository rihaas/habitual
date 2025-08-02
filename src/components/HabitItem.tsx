'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HabitItemProps {
  habit: Habit;
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
}

const priorityVariantMap: Record<Habit['priority'], 'destructive' | 'secondary' | 'default'> = {
  High: 'destructive',
  Medium: 'secondary',
  Low: 'default',
};

export default function HabitItem({ habit, selectedDate, toggleHabitCompletion }: HabitItemProps) {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isCompleted = habit.completed[dateKey] || false;

  const handleCheckedChange = () => {
    toggleHabitCompletion(habit.id, selectedDate);
  };

  return (
    <div
      className={cn(
        'flex items-center space-x-4 p-4 rounded-lg transition-all',
        isCompleted ? 'bg-primary/20' : 'bg-card hover:bg-accent'
      )}
    >
      <Checkbox
        id={`habit-${habit.id}-${dateKey}`}
        checked={isCompleted}
        onCheckedChange={handleCheckedChange}
        className="h-6 w-6"
        aria-label={`Mark '${habit.name}' as ${isCompleted ? 'incomplete' : 'complete'}`}
      />
      <label
        htmlFor={`habit-${habit.id}-${dateKey}`}
        className={cn(
          'flex-1 text-base font-medium leading-none cursor-pointer',
          isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
        )}
      >
        {habit.name}
      </label>
      <Badge variant={priorityVariantMap[habit.priority]} className="capitalize">
        {habit.priority}
      </Badge>
    </div>
  );
}
