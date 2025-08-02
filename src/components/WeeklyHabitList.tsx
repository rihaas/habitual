'use client';

import * as React from 'react';
import { isThisWeek } from 'date-fns';
import type { Habit } from '@/lib/types';
import HabitItem from './HabitItem';
import { Dices } from 'lucide-react';
import { Separator } from './ui/separator';

interface WeeklyHabitListProps {
  habits: Habit[];
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  updateHabitProgress: (habitId: string, date: Date, progress: number) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habit: Omit<Habit, "completed">) => void;
}

export function WeeklyHabitList({ habits, selectedDate, toggleHabitCompletion, updateHabitProgress, deleteHabit, updateHabit }: WeeklyHabitListProps) {
  
  const weeklyHabitsForSelectedDate = habits.filter(habit => 
    isThisWeek(selectedDate, { weekStartsOn: 1 /* Monday */ })
  );
  
  return (
    <div className="space-y-4">
        <Separator />
        <h3 className="text-xl font-headline font-semibold text-foreground pt-2">Weekly Habits</h3>
        {habits.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                <Dices className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No Weekly Habits Yet</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Click "Add New Habit" to create a weekly habit.
                </p>
            </div>
        ) : !isThisWeek(selectedDate, { weekStartsOn: 1 }) ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mt-1">
                    Weekly habits are not shown for dates outside of the current week.
                </p>
            </div>
        ) : (
            <div className="space-y-3">
                {weeklyHabitsForSelectedDate.map((habit) => (
                    <HabitItem
                        key={habit.id}
                        habit={habit}
                        selectedDate={selectedDate}
                        toggleHabitCompletion={toggleHabitCompletion}
                        updateHabitProgress={updateHabitProgress}
                        deleteHabit={deleteHabit}
                        updateHabit={updateHabit}
                    />
                ))}
            </div>
        )}
    </div>
  );
}
