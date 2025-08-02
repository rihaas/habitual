'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
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


interface HabitItemProps {
  habit: Habit;
  selectedDate: Date;
  toggleHabitCompletion: (habitId: string, date: Date) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habit: Omit<Habit, 'completed'>) => void;
}

const priorityVariantMap: Record<Habit['priority'], 'destructive' | 'secondary' | 'default'> = {
  High: 'destructive',
  Medium: 'secondary',
  Low: 'default',
};

export default function HabitItem({ habit, selectedDate, toggleHabitCompletion, deleteHabit, updateHabit }: HabitItemProps) {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isCompleted = habit.completed[dateKey] || false;
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleCheckedChange = () => {
    toggleHabitCompletion(habit.id, selectedDate);
  };
  
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
          'flex items-center space-x-4 p-4 rounded-lg transition-all',
          isCompleted ? 'bg-primary/20' : 'bg-card hover:bg-accent'
        )}
      >
        <Checkbox
          id={`habit-${habit.id}-${dateKey}`}
          checked={isCompleted}
          onCheckedChange={handleCheckedChange}
          className="h-6 w-6"
          aria-label={`Mark '${habit.name}' as ${isCompleted ? 'incomplete' : 'complete'}`}
        />
        <label
          htmlFor={`habit-${habit.id}-${dateKey}`}
          className={cn(
            'flex-1 text-base font-medium leading-none cursor-pointer',
            isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
          )}
        >
          {habit.name}
        </label>
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
