import { z } from 'zod';

export const TimeOfDayEnum = z.enum(['Anytime', 'Morning', 'Afternoon', 'Evening']);
export type TimeOfDay = z.infer<typeof TimeOfDayEnum>;

export const HabitSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.enum(['High', 'Medium', 'Low']),
  timeOfDay: TimeOfDayEnum.default('Anytime'),
  frequency: z.enum(['Daily', 'Weekly', 'Custom', 'N-times-week', 'Every-n-days']),
  days: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).optional(),
  timesPerWeek: z.number().optional(),
  interval: z.number().optional(),
  startDate: z.string().optional(), // YYYY-MM-DD
  trackingType: z.enum(['Checkbox', 'Quantitative']).default('Checkbox'),
  goalValue: z.number().optional(),
  goalUnit: z.string().optional(),
  completed: z.record(z.number()), // For Checkbox: 1 for true, 0 for false. For Quantitative: the actual value.
  category: z.string().optional(),
});

export type Habit = z.infer<typeof HabitSchema>;
