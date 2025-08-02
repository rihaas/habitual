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
import { Lightbulb, Plus, Sparkles } from 'lucide-react';
import type { Habit } from '@/lib/types';
import { getAiSuggestions } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  interests: z.string().min(3, { message: 'Please share at least one interest.' }),
  goals: z.string().min(3, { message: 'Please share at least one goal.' }),
});

type AiSuggestionDialogProps = {
  addHabit: (habit: Omit<Habit, 'id' | 'completed' | 'priority' | 'frequency'> & Partial<Pick<Habit, 'priority' | 'frequency'>>) => void;
  completedHabits: string;
};

export function AiSuggestionDialog({ addHabit, completedHabits }: AiSuggestionDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { interests: '', goals: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await getAiSuggestions({ ...values, completedHabits });
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        toast({
          title: 'No suggestions found',
          description: "Our AI couldn't find any suggestions. Try different keywords.",
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Failed to get AI suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddSuggestion(suggestion: string) {
    addHabit({
      name: suggestion,
      priority: 'Medium',
      frequency: 'Daily',
    });
    toast({
      title: 'Habit Added!',
      description: `"${suggestion}" has been added to your list.`,
    });
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  }

  const handleOpenChange = (open: boolean) => {
    if(!open) {
        form.reset();
        setSuggestions([]);
        setIsLoading(false);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
          Get AI Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><Lightbulb /> Let's Find Your Next Habit</DialogTitle>
          <DialogDescription>
            Tell us about your interests and goals, and we'll suggest habits for you.
          </DialogDescription>
        </DialogHeader>
        
        {suggestions.length > 0 ? (
          <div className="space-y-3 py-4 max-h-64 overflow-y-auto">
            <h4 className="font-semibold">Here are some ideas:</h4>
            {suggestions.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-3 bg-accent/50 rounded-lg">
                    <p className="flex-1">{s}</p>
                    <Button size="sm" onClick={() => handleAddSuggestion(s)}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </div>
            ))}
          </div>
        ) : isLoading ? (
            <div className="space-y-3 py-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Interests</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Reading, programming, fitness" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Goals</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Learn a new skill, be more active" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Thinking...' : 'Get Suggestions'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

      </DialogContent>
    </Dialog>
  );
}
