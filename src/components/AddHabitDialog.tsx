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
  DialogTrigger,
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
import { PlusCircle } from 'lucide-react';
import type { Habit } from '@/lib/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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


type AddHabitDialogProps = {
  addHabit: (habit: Omit<Habit, 'id' | 'completed'>) => void;
};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;


export function AddHabitDialog({ addHabit }: AddHabitDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      frequency: 'Daily',
      priority: 'Medium',
      days: [],
    },
  });

  const frequency = form.watch('frequency');

  function onSubmit(values: z.infer<typeof formSchema>) {
    const habitData: Omit<Habit, 'id' | 'completed'> = {
      name: values.name,
      priority: values.priority,
      frequency: values.frequency,
    };
    if (values.frequency === 'Custom') {
      habitData.days = values.days;
    }

    addHabit(habitData);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create a New Habit</DialogTitle>
          <DialogDescription>
            What new positive habit will you start today?
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
              <Button type="submit">Create Habit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
