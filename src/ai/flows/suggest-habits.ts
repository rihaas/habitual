'use server';

/**
 * @fileOverview AI flow for suggesting personalized habits to users.
 *
 * - suggestHabits - A function that generates habit suggestions based on user interests and goals.
 * - SuggestHabitsInput - The input type for the suggestHabits function, including user interests, goals, and completed habits.
 * - SuggestHabitsOutput - The return type for the suggestHabits function, providing a list of suggested habits.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHabitsInputSchema = z.object({
  interests: z.string().describe('The user\'s interests, as a comma separated list.'),
  goals: z.string().describe('The user\'s goals, as a comma separated list.'),
  completedHabits: z.string().describe('The user\'s recently completed habits, as a comma separated list.'),
});
export type SuggestHabitsInput = z.infer<typeof SuggestHabitsInputSchema>;

const SuggestHabitsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggested habits tailored to the user\'s interests and goals.'),
});
export type SuggestHabitsOutput = z.infer<typeof SuggestHabitsOutputSchema>;

export async function suggestHabits(input: SuggestHabitsInput): Promise<SuggestHabitsOutput> {
  return suggestHabitsFlow(input);
}

const suggestHabitsPrompt = ai.definePrompt({
  name: 'suggestHabitsPrompt',
  input: {schema: SuggestHabitsInputSchema},
  output: {schema: SuggestHabitsOutputSchema},
  prompt: `You are an AI habit suggestion expert. Given a user's stated interests, goals, and recent habit completions, suggest new habits that align with their needs.

Interests: {{{interests}}}
Goals: {{{goals}}}
Completed Habits: {{{completedHabits}}}

Based on the above information, provide a list of habit suggestions. Be specific and actionable. Each habit should be less than 10 words.

Suggestions:`, 
});

const suggestHabitsFlow = ai.defineFlow(
  {
    name: 'suggestHabitsFlow',
    inputSchema: SuggestHabitsInputSchema,
    outputSchema: SuggestHabitsOutputSchema,
  },
  async input => {
    const {output} = await suggestHabitsPrompt(input);
    return output!;
  }
);
