import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Habit } from '@/lib/types';
import { initialHabits } from '@/lib/data';

// Note: userId is now required for all operations to ensure data is user-specific.

const getHabitsCollection = (userId: string) => {
    return collection(db, `users/${userId}/habits`);
};

export const seedInitialHabits = async (userId: string): Promise<void> => {
    const habitsCollection = getHabitsCollection(userId);
    const snapshot = await getDocs(query(habitsCollection));
    if (snapshot.empty) {
        const promises = initialHabits.map((habit, index) => {
            // remove the hardcoded id
            const { id, ...rest } = habit;
            return addDoc(habitsCollection, {...rest, order: index });
        });
        await Promise.all(promises);
    }
};

export const getHabits = async (userId: string): Promise<Habit[]> => {
    const habitsCollection = getHabitsCollection(userId);
    const q = query(habitsCollection, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));

    // Seed initial habits if the user has none.
    if (habits.length === 0) {
        await seedInitialHabits(userId);
        // Fetch again after seeding
        const newSnapshot = await getDocs(q);
        return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
    }
    
    return habits;
};

export const addHabit = async (userId: string, habit: Omit<Habit, 'id' | 'completed'>): Promise<Habit> => {
    const habitsCollection = getHabitsCollection(userId);
    const docRef = await addDoc(habitsCollection, {
        ...habit,
        completed: {}, // Ensure completed is an empty object
    });
    return { ...habit, id: docRef.id, completed: {} };
};

export const updateHabit = async (userId: string, habitId: string, habitData: Partial<Omit<Habit, 'id'>>): Promise<void> => {
    const habitDoc = doc(db, `users/${userId}/habits`, habitId);
    await updateDoc(habitDoc, habitData);
};


export const deleteHabit = async (userId: string, habitId: string): Promise<void> => {
    const habitDoc = doc(db, `users/${userId}/habits`, habitId);
    await deleteDoc(habitDoc);
};

export const setHabitsOrder = async (userId: string, habits: {id: string, order: number}[]) => {
    const promises = habits.map(({id, order}) => updateHabit(userId, id, { order }));
    await Promise.all(promises);
}