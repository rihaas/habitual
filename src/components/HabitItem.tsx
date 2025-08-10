'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Minus, Plus, Star, GripVertical, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { EditHabitDialog } from './EditHabitDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Progress } from './ui/progress';

interface HabitItemProps {
  habit: Habit;
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date, microHabitId?: string) => void;
  updateHabitProgress: (habitId: string, date: Date, progress: number) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habit: Omit<Habit, 'completed'>) => void;
  showPoints?: boolean;
  dragHandleProps: any;
  categories: string[];
}

const priorityVariantMap: Record<Habit['priority'], 'destructive' | 'secondary' | 'default'> = {
  High: 'destructive',
  Medium: 'secondary',
  Low: 'default',
};

export default function HabitItem({ habit, selectedDate, toggleHabitCompletion, updateHabitProgress, deleteHabit, updateHabit, showPoints, dragHandleProps, categories }: HabitItemProps) {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const completionData = habit.completed[dateKey];

  const hasMicroHabits = habit.microHabits && habit.microHabits.length > 0;

  const isCompleted = React.useMemo(() => {
    if (hasMicroHabits) {
        const microHabitCompletions = typeof completionData === 'object' ? completionData : {};
        return habit.microHabits?.every(mh => microHabitCompletions[mh.id]);
    }
    if (habit.trackingType === 'Checkbox') {
      return completionData === 1;
    }
    if (habit.trackingType === 'Quantitative' && habit.goalValue) {
      return typeof completionData === 'number' && completionData >= habit.goalValue;
    }
    return false;
  }, [habit, completionData, hasMicroHabits]);

  const microHabitProgress = React.useMemo(() => {
    if (!hasMicroHabits) return 0;
    const microHabitCompletions = typeof completionData === 'object' ? completionData : {};
    const completedCount = Object.values(microHabitCompletions).filter(Boolean).length;
    return (completedCount / (habit.microHabits?.length || 1)) * 100;
  }, [habit.microHabits, completionData, hasMicroHabits]);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(false);
  const { toast } = useToast();

  const handleCheckboxChange = () => {
    toggleHabitCompletion(habit.id, selectedDate);
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.valueAsNumber;
    if (!isNaN(value) && value >= 0) {
      updateHabitProgress(habit.id, selectedDate, value);
    }
  }

  const progress = typeof completionData === 'number' ? completionData : 0;
  const incrementProgress = () => updateHabitProgress(habit.id, selectedDate, progress + 1);
  const decrementProgress = () => updateHabitProgress(habit.id, selectedDate, Math.max(0, progress - 1));


  const handleDelete = () => {
    deleteHabit(habit.id);
    toast({
        title: "Habit Deleted",
        description: `"${habit.name}" has been removed.`,
    });
  }

  const mainContent = (
      <div
        className={cn(
          'flex items-center space-x-3 p-2 rounded-lg transition-all relative group',
           hasMicroHabits ? '' : (isCompleted ? 'bg-primary/20' : 'bg-card hover:bg-accent')
        )}
      >
        <div {...dragHandleProps}>
          <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab group-hover:opacity-100 md:opacity-0 transition-opacity" />
        </div>

        {showPoints && (
            <div className="absolute top-1 right-10 flex items-center gap-1 text-yellow-500 animate-bounce">
                <Star className="w-3 h-3 fill-current" />
                <span className="font-bold text-xs">+10</span>
            </div>
        )}
        {habit.trackingType === 'Checkbox' && !hasMicroHabits ? (
            <Checkbox
                id={`habit-${habit.id}-${dateKey}`}
                checked={isCompleted}
                onCheckedChange={handleCheckboxChange}
                className="h-5 w-5"
                aria-label={`Mark '${habit.name}' as ${isCompleted ? 'incomplete' : 'complete'}`}
            />
        ) : habit.trackingType === 'Quantitative' ? (
           <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={decrementProgress}>
                    <Minus className="h-3 w-3" />
                </Button>
                <Input
                    type="number"
                    value={progress}
                    onChange={handleProgressChange}
                    className="w-14 h-8 text-center"
                    aria-label={`Progress for ${habit.name}`}
                />
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={incrementProgress}>
                    <Plus className="h-3 w-3" />
                </Button>
           </div>
        ) : null}
        
        <div className="flex-1">
          <label
            htmlFor={hasMicroHabits ? undefined : `habit-${habit.id}-${dateKey}`}
            className={cn(
              'text-sm font-medium leading-none',
              isCompleted && !hasMicroHabits ? 'line-through text-muted-foreground' : 'text-foreground',
              !hasMicroHabits && 'cursor-pointer'
            )}
          >
            {habit.name}
          </label>
           {habit.trackingType === 'Quantitative' && habit.goalValue && (
                <p className="text-xs text-muted-foreground">
                    Goal: {habit.goalValue} {habit.goalUnit}
                </p>
            )}
            {hasMicroHabits && (
                <Progress value={microHabitProgress} className="h-2 mt-1" />
            )}
        </div>
        {habit.category && <Badge variant="outline">{habit.category}</Badge>}
        <Badge variant={priorityVariantMap[habit.priority]} className="capitalize">
          {habit.priority}
        </Badge>
        
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the habit "{habit.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {hasMicroHabits && (
                 <ChevronDown className={cn("h-4 w-4 transition-transform", isCollapsibleOpen && "rotate-180")} />
            )}
        </div>
      </div>
  );

  return (
    <>
      {hasMicroHabits ? (
        <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen} className={cn('rounded-lg', isCompleted ? 'bg-primary/20' : 'bg-card hover:bg-accent')}>
            <CollapsibleTrigger asChild>
                {mainContent}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 px-4 pb-3 pl-14">
                {habit.microHabits?.map(mh => {
                    const microHabitCompletions = typeof completionData === 'object' ? completionData : {};
                    const isMicroHabitCompleted = microHabitCompletions[mh.id] || false;
                    return (
                        <div key={mh.id} className="flex items-center space-x-3">
                            <Checkbox
                                id={`microhabit-${mh.id}-${dateKey}`}
                                checked={isMicroHabitCompleted}
                                onCheckedChange={() => toggleHabitCompletion(habit.id, selectedDate, mh.id)}
                                className="h-5 w-5"
                            />
                            <label
                                htmlFor={`microhabit-${mh.id}-${dateKey}`}
                                className={cn(
                                'text-sm font-medium leading-none cursor-pointer',
                                isMicroHabitCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                                )}
                            >
                                {mh.name}
                            </label>
                        </div>
                    )
                })}
            </CollapsibleContent>
        </Collapsible>
      ) : (
        mainContent
      )}

      <EditHabitDialog
        habit={habit}
        updateHabit={updateHabit}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        categories={categories}
      />
    </>
  );
}
