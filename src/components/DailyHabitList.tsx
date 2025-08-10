'use client';

import * as React from 'react';
import type { Habit, TimeOfDay } from '@/lib/types';
import HabitItem from './HabitItem';
import { Dices, Sun, Moon, Sunset, Clock, Folder } from 'lucide-react';
import { format, differenceInDays, startOfWeek, endOfWeek, parseISO, addDays } from 'date-fns';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


interface DailyHabitListProps {
  habits: Habit[];
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  updateHabitProgress: (habitId: string, date: Date, progress: number) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habit: Omit<Habit, "completed">) => void;
  recentlyCompletedHabit: string | null;
  onHabitOrderChange: (orderedHabits: Habit[]) => void;
  categories: string[];
}

const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const timeOfDayOrder: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

const timeOfDayIcons: Record<TimeOfDay, React.ReactNode> = {
    Morning: <Sun className="w-5 h-5" />,
    Afternoon: <Sunset className="w-5 h-5" />,
    Evening: <Moon className="w-5 h-5" />,
    Anytime: <Clock className="w-5 h-5" />,
};

const SortableHabitItem = (props: Omit<React.ComponentProps<typeof HabitItem>, 'dragHandleProps'> & { categories: string[] }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.habit.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    const dragHandleProps = {
        ...attributes,
        ...listeners,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <HabitItem {...props} dragHandleProps={dragHandleProps} />
        </div>
    );
}

export function DailyHabitList({ habits, selectedDate, toggleHabitCompletion, updateHabitProgress, deleteHabit, updateHabit, recentlyCompletedHabit, onHabitOrderChange, categories }: DailyHabitListProps) {
  
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  const getApplicableHabits = React.useCallback((h: Habit[], date: Date, category: string) => {
    const dayOfWeek = dayMap[date.getDay()];
    return h.filter(habit => {
        if (category !== 'All' && habit.category !== category) return false;

        if (habit.frequency === 'Daily') return true;
        if (habit.frequency === 'Custom' && habit.days?.includes(dayOfWeek)) return true;
        if (habit.frequency === 'Every-n-days' && habit.interval && habit.startDate) {
            const start = parseISO(habit.startDate);
            const diff = differenceInDays(date, start);
            return diff >= 0 && diff % habit.interval === 0;
        }
        if (habit.frequency === 'N-times-week' && habit.timesPerWeek) {
            const weekStart = startOfWeek(date, { weekStartsOn: 1 }); 
            const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
            
            let completedInWeek = 0;
            for (let d = weekStart; d <= weekEnd; d = addDays(d, 1)) {
                const dateKey = format(d, 'yyyy-MM-dd');
                const progress = habit.completed[dateKey];
                if (progress !== undefined) {
                    if (habit.trackingType === 'Checkbox' && progress === 1) {
                        completedInWeek++;
                    } else if (habit.trackingType === 'Quantitative' && habit.goalValue && progress >= habit.goalValue) {
                        completedInWeek++;
                    }
                }
            }
            return completedInWeek < habit.timesPerWeek;
        }
        return false;
      });
  }, []);

  const applicableHabits = getApplicableHabits(habits, selectedDate, categoryFilter);
  
  const groupedHabits = React.useMemo(() => {
    const groups: Partial<Record<TimeOfDay, Habit[]>> = {};
    for (const habit of applicableHabits) {
        const time = habit.timeOfDay || 'Anytime';
        if (!groups[time]) {
            groups[time] = [];
        }
        groups[time]!.push(habit);
    }
    // ensure order from DB is respected
    for (const time in groups) {
      groups[time as TimeOfDay]?.sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
    }
    return groups;
  }, [applicableHabits]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        const activeHabit = habits.find(h => h.id === active.id);
        const overHabit = habits.find(h => h.id === over.id);

        if (activeHabit?.timeOfDay !== overHabit?.timeOfDay) {
            // Prevent dragging between different time-of-day groups
            return;
        }
      
        const oldIndex = habits.findIndex((item) => item.id === active.id);
        const newIndex = habits.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(habits, oldIndex, newIndex);
        
        const updatedHabitsWithOrder = newOrder.map((habit, index) => ({...habit, order: index}));
        
        onHabitOrderChange(updatedHabitsWithOrder);
    }
  };


  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} id="habit-dnd-root">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
          {applicableHabits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                  <Dices className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">No Habits For Today</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                  Enjoy your day, try a different filter, or add a new habit!
                  </p>
              </div>
          ) : (
              timeOfDayOrder.map(timeOfDay => {
                  const habitsInGroup = groupedHabits[timeOfDay];
                  if (!habitsInGroup || habitsInGroup.length === 0) return null;

                  return (
                      <div key={timeOfDay}>
                          <h3 className="text-lg font-headline font-semibold text-foreground mb-3 flex items-center gap-2">
                              {timeOfDayIcons[timeOfDay]}
                              {timeOfDay}
                          </h3>
                           <SortableContext items={habitsInGroup.map(h => h.id)} strategy={verticalListSortingStrategy}>
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
                                          categories={categories}
                                      />
                                  ))}
                              </div>
                          </SortableContext>
                      </div>
                  )
              })
          )}
      </div>
    </DndContext>
  );
}
