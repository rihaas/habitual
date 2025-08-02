'use client';

import * as React from 'react';
import type { Habit, TimeOfDay } from '@/lib/types';
import HabitItem from './HabitItem';
import { Dices, Sun, Moon, Sunset, Clock } from 'lucide-react';
import { format, differenceInDays, startOfWeek, endOfWeek, parseISO, addDays } from 'date-fns';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DailyHabitListProps {
  habits: Habit[];
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  updateHabitProgress: (habitId: string, date: Date, progress: number) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habit: Omit<Habit, "completed">) => void;
  recentlyCompletedHabit: string | null;
}

const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const timeOfDayOrder: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

const timeOfDayIcons: Record<TimeOfDay, React.ReactNode> = {
    Morning: <Sun className="w-5 h-5" />,
    Afternoon: <Sunset className="w-5 h-5" />,
    Evening: <Moon className="w-5 h-5" />,
    Anytime: <Clock className="w-5 h-5" />,
};

const SortableHabitItem = (props: React.ComponentProps<typeof HabitItem>) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.habit.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <HabitItem {...props} />
        </div>
    );
}


export function DailyHabitList({ habits, selectedDate, toggleHabitCompletion, updateHabitProgress, deleteHabit, updateHabit, recentlyCompletedHabit }: DailyHabitListProps) {
  
  const dayOfWeek = dayMap[selectedDate.getDay()];

  const getApplicableHabits = React.useCallback((habits: Habit[], date: Date) => {
    const dayOfWeek = dayMap[date.getDay()];
    return habits.filter(h => {
        if (h.frequency === 'Daily') return true;
        if (h.frequency === 'Custom' && h.days?.includes(dayOfWeek)) return true;
        if (h.frequency === 'Every-n-days' && h.interval && h.startDate) {
            const start = parseISO(h.startDate);
            const diff = differenceInDays(date, start);
            return diff >= 0 && diff % h.interval === 0;
        }
        if (h.frequency === 'N-times-week' && h.timesPerWeek) {
            const weekStart = startOfWeek(date, { weekStartsOn: 1 }); 
            const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
            
            let completedInWeek = 0;
            for (let d = weekStart; d <= weekEnd; d = addDays(d, 1)) {
                const dateKey = format(d, 'yyyy-MM-dd');
                const progress = h.completed[dateKey];
                if (progress !== undefined) {
                    if (h.trackingType === 'Checkbox' && progress === 1) {
                        completedInWeek++;
                    } else if (h.trackingType === 'Quantitative' && h.goalValue && progress >= h.goalValue) {
                        completedInWeek++;
                    }
                }
            }
            return completedInWeek < h.timesPerWeek;
        }
        return false;
      });
  }, [selectedDate]);

  const applicableHabits = getApplicableHabits(habits, selectedDate);
  
  const groupedHabits = React.useMemo(() => {
    const groups: Partial<Record<TimeOfDay, Habit[]>> = {};
    for (const habit of applicableHabits) {
        const time = habit.timeOfDay || 'Anytime';
        if (!groups[time]) {
            groups[time] = [];
        }
        groups[time]!.push(habit);
    }
    return groups;
  }, [applicableHabits]);

  return (
    <div className="space-y-6">
        {applicableHabits.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                <Dices className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No Habits For Today</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                 Enjoy your day or add a new habit!
                </p>
            </div>
        ) : (
            <SortableContext items={applicableHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">
                    {timeOfDayOrder.map(timeOfDay => {
                        const habitsInGroup = groupedHabits[timeOfDay];
                        if (!habitsInGroup || habitsInGroup.length === 0) return null;

                        return (
                            <div key={timeOfDay}>
                                <h3 className="text-lg font-headline font-semibold text-foreground mb-3 flex items-center gap-2">
                                    {timeOfDayIcons[timeOfDay]}
                                    {timeOfDay}
                                </h3>
                                <div className="space-y-3">
                                    {habitsInGroup.map((habit) => (
                                        <SortableHabitItem
                                            key={habit.id}
                                            habit={habit}
                                            selectedDate={selectedDate}
                                            toggleHabitCompletion={toggleHabitCompletion}
                                            updateHabitProgress={updateHabitProgress}
                                            deleteHabit={deleteHabit}
                                            updateHabit={updateHabit}
                                            showPoints={recentlyCompletedHabit === habit.id}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </SortableContext>
        )}
    </div>
  );
}
