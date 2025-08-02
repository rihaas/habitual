'use server';

import { suggestHabits, type SuggestHabitsInput, type SuggestHabitsOutput } from '@/ai/flows/suggest-habits';
import { suggestHabitPack, type SuggestHabitPackInput, type SuggestHabitPackOutput } from '@/ai/flows/suggest-habit-packs';

/**
 * Gets AI-powered habit suggestions based on user input.
 * @param input The user's interests, goals, and completed habits.
 * @returns A promise that resolves to the suggested habits.
 */
export async function getAiSuggestions(input: SuggestHabitsInput): Promise<SuggestHabitsOutput> {
  return suggestHabits(input);
}

/**
 * Gets an AI-powered habit pack based on a theme.
 * @param input The theme for the habit pack.
 * @returns A promise that resolves to the suggested habit pack.
 */
export async function getAiHabitPack(input: SuggestHabitPackInput): Promise<SuggestHabitPackOutput> {
    return suggestHabitPack(input);
}
