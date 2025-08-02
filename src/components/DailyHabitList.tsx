'use client';

import * as React from 'react';
import type { Habit } from '@/lib/types';
import HabitItem from './HabitItem';
import { Dices } from 'lucide-react';
import { format } from 'date-fns';

interface DailyHabitListProps {
  habits: Habit[];
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habit: Omit<Habit, "completed">) => void;
}

const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function DailyHabitList({ habits, selectedDate, toggleHabitCompletion, deleteHabit, updateHabit }: DailyHabitListProps) {
  
  const dayOfWeek = dayMap[selectedDate.getDay()];

  const dailyHabits = habits.filter(h => {
    if (h.frequency === 'Daily') return true;
    if (h.frequency === 'Custom' && h.days?.includes(dayOfWeek)) return true;
    return false;
  });

  return (
    <div className="space-y-4">
        <h3 className="text-xl font-headline font-semibold text-foreground">Today's Habits</h3>
        {dailyHabits.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                <Dices className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No Habits For Today</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                 Enjoy your day or add a new habit!
                </p>
            </div>
        ) : (
            <div className="space-y-3">
                {dailyHabits.map((habit) => (
                    <HabitItem
                        key={habit.id}
                        habit={habit}
                        selectedDate={selectedDate}
                        toggleHabitCompletion={toggleHabitCompletion}
                        deleteHabit={deleteHabit}
                        updateHabit={updateHabit}
                    />
                ))}
            </div>
        )}
    </div>
  );
}
