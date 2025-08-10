import type { Habit } from '@/lib/types';
import { initialHabits } from '@/lib/data';

const HABITS_STORAGE_KEY = 'habits_data';

let memoryHabits: Habit[] = [];

const isLocalStorageAvailable = () => typeof window !== 'undefined' && window.localStorage;

const loadHabitsFromStorage = (): Habit[] => {
    if (!isLocalStorageAvailable()) return [];
    try {
        const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
        if (storedHabits) {
            return JSON.parse(storedHabits);
        }
    } catch (error) {
        console.error("Error parsing habits from localStorage:", error);
    }
    return [];
}

const saveHabitsToStorage = (habits: Habit[]) => {
    if (isLocalStorageAvailable()) {
        localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    }
    memoryHabits = habits;
};


// Initialize
memoryHabits = loadHabitsFromStorage();
if (memoryHabits.length === 0) {
    memoryHabits = initialHabits.map((h, index) => ({ ...h, order: index }));
    saveHabitsToStorage(memoryHabits);
}


export const getHabits = (): Habit[] => {
    memoryHabits = loadHabitsFromStorage();
    if (memoryHabits.length === 0) {
        // This case handles server-side rendering or first load before hydration
        return initialHabits.map((h, index) => ({ ...h, order: index }));
    }
    return [...memoryHabits].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
};

export const setHabits = (habits: Habit[]) => {
    saveHabitsToStorage(habits);
}

export const addHabit = (habit: Omit<Habit, 'id' | 'completed'>): Habit => {
    const newHabit: Habit = {
        ...habit,
        id: new Date().toISOString(),
        completed: {},
        order: memoryHabits.length,
    };
    const updatedHabits = [...memoryHabits, newHabit];
    saveHabitsToStorage(updatedHabits);
    return newHabit;
};

export const updateHabit = (habitId: string, habitData: Partial<Habit>): void => {
    const updatedHabits = memoryHabits.map(h => 
        h.id === habitId ? { ...h, ...habitData } : h
    );
    saveHabitsToStorage(updatedHabits);
};

export const deleteHabit = (habitId: string): void => {
    const updatedHabits = memoryHabits.filter(h => h.id !== habitId);
    saveHabitsToStorage(updatedHabits);
};

    