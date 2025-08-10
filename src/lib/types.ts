import { z } from 'zod';

export const TimeOfDayEnum = z.enum(['Anytime', 'Morning', 'Afternoon', 'Evening']);
export type TimeOfDay = z.infer<typeof TimeOfDayEnum>;

export const MicroHabitSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type MicroHabit = z.infer<typeof MicroHabitSchema>;

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
  completed: z.record(z.string(), z.union([z.number(), z.record(z.string(), z.boolean())])), // For Checkbox: 1 for true, 0 for false. For Quantitative: the actual value. For MicroHabits: a record of microhabitId to boolean.
  category: z.string().optional(),
  order: z.number().optional(),
  microHabits: z.array(MicroHabitSchema).optional(),
});

export type Habit = z.infer<typeof HabitSchema>;

export const JournalEntrySchema = z.object({
  id: z.string(),
  date: z.string(), // YYYY-MM-DD
  content: z.string(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;


export const SuggestHabitPackInputSchema = z.object({
  theme: z.string().describe('The theme for the habit pack, e.g., "Morning Routine", "Digital Detox", "Fitness Jumpstart".'),
});
export type SuggestHabitPackInput = z.infer<typeof SuggestHabitPackInputSchema>;

const HabitPackSchema = z.object({
    name: z.string().describe("A creative and engaging name for the habit pack."),
    description: z.string().describe("A short, motivating description of the habit pack and its benefits."),
    habits: z.array(HabitSchema.omit({ id: true, completed: true, category: true, order: true })).describe("A list of 3-5 related habits for the pack.")
})

export const SuggestHabitPackOutputSchema = z.object({
  pack: HabitPackSchema.nullable(),
});
export type SuggestHabitPackOutput = z.infer<typeof SuggestHabitPackOutputSchema>;
