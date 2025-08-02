'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Package, Plus, Droplets, CheckCircle, ShieldCheck } from 'lucide-react';
import type { Habit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';

type HabitPack = {
    name: string;
    description: string;
    icon: React.ReactNode;
    habits: Omit<Habit, 'id' | 'completed'>[];
};

const habitPacks: HabitPack[] = [
    {
        name: "7-Day Hydration Challenge",
        description: "Drink 8 glasses of water every day for a week to improve your energy and health.",
        icon: <Droplets className="h-8 w-8 text-blue-500" />,
        habits: [
            {
                name: "Drink 8 glasses of water",
                priority: 'High',
                timeOfDay: 'Anytime',
                frequency: 'Daily',
                trackingType: 'Quantitative',
                goalValue: 8,
                goalUnit: 'glasses',
                category: 'Health'
            }
        ]
    },
    {
        name: "Mindful Morning Routine",
        description: "Start your day with intention and clarity with this pack of mindful habits.",
        icon: <ShieldCheck className="h-8 w-8 text-green-500" />,
        habits: [
            { name: "Meditate for 10 minutes", priority: 'Medium', timeOfDay: 'Morning', frequency: 'Daily', trackingType: 'Checkbox', category: 'Mindfulness' },
            { name: "Write in a journal", priority: 'Low', timeOfDay: 'Morning', frequency: 'Daily', trackingType: 'Checkbox', category: 'Mindfulness' },
            { name: "Stretch for 5 minutes", priority: 'Medium', timeOfDay: 'Morning', frequency: 'Daily', trackingType: 'Checkbox', category: 'Health' },
        ]
    }
];

type HabitPacksDialogProps = {
  addHabitPack: (habits: Omit<Habit, 'id' | 'completed'>[]) => void;
  children: React.ReactNode;
};

export function HabitPacksDialog({ addHabitPack, children }: HabitPacksDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const [addedPacks, setAddedPacks] = React.useState<string[]>([]);

  const handleAddPack = (pack: HabitPack) => {
    addHabitPack(pack.habits);
    setAddedPacks(prev => [...prev, pack.name]);
    toast({
        title: "Habit Pack Added!",
        description: `The "${pack.name}" has been added to your list.`,
    });
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setAddedPacks([]);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Package /> Explore Habit Packs
          </DialogTitle>
          <DialogDescription>
            Add a curated set of habits with a single click to jumpstart your journey.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto p-1">
            {habitPacks.map((pack) => {
                const isAdded = addedPacks.includes(pack.name);
                return (
                    <Card key={pack.name}>
                        <CardHeader className='flex-row items-start gap-4 space-y-0'>
                            <div>{pack.icon}</div>
                            <div className='space-y-1'>
                                <CardTitle>{pack.name}</CardTitle>
                                <DialogDescription>{pack.description}</DialogDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className='text-sm text-muted-foreground list-disc pl-5 space-y-1'>
                               {pack.habits.map(h => <li key={h.name}>{h.name}</li>)}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className='w-full' onClick={() => handleAddPack(pack)} disabled={isAdded}>
                                {isAdded ? <><CheckCircle className="mr-2 h-4 w-4" /> Added</> : <><Plus className="mr-2 h-4 w-4" /> Add Pack</>}
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
