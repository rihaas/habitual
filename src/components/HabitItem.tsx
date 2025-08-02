'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Minus, Plus, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface HabitItemProps {
  habit: Habit;
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  updateHabitProgress: (habitId: string, date: Date, progress: number) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habit: Omit<Habit, 'completed'>) => void;
  showPoints?: boolean;
}

const priorityVariantMap: Record<Habit['priority'], 'destructive' | 'secondary' | 'default'> = {
  High: 'destructive',
  Medium: 'secondary',
  Low: 'default',
};

export default function HabitItem({ habit, selectedDate, toggleHabitCompletion, updateHabitProgress, deleteHabit, updateHabit, showPoints }: HabitItemProps) {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const progress = habit.completed[dateKey] ?? 0;
  
  const isCompleted = React.useMemo(() => {
    if (habit.trackingType === 'Checkbox') {
      return progress === 1;
    }
    if (habit.trackingType === 'Quantitative' && habit.goalValue) {
      return progress >= habit.goalValue;
    }
    return false;
  }, [habit, progress]);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
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

  const incrementProgress = () => updateHabitProgress(habit.id, selectedDate, progress + 1);
  const decrementProgress = () => updateHabitProgress(habit.id, selectedDate, Math.max(0, progress - 1));


  const handleDelete = () => {
    deleteHabit(habit.id);
    toast({
        title: "Habit Deleted",
        description: `"${habit.name}" has been removed.`,
    });
  }

  return (
    <>
      <div
        className={cn(
          'flex items-center space-x-4 p-4 rounded-lg transition-all relative',
          isCompleted ? 'bg-primary/20' : 'bg-card hover:bg-accent'
        )}
      >
        {showPoints && (
            <div className="absolute top-2 right-12 flex items-center gap-1 text-yellow-500 animate-bounce">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-sm">+10</span>
            </div>
        )}
        {habit.trackingType === 'Checkbox' ? (
            <Checkbox
                id={`habit-${habit.id}-${dateKey}`}
                checked={isCompleted}
                onCheckedChange={handleCheckboxChange}
                className="h-6 w-6"
                aria-label={`Mark '${habit.name}' as ${isCompleted ? 'incomplete' : 'complete'}`}
            />
        ) : (
           <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={decrementProgress}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Input
                    type="number"
                    value={progress}
                    onChange={handleProgressChange}
                    className="w-16 h-9 text-center"
                    aria-label={`Progress for ${habit.name}`}
                />
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={incrementProgress}>
                    <Plus className="h-4 w-4" />
                </Button>
           </div>
        )}
        <div className="flex-1">
          <label
            htmlFor={`habit-${habit.id}-${dateKey}`}
            className={cn(
              'text-base font-medium leading-none cursor-pointer',
              isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
            )}
          >
            {habit.name}
          </label>
           {habit.trackingType === 'Quantitative' && habit.goalValue && (
                <p className="text-sm text-muted-foreground">
                    Goal: {habit.goalValue} {habit.goalUnit}
                </p>
            )}
        </div>
        <Badge variant={priorityVariantMap[habit.priority]} className="capitalize">
          {habit.priority}
        </Badge>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
                    Edit
                </DropdownMenuItem>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Delete
                        </DropdownMenuItem>
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
            </DropdownMenuContent>
        </DropdownMenu>

      </div>
      <EditHabitDialog
        habit={habit}
        updateHabit={updateHabit}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
      />
    </>
  );
}
