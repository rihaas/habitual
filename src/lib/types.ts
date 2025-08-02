export type Habit = {
  id: string;
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  frequency: 'Daily' | 'Weekly' | 'Custom';
  days?: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  completed: Record<string, boolean>; // date string 'YYYY-MM-DD' as key
  category?: string;
  color?: string; // e.g., 'hsl(255, 100%, 87%)'
};
