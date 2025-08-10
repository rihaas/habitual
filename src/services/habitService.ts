'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import type { Habit } from '@/lib/types';

const getHabitsCollection = (userId: string) => {
    return collection(db, 'users', userId, 'habits');
}

export const getHabits = async (userId: string): Promise<Habit[]> => {
    try {
        const habitsCollection = getHabitsCollection(userId);
        const q = query(habitsCollection, orderBy('order', 'asc'));
        const habitSnapshot = await getDocs(q);
        const habitList = habitSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
        return habitList;
    } catch (error) {
        console.error("Error fetching habits: ", error);
        return [];
    }
};

export const addHabit = async (userId: string, habit: Omit<Habit, 'id' | 'completed'>): Promise<Habit | null> => {
    try {
        const habitsCollection = getHabitsCollection(userId);
        const docRef = await addDoc(habitsCollection, {
            ...habit,
            completed: {},
            order: (await getDocs(habitsCollection)).size // Add new habit to the end
        });
        return { id: docRef.id, ...habit, completed: {} };
    } catch (error) {
        console.error("Error adding habit: ", error);
        return null;
    }
}

export const updateHabit = async (userId: string, habitId: string, habitData: Partial<Habit>) => {
    try {
        const habitDoc = doc(db, 'users', userId, 'habits', habitId);
        await updateDoc(habitDoc, habitData);
    } catch (error) {
        console.error("Error updating habit: ", error);
    }
}

export const deleteHabit = async (userId: string, habitId: string) => {
    try {
        const habitDoc = doc(db, 'users', userId, 'habits', habitId);
        await deleteDoc(habitDoc);
    } catch (error) {
        console.error("Error deleting habit: ", error);
    }
}
