import { type Habit } from './types';

// This file is no longer the primary source of data, 
// but can be kept for reference or seeding purposes.
export const initialHabits: Habit[] = [
  {
    id: '1',
    name: 'Wakeup before Fajr',
    priority: 'High',
    frequency: 'Daily',
    trackingType: 'Checkbox',
    completed: {},
    category: 'Spiritual',
    timeOfDay: 'Morning'
  },
  {
    id: '2',
    name: '5 Times Prayer',
    priority: 'High',
    frequency: 'Daily',
    trackingType: 'Quantitative',
    goalValue: 5,
    goalUnit: 'times',
    completed: {},
    category: 'Spiritual',
    timeOfDay: 'Anytime'
  },
  {
    id: '3',
    name: 'Quran Read',
    priority: 'Medium',
    frequency: 'Daily',
    trackingType: 'Checkbox',
    completed: {},
    category: 'Spiritual',
    timeOfDay: 'Morning'
  },
  {
    id: '4',
    name: 'Book Read',
    priority: 'Medium',
    frequency: 'Daily',
    trackingType: 'Checkbox',
    completed: {},
    category: 'Personal Growth',
    timeOfDay: 'Evening'
  },
   {
    id: '5',
    name: 'Sleep Before 10.30',
    priority: 'Medium',
    frequency: 'Daily',
    trackingType: 'Checkbox',
    completed: {},
    category: 'Health',
    timeOfDay: 'Evening'
  },
  {
    id: '6',
    name: 'Skin Care',
    priority: 'Low',
    frequency: 'Daily',
    trackingType: 'Checkbox',
    completed: {},
    category: 'Health',
    timeOfDay: 'Morning'
  },
  {
    id: '7',
    name: '4 L Water',
    priority: 'Medium',
    frequency: 'Daily',
    trackingType: 'Quantitative',
    goalValue: 4,
    goalUnit: 'L',
    completed: {},
    category: 'Health',
    timeOfDay: 'Anytime'
  },
  {
    id: '8',
    name: 'Journaling',
    priority: 'Low',
    frequency: 'Daily',
    trackingType: 'Checkbox',
    completed: {},
    category: 'Personal Growth',
    timeOfDay: 'Evening'
  },
    {
    id: '9',
    name: 'Track Finances',
    priority: 'Medium',
    frequency: 'Daily',
    trackingType: 'Checkbox',
    completed: {},
    category: 'Finance',
    timeOfDay: 'Anytime'
  },
  {
    id: '10',
    name: '7000 steps',
    priority: 'Medium',
    frequency: 'Daily',
    trackingType: 'Quantitative',
    goalValue: 7000,
    goalUnit: 'steps',
    completed: {},
    category: 'Health',
    timeOfDay: 'Afternoon'
  },
];
