'use client';

import * as React from 'react';
import { isThisWeek, isToday, parseISO, format } from 'date-fns';
import type { Habit } from '@/lib/types';
import HabitItem from './HabitItem';
import { Dices } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habit: Omit<Habit, "completed">) => void;
}

export default function HabitList({ habits, selectedDate, toggleHabitCompletion, deleteHabit, updateHabit }: HabitListProps) {
  const isDateToday = isToday(selectedDate);

  const filteredHabits = habits.filter(habit => {
    if (habit.frequency === 'Daily') {
      return true;
    }
    if (habit.frequency === 'Weekly') {
      // Show weekly habits if the selected date is within the current week.
      // This is a simplification; a more robust implementation might be needed.
      return isThisWeek(selectedDate, { weekStartsOn: 1 /* Monday */ });
    }
    return false;
  });

  if (filteredHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
        <Dices className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground">No Habits Yet</h3>
        <p className="text-muted-foreground mt-2">
          Click the "Add New Habit" button below to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredHabits.map((habit) => (
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
  );
}
