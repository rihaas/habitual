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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Package, Plus, Sparkles, CheckCircle } from 'lucide-react';
import type { Habit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription as CardDesc } from './ui/card';
import { getAiHabitPack, type SuggestHabitPackOutput } from '@/app/actions';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  theme: z.string().min(3, { message: 'Please describe the theme for your pack.' }),
});

type HabitPacksDialogProps = {
  addHabitPack: (habits: Omit<Habit, 'id' | 'completed'>[]) => void;
  children: React.ReactNode;
};

export function HabitPacksDialog({ addHabitPack, children }: HabitPacksDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedPack, setGeneratedPack] = React.useState<SuggestHabitPackOutput['pack']>(null);
  const [isPackAdded, setIsPackAdded] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { theme: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedPack(null);
    setIsPackAdded(false);
    try {
      const result = await getAiHabitPack({ theme: values.theme });
      if (result.pack) {
        setGeneratedPack(result.pack);
      } else {
        toast({
          title: 'Could not generate a pack',
          description: "Our AI couldn't generate a pack for that theme. Try being more specific.",
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Failed to get AI habit pack. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddPack = () => {
    if (!generatedPack) return;
    addHabitPack(generatedPack.habits);
    setIsPackAdded(true);
    toast({
      title: 'Habit Pack Added!',
      description: `The "${generatedPack.name}" has been added to your list.`,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setGeneratedPack(null);
      setIsLoading(false);
      setIsPackAdded(false);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Package /> AI-Powered Habit Packs
          </DialogTitle>
          <DialogDescription>
            Describe a theme, and our AI will generate a curated set of habits for you.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : generatedPack ? (
          <div className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>{generatedPack.name}</CardTitle>
                <CardDesc>{generatedPack.description}</CardDesc>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  {generatedPack.habits.map((h) => (
                    <li key={h.name}>{h.name}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleAddPack} disabled={isPackAdded}>
                  {isPackAdded ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Add Pack
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Pack Theme</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Morning Routine', 'Digital Detox'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                 <Button type="button" variant="ghost" onClick={() => onSubmit({ theme: "I'm feeling lucky" })}>I'm feeling lucky</Button>
                 <Button type="submit" disabled={isLoading}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isLoading ? 'Generating...' : 'Generate Pack'}
                  </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
