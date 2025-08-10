"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AppHeader } from "@/components/Header";
import { DailyHabitList } from "@/components/DailyHabitList";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { ProgressTracker } from "@/components/ProgressTracker";
import { AiSuggestionDialog } from "@/components/AiSuggestionDialog";
import type { Habit } from "@/lib/types";
import { GamificationTracker } from "@/components/GamificationTracker";
import { DndContext, closestCenter, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { HabitPacksDialog } from "@/components/HabitPacksDialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Package } from "lucide-react";
import { getHabits, addHabit as addHabitService, updateHabit as updateHabitService, deleteHabit as deleteHabitService } from "@/services/habitService";
import { Skeleton } from "@/components/ui/skeleton";

const HARDCODED_USER_ID = '316472678534';
const POINTS_PER_HABIT = 10;
const getPointsForNextLevel = (level: number) => Math.round(100 * Math.pow(level, 1.5));

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [level, setLevel] = React.useState(1);
  const [points, setPoints] = React.useState(0);
  const [pointsToNextLevel, setPointsToNextLevel] = React.useState(getPointsForNextLevel(1));
  const [recentlyCompletedHabit, setRecentlyCompletedHabit] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        router.replace('/');
      }
    }
  }, [router]);
  
  React.useEffect(() => {
    const fetchHabits = async () => {
      setIsLoading(true);
      const fetchedHabits = await getHabits(HARDCODED_USER_ID);
      setHabits(fetchedHabits);
      setIsLoading(false);
    };
    fetchHabits();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const addHabit = async (habit: Omit<Habit, "id" | "completed">) => {
    const newHabit = await addHabitService(HARDCODED_USER_ID, habit);
    if(newHabit) {
      setHabits((prev) => [...prev, newHabit]);
    }
  };

  const addHabitPack = (packHabits: Omit<Habit, "id" | "completed">[]) => {
    packHabits.forEach(habit => {
      addHabit(habit);
    });
  }

  const deleteHabit = async (habitId: string) => {
    await deleteHabitService(HARDCODED_USER_ID, habitId);
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId));
  };

  const updateHabit = async (updatedHabit: Omit<Habit, "completed">) => {
    await updateHabitService(HARDCODED_USER_ID, updatedHabit.id, updatedHabit);
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
  
  const updateHabitAndCompletion = async (habitId: string, updatedHabitData: Partial<Habit>) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const wasCompleted = isHabitCompleted(habit, selectedDate || new Date());

    await updateHabitService(HARDCODED_USER_ID, habitId, updatedHabitData);
    
    setHabits(prev => prev.map(h => h.id === habitId ? {...h, ...updatedHabitData} : h));
    
    const updatedHabit = { ...habit, ...updatedHabitData };
    const isNowCompleted = isHabitCompleted(updatedHabit, selectedDate || new Date());

    handlePointsUpdate(wasCompleted, isNowCompleted, habitId);
  }

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const newCompleted = { ...habit.completed };
    newCompleted[dateKey] = newCompleted[dateKey] === 1 ? 0 : 1;
    
    updateHabitAndCompletion(habitId, { completed: newCompleted });
  };
  
  const updateHabitProgress = (habitId: string, date: Date, progress: number) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const newCompleted = { ...habit.completed };
    newCompleted[dateKey] = progress;
    
    updateHabitAndCompletion(habitId, { completed: newCompleted });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setHabits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        newOrder.forEach((habit, index) => {
          updateHabitService(HARDCODED_USER_ID, habit.id, { order: index });
        });
        return newOrder;
      });
    }
  };

  const completedHabitsToday = habits.filter(h => isHabitCompleted(h, selectedDate || new Date())).map(h => h.name).join(', ');

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} id="habit-dnd-root">
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
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <DailyHabitList
                      habits={habits}
                      selectedDate={selectedDate || new Date()}
                      toggleHabitCompletion={toggleHabitCompletion}
                      updateHabitProgress={updateHabitProgress}
                      deleteHabit={deleteHabit}
                      updateHabit={updateHabit}
                      recentlyCompletedHabit={recentlyCompletedHabit}
                  />
                )}
                </CardContent>
                <CardFooter>
                <AddHabitDialog addHabit={addHabit} />
                </CardFooter>
            </Card>
            
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
