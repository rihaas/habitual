import { z } from 'zod';

export const HabitSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.enum(['High', 'Medium', 'Low']),
  frequency: z.enum(['Daily', 'Weekly', 'Custom', 'N-times-week', 'Every-n-days']),
  days: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).optional(),
  timesPerWeek: z.number().optional(),
  interval: z.number().optional(),
  startDate: z.string().optional(), // YYYY-MM-DD
  completed: z.record(z.boolean()), // date string 'YYYY-MM-DD' as key
  category: z.string().optional(),
  color: z.string().optional(),
});

export type Habit = z.infer<typeof HabitSchema>;
