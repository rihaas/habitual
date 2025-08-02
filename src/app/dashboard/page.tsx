"use client";

import * as React from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AppHeader } from "@/components/Header";
import { DailyHabitList } from "@/components/DailyHabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { ProgressTracker } from "@/components/ProgressTracker";
import { AiSuggestionDialog } from "@/components/AiSuggestionDialog";
import type { Habit } from "@/lib/types";
import { initialHabits } from "@/lib/data";
import { WeeklyOverview } from "@/components/WeeklyOverview";
import { GamificationTracker } from "@/components/GamificationTracker";
import { DndContext, closestCenter, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { HabitPacksDialog } from "@/components/HabitPacksDialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Package } from "lucide-react";

const POINTS_PER_HABIT = 10;
const getPointsForNextLevel = (level: number) => Math.round(100 * Math.pow(level, 1.5));

export default function DashboardPage() {
  const [habits, setHabits] = React.useState<Habit[]>(initialHabits);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [level, setLevel] = React.useState(1);
  const [points, setPoints] = React.useState(0);
  const [pointsToNextLevel, setPointsToNextLevel] = React.useState(getPointsForNextLevel(1));
  const [recentlyCompletedHabit, setRecentlyCompletedHabit] = React.useState<string | null>(null);

  // Define sensors for DndContext
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );


  const addHabit = (habit: Omit<Habit, "id" | "completed">) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      completed: {},
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const addHabitPack = (packHabits: Omit<Habit, "id" | "completed">[]) => {
    const newHabits = packHabits.map(habit => ({
        ...habit,
        id: crypto.randomUUID(),
        completed: {}
    }));
    setHabits(prev => [...prev, ...newHabits]);
  }

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
  
  const handlePointsUpdate = (wasCompleted: boolean, isNowCompleted: boolean, habitId: string) => {
    if (!wasCompleted && isNowCompleted) {
        setPoints(p => {
            const newPoints = p + POINTS_PER_HABIT;
            if (newPoints >= pointsToNextLevel) {
                const newLevel = level + 1;
                setLevel(newLevel);
                setPointsToNextLevel(getPointsForNextLevel(newLevel));
            }
            return newPoints;
        });
        setRecentlyCompletedHabit(habitId);
        setTimeout(() => setRecentlyCompletedHabit(null), 1500);
    } else if (wasCompleted && !isNowCompleted) {
        setPoints(p => Math.max(0, p - POINTS_PER_HABIT));
    }
  }

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setHabits((prevHabits) => {
      const habit = prevHabits.find(h => h.id === habitId);
      if (!habit) return prevHabits;
      
      const wasCompleted = isHabitCompleted(habit, date);
      
      const newHabits = prevHabits.map((h) => {
        if (h.id === habitId) {
          const newCompleted = { ...h.completed };
          newCompleted[dateKey] = newCompleted[dateKey] === 1 ? 0 : 1;
          return { ...h, completed: newCompleted };
        }
        return h;
      });

      const updatedHabit = newHabits.find(h => h.id === habitId)!;
      const isNowCompleted = isHabitCompleted(updatedHabit, date);
      handlePointsUpdate(wasCompleted, isNowCompleted, habitId);

      return newHabits;
    });
  };
  
  const updateHabitProgress = (habitId: string, date: Date, progress: number) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setHabits((prevHabits) => {
      const habit = prevHabits.find(h => h.id === habitId);
      if (!habit) return prevHabits;

      const wasCompleted = isHabitCompleted(habit, date);

      const newHabits = prevHabits.map((h) => {
        if (h.id === habitId) {
          const newCompleted = { ...h.completed };
          newCompleted[dateKey] = progress;
          return { ...h, completed: newCompleted };
        }
        return h;
      });

      const updatedHabit = newHabits.find(h => h.id === habitId)!;
      const isNowCompleted = isHabitCompleted(updatedHabit, date);
      handlePointsUpdate(wasCompleted, isNowCompleted, habitId);
      
      return newHabits;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setHabits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const completedHabitsToday = habits.filter(h => isHabitCompleted(h, selectedDate || new Date())).map(h => h.name).join(', ');

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} id="habit-dnd">
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
                    recentlyCompletedHabit={recentlyCompletedHabit}
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
            <GamificationTracker level={level} points={points} pointsToNextLevel={pointsToNextLevel} />
            <ProgressTracker habits={habits} selectedDate={selectedDate || new Date()} />
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Need Inspiration?</CardTitle>
                <CardDescription>Get AI-powered suggestions or try a habit pack.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                  <AiSuggestionDialog addHabit={addHabit} completedHabits={completedHabitsToday}>
                     <Button variant="outline" className="w-full">
                        <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                        AI Suggestions
                      </Button>
                  </AiSuggestionDialog>
                  <HabitPacksDialog addHabitPack={addHabitPack}>
                     <Button variant="outline" className="w-full">
                        <Package className="mr-2 h-4 w-4 text-blue-500" />
                        Habit Packs
                      </Button>
                  </HabitPacksDialog>
                </CardContent>
            </Card>
            </div>
        </main>
        </div>
    </DndContext>
  );
}
