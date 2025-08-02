'use server';

/**
 * @fileOverview AI flow for suggesting personalized habit packs.
 *
 * - suggestHabitPack - A function that generates a themed habit pack.
 * - SuggestHabitPackInput - The input type for the suggestHabitPack function.
 * - SuggestHabitPackOutput - The return type for the suggestHabitPack function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { HabitSchema, TimeOfDayEnum } from '@/lib/types';

export const SuggestHabitPackInputSchema = z.object({
  theme: z.string().describe('The theme for the habit pack, e.g., "Morning Routine", "Digital Detox", "Fitness Jumpstart".'),
});
export type SuggestHabitPackInput = z.infer<typeof SuggestHabitPackInputSchema>;

const HabitPackSchema = z.object({
    name: z.string().describe("A creative and engaging name for the habit pack."),
    description: z.string().describe("A short, motivating description of the habit pack and its benefits."),
    habits: z.array(HabitSchema.omit({ id: true, completed: true })).describe("A list of 3-5 related habits for the pack.")
})

export const SuggestHabitPackOutputSchema = z.object({
  pack: HabitPackSchema.nullable(),
});
export type SuggestHabitPackOutput = z.infer<typeof SuggestHabitPackOutputSchema>;

export async function suggestHabitPack(input: SuggestHabitPackInput): Promise<SuggestHabitPackOutput> {
  return suggestHabitPackFlow(input);
}

const suggestHabitPackPrompt = ai.definePrompt({
  name: 'suggestHabitPackPrompt',
  input: { schema: SuggestHabitPackInputSchema },
  output: { schema: SuggestHabitPackOutputSchema },
  prompt: `You are an expert habit coach. Your task is to create a "Habit Pack" based on a user-provided theme. A habit pack is a curated set of 3-5 complementary habits designed to help a user achieve a specific goal or improve an area of their life.

Theme: {{{theme}}}

If the theme is "I'm feeling lucky", choose a popular and effective theme yourself like "Mindful Morning" or "Evening Wind-Down".

Based on the theme, generate a complete habit pack with the following properties:
1.  **name**: A creative and catchy name for the pack (e.g., "The Phoenix Morning," "Digital Detox Kit," "Creative Spark").
2.  **description**: A brief, inspiring summary of what the pack helps with.
3.  **habits**: A list of 3 to 5 specific, actionable habits. Each habit must include:
    - name: A short name (e.g., "Meditate for 10 minutes").
    - priority: 'High', 'Medium', or 'Low'.
    - timeOfDay: 'Morning', 'Afternoon', 'Evening', or 'Anytime'.
    - frequency: 'Daily' is preferred for packs.
    - trackingType: 'Checkbox' or 'Quantitative'.
    - If quantitative, provide a 'goalValue' and 'goalUnit'.
    - category: A relevant category like 'Health', 'Mindfulness', 'Productivity', 'Creativity'.

Generate the habit pack now.`,
});

const suggestHabitPackFlow = ai.defineFlow(
  {
    name: 'suggestHabitPackFlow',
    inputSchema: SuggestHabitPackInputSchema,
    outputSchema: SuggestHabitPackOutputSchema,
  },
  async (input) => {
    const { output } = await suggestHabitPackPrompt(input);
    return output!;
  }
);
