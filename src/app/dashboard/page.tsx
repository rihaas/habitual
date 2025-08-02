"use client";

import * as React from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AppHeader } from "@/components/Header";
import { DailyHabitList } from "@/components/DailyHabitList";
import { WeeklyHabitList } from "@/components/WeeklyHabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { ProgressTracker } from "@/components/ProgressTracker";
import { AiSuggestionDialog } from "@/components/AiSuggestionDialog";
import type { Habit } from "@/lib/types";
import { initialHabits } from "@/lib/data";
import { WeeklyOverview } from "@/components/WeeklyOverview";

export default function DashboardPage() {
  const [habits, setHabits] = React.useState<Habit[]>(initialHabits);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const addHabit = (habit: Omit<Habit, "id" | "completed">) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      completed: {},
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId));
  };

  const updateHabit = (updatedHabit: Omit<Habit, "completed">) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === updatedHabit.id ? { ...habit, ...updatedHabit } : habit
      )
    );
  };

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId) {
          const newCompleted = { ...habit.completed };
          newCompleted[dateKey] = newCompleted[dateKey] === 1 ? 0 : 1;
          return { ...habit, completed: newCompleted };
        }
        return habit;
      })
    );
  };
  
  const updateHabitProgress = (habitId: string, date: Date, progress: number) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId) {
          const newCompleted = { ...habit.completed };
          newCompleted[dateKey] = progress;
          return { ...habit, completed: newCompleted };
        }
        return habit;
      })
    );
  };

  const isHabitCompleted = (habit: Habit, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const progress = habit.completed[dateKey];
    if (progress === undefined) return false;
    if (habit.trackingType === 'Checkbox') {
      return progress === 1;
    }
    if (habit.trackingType === 'Quantitative' && habit.goalValue) {
      return progress >= habit.goalValue;
    }
    return false;
  };

  const completedHabitsToday = habits.filter(h => isHabitCompleted(h, selectedDate || new Date())).map(h => h.name).join(', ');

  const weeklyHabits = habits.filter(h => h.frequency === 'Weekly');

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 flex flex-col gap-8">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                {format(selectedDate || new Date(), "eeee, MMMM do")}
              </CardTitle>
              <CardDescription>
                What will you accomplish today?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <DailyHabitList
                habits={habits}
                selectedDate={selectedDate || new Date()}
                toggleHabitCompletion={toggleHabitCompletion}
                updateHabitProgress={updateHabitProgress}
                deleteHabit={deleteHabit}
                updateHabit={updateHabit}
              />
              <WeeklyHabitList
                habits={weeklyHabits}
                selectedDate={selectedDate || new Date()}
                toggleHabitCompletion={toggleHabitCompletion}
                updateHabitProgress={updateHabitProgress}
                deleteHabit={deleteHabit}
                updateHabit={updateHabit}
              />
            </CardContent>
            <CardFooter>
              <AddHabitDialog addHabit={addHabit} />
            </CardFooter>
          </Card>
           <WeeklyOverview habits={habits} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>
          <ProgressTracker habits={habits} selectedDate={selectedDate || new Date()} />
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Need Inspiration?</CardTitle>
              <CardDescription>Get AI-powered habit suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
              <AiSuggestionDialog addHabit={addHabit} completedHabits={completedHabitsToday} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
