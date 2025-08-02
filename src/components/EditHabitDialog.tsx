'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Habit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Habit name must be at least 2 characters.' }).max(50),
  frequency: z.enum(['Daily', 'Weekly', 'Custom']),
  priority: z.enum(['High', 'Medium', 'Low']),
  days: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).optional(),
}).refine(data => {
    if (data.frequency === 'Custom' && (!data.days || data.days.length === 0)) {
        return false;
    }
    return true;
}, {
    message: "Please select at least one day for custom frequency.",
    path: ["days"],
});

type EditHabitDialogProps = {
  habit: Habit;
  updateHabit: (habit: Omit<Habit, 'completed'>) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function EditHabitDialog({ habit, updateHabit, isOpen, setIsOpen }: EditHabitDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: habit.name,
      frequency: habit.frequency,
      priority: habit.priority,
      days: habit.days || [],
    },
  });

  const frequency = form.watch('frequency');

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: habit.name,
        frequency: habit.frequency,
        priority: habit.priority,
        days: habit.days || [],
      });
    }
  }, [isOpen, habit, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const habitData: Omit<Habit, 'id' | 'completed'> = {
      ...habit,
      name: values.name,
      priority: values.priority,
      frequency: values.frequency,
    };
    if (values.frequency === 'Custom') {
      habitData.days = values.days;
    } else {
      delete habitData.days;
    }

    updateHabit(habitData);
    toast({
      title: 'Habit Updated!',
      description: `"${values.name}" has been updated.`,
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Habit</DialogTitle>
          <DialogDescription>
            Make changes to your habit. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Meditate for 10 minutes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Custom">Specific Days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

               {frequency === 'Custom' && (
                 <FormField
                    control={form.control}
                    name="days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>On these days</FormLabel>
                         <ToggleGroup 
                            type="multiple"
                            variant="outline"
                            className="grid grid-cols-4 gap-2"
                            value={field.value}
                            onValueChange={field.onChange}
                         >
                            {weekDays.map(day => (
                                <ToggleGroupItem key={day} value={day}>{day}</ToggleGroupItem>
                            ))}
                         </ToggleGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
