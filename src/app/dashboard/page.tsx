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
import { HabitPacksDialog } from "@/components/HabitPacksDialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Package } from "lucide-react";
import { getHabits, addHabit as addHabitService, updateHabit as updateHabitService, deleteHabit as deleteHabitService, setHabitsOrder } from "@/services/habitService";
import { Skeleton } from "@/components/ui/skeleton";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { JournalSection } from "@/components/JournalSection";

const POINTS_PER_HABIT = 10;
const getPointsForNextLevel = (level: number) => Math.round(100 * Math.pow(level, 1.5));

const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "You are what you repeatedly do. Excellence, then, is not an act, but a habit.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The journey of a thousand miles begins with a single step.",
  "Believe you can and you're halfway there.",
  "Don't watch the clock; do what it does. Keep going.",
  "Well done is better than well said.",
  "A year from now you may wish you had started today."
];

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [level, setLevel] = React.useState(1);
  const [points, setPoints] = React.useState(0);
  const [pointsToNextLevel, setPointsToNextLevel] = React.useState(getPointsForNextLevel(1));
  const [recentlyCompletedHabit, setRecentlyCompletedHabit] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace('/');
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  React.useEffect(() => {
    const fetchHabits = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const fetchedHabits = await getHabits(user.uid);
        setHabits(fetchedHabits);
      } catch(e) {
        console.error(e);
        toast({ title: "Error", description: "Could not load your habits.", variant: "destructive"})
      } finally {
        setIsLoading(false);
      }
    };
    fetchHabits();
  }, [user, toast]);

  const addHabit = async (habit: Omit<Habit, "id" | "completed">) => {
    if (!user) return;
    const newHabit = await addHabitService(user.uid, habit);
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
    if (!user) return;
    await deleteHabitService(user.uid, habitId);
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId));
  };

  const updateHabit = async (updatedHabit: Omit<Habit, "completed">) => {
    if (!user) return;
    await updateHabitService(user.uid, updatedHabit.id, updatedHabit);
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
        
        toast({
          title: "Great job!",
          description: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
        });

    } else if (wasCompleted && !isNowCompleted) {
        setPoints(p => Math.max(0, p - POINTS_PER_HABIT));
    }
  }
  
  const updateHabitAndCompletion = async (habitId: string, updatedHabitData: Partial<Habit>) => {
    if (!user) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const wasCompleted = isHabitCompleted(habit, selectedDate || new Date());

    await updateHabitService(user.uid, habitId, updatedHabitData);
    
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

  const handleHabitOrderChange = (orderedHabits: Habit[]) => {
     if (!user) return;
     setHabits(orderedHabits);
     setHabitsOrder(user.uid, orderedHabits.map(h => ({id: h.id, order: h.order ?? 0})));
  }

  const completedHabitsToday = habits.filter(h => isHabitCompleted(h, selectedDate || new Date())).map(h => h.name).join(', ');

  const habitCategories = React.useMemo(() => {
    const categories = new Set(habits.map(h => h.category).filter(Boolean) as string[]);
    return Array.from(categories);
  }, [habits]);


  if (!user || isLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background font-body items-center justify-center">
          <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
          </div>
      </div>
    )
  }

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
                  recentlyCompletedHabit={recentlyCompletedHabit}
                  onHabitOrderChange={handleHabitOrderChange}
                  categories={habitCategories}
              />
            </CardContent>
            <CardFooter>
            <AddHabitDialog addHabit={addHabit} categories={habitCategories}/>
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
          <JournalSection user={user} selectedDate={selectedDate || new Date()} />
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
  );
}
