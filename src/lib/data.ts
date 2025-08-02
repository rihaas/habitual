import { type Habit } from './types';
import { format, subDays } from 'date-fns';

export const initialHabits: Habit[] = [
  {
    id: '1',
    name: 'Read for 20 minutes',
    priority: 'Medium',
    frequency: 'Daily',
    trackingType: 'Quantitative',
    goalValue: 20,
    goalUnit: 'minutes',
    completed: {
      [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: 25,
      [format(subDays(new Date(), 2), 'yyyy-MM-dd')]: 20,
      [format(subDays(new Date(), 4), 'yyyy-MM-dd')]: 15,
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
    trackingType: 'Checkbox',
    completed: {
      [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: 1,
      [format(subDays(new Date(), 3), 'yyyy-MM-dd')]: 0,
      [format(subDays(new Date(), 4), 'yyyy-MM-dd')]: 1,
    },
    category: 'Health',
    color: 'hsl(140 80% 80%)',
  },
  {
    id: '3',
    name: 'Drink 8 glasses of water',
    priority: 'Medium',
    frequency: 'Daily',
    trackingType: 'Quantitative',
    goalValue: 8,
    goalUnit: 'glasses',
    completed: {
      [format(subDays(new Date(), 1), 'yyyy-MM-dd')]: 8,
      [format(subDays(new Date(), 2), 'yyyy-MM-dd')]: 6,
    },
    category: 'Health',
    color: 'hsl(190 80% 80%)',
  },
  {
    id: '4',
    name: 'Plan tomorrow\'s tasks',
    priority: 'Low',
    frequency: 'Daily',
    trackingType: 'Checkbox',
    completed: {
      [format(new Date(), 'yyyy-MM-dd')]: 0,
    },
    category: 'Productivity',
    color: 'hsl(30 80% 80%)',
  },
   {
    id: '5',
    name: 'Weekly review',
    priority: 'High',
    frequency: 'Weekly',
    trackingType: 'Checkbox',
    completed: {},
    category: 'Productivity',
    color: 'hsl(255 100% 87%)',
  },
];
