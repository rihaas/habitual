import { type Habit } from './types';
import { format, subDays } from 'date-fns';

export const initialHabits: Habit[] = [
  {
    id: '1',
    name: 'Read for 20 minutes',
    priority: 'Medium',
    frequency: 'Daily',
    completed: {
      [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: true,
      [format(subDays(new Date(), 2), 'yyyy-MM-dd')]: true,
      [format(subDays(new Date(), 4), 'yyyy-MM-dd')]: true,
    },
    category: 'Personal Growth',
    color: 'hsl(215 100% 81%)',
  },
  {
    id: '2',
    name: 'Morning workout',
    priority: 'High',
    frequency: 'Custom',
    days: ['Mon', 'Wed', 'Fri'],
    completed: {
      [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: true,
      [format(subDays(new Date(), 3), 'yyyy-MM-dd')]: false,
      [format(subDays(new Date(), 4), 'yyyy-MM-dd')]: true,
    },
    category: 'Health',
    color: 'hsl(140 80% 80%)',
  },
  {
    id: '3',
    name: 'Drink 8 glasses of water',
    priority: 'Medium',
    frequency: 'Daily',
    completed: {
      [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: true,
      [format(subDays(new Date(), 2), 'yyyy-MM-dd')]: true,
    },
    category: 'Health',
    color: 'hsl(190 80% 80%)',
  },
  {
    id: '4',
    name: 'Plan tomorrow\'s tasks',
    priority: 'Low',
    frequency: 'Daily',
    completed: {
      [format(new Date(), 'yyyy-MM-dd')]: false,
    },
    category: 'Productivity',
    color: 'hsl(30 80% 80%)',
  },
   {
    id: '5',
    name: 'Weekly review',
    priority: 'High',
    frequency: 'Weekly',
    completed: {},
    category: 'Productivity',
    color: 'hsl(255 100% 87%)',
  },
];
