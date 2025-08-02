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
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Habit name must be at least 2 characters.' }).max(50),
  priority: z.enum(['High', 'Medium', 'Low']),
  frequency: z.enum(['Daily', 'Weekly', 'Custom', 'N-times-week', 'Every-n-days']),
  days: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).optional(),
  timesPerWeek: z.coerce.number().min(1).max(7).optional(),
  interval: z.coerce.number().min(2).optional(),
  trackingType: z.enum(['Checkbox', 'Quantitative']),
  goalValue: z.coerce.number().min(1).optional(),
  goalUnit: z.string().max(20).optional(),
}).refine(data => {
    if (data.frequency === 'Custom' && (!data.days || data.days.length === 0)) {
        return false;
    }
    return true;
}, {
    message: "Please select at least one day for custom frequency.",
    path: ["days"],
}).refine(data => {
    if (data.frequency === 'N-times-week' && !data.timesPerWeek) {
        return false;
    }
    return true;
}, {
    message: "Please specify how many times a week.",
    path: ["timesPerWeek"],
}).refine(data => {
    if (data.frequency === 'Every-n-days' && !data.interval) {
        return false;
    }
    return true;
}, {
    message: "Please specify the interval in days.",
    path: ["interval"],
}).refine(data => {
    if (data.trackingType === 'Quantitative' && (!data.goalValue || !data.goalUnit)) {
        return false;
    }
    return true;
}, {
    message: "Goal and unit are required for quantitative tracking.",
    path: ["goalValue"],
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
      trackingType: 'Checkbox',
    },
  });

  const frequency = form.watch('frequency');
  const trackingType = form.watch('trackingType');

  function onSubmit(values: z.infer<typeof formSchema>) {
    const habitData: Omit<Habit, 'id' | 'completed'> = {
      name: values.name,
      priority: values.priority,
      frequency: values.frequency,
      trackingType: values.trackingType,
    };
    if (values.frequency === 'Custom') {
      habitData.days = values.days;
    }
    if (values.frequency === 'N-times-week') {
        habitData.timesPerWeek = values.timesPerWeek;
    }
    if (values.frequency === 'Every-n-days') {
        habitData.interval = values.interval;
        habitData.startDate = format(new Date(), 'yyyy-MM-dd');
    }
    if (values.trackingType === 'Quantitative') {
        habitData.goalValue = values.goalValue;
        habitData.goalUnit = values.goalUnit;
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Create a New Habit</DialogTitle>
          <DialogDescription>
            What new positive habit will you start today?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto max-h-[70vh] p-1">
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
                  name="trackingType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>How to track?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Checkbox" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Checkbox
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Quantitative" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Number
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {trackingType === 'Quantitative' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="goalValue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" placeholder="e.g., 8" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="goalUnit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unit</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., glasses" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <div className="col-span-2 -mt-2">
                             <FormMessage>{form.formState.errors.goalValue?.message}</FormMessage>
                         </div>
                    </div>
                )}

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
                        <SelectItem value="N-times-week">N Times a Week</SelectItem>
                        <SelectItem value="Every-n-days">Every N Days</SelectItem>
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
               {frequency === 'N-times-week' && (
                 <FormField
                    control={form.control}
                    name="timesPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Times per week</FormLabel>
                        <FormControl>
                           <Input type="number" min="1" max="7" placeholder="e.g., 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}
               {frequency === 'Every-n-days' && (
                 <FormField
                    control={form.control}
                    name="interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repeat every</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <Input type="number" min="2" placeholder="e.g., 3" {...field} />
                                <span>days</span>
                           </div>
                        </FormControl>
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
