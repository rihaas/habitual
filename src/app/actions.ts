"use server";

import { suggestHabits, type SuggestHabitsInput, type SuggestHabitsOutput } from "@/ai/flows/suggest-habits";
import { suggestHabitPack, type SuggestHabitPackInput, type SuggestHabitPackOutput } from "@/ai/flows/suggest-habit-packs";


export async function getAiSuggestions(input: SuggestHabitsInput): Promise<SuggestHabitsOutput> {
  try {
    const suggestions = await suggestHabits(input);
    return suggestions;
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    // In a real app, you might want to return a more specific error object
    return { suggestions: [] };
  }
}

export async function getAiHabitPack(input: SuggestHabitPackInput): Promise<SuggestHabitPackOutput> {
  try {
    const pack = await suggestHabitPack(input);
    return pack;
  } catch (error) {
    console.error("Error getting AI habit pack:", error);
    // In a real app, you might want to return a more specific error object
    return { pack: null };
  }
}
