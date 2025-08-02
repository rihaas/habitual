"use server";

import { suggestHabits, type SuggestHabitsInput, type SuggestHabitsOutput } from "@/ai/flows/suggest-habits";

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
