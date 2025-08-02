'use client';

import * as React from 'react';
import type { Habit } from '@/lib/types';
import HabitItem from './HabitItem';
import { Dices } from 'lucide-react';

interface DailyHabitListProps {
  habits: Habit[];
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habit: Omit<Habit, "completed">) => void;
}

export function DailyHabitList({ habits, selectedDate, toggleHabitCompletion, deleteHabit, updateHabit }: DailyHabitListProps) {
  return (
    <div className="space-y-4">
        <h3 className="text-xl font-headline font-semibold text-foreground">Daily Habits</h3>
        {habits.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                <Dices className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No Daily Habits Yet</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                Click "Add New Habit" to create a daily habit.
                </p>
            </div>
        ) : (
            <div className="space-y-3">
                {habits.map((habit) => (
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