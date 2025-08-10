import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { JournalEntry } from '@/lib/types';
import { format } from 'date-fns';

const getJournalCollection = (userId: string) => {
    return collection(db, `users/${userId}/journal`);
};

/**
 * Retrieves a journal entry for a specific date.
 * @param userId The ID of the user.
 * @param date The date for which to retrieve the entry.
 * @returns The journal entry, or null if it doesn't exist.
 */
export const getJournalEntry = async (userId: string, date: Date): Promise<JournalEntry | null> => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const entryDocRef = doc(db, `users/${userId}/journal`, dateKey);
    const docSnap = await getDoc(entryDocRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as JournalEntry;
    } else {
        return null;
    }
};

/**
 * Saves or updates a journal entry for a specific date.
 * @param userId The ID of the user.
 * @param date The date of the entry.
 * @param content The content of the journal entry.
 */
export const saveJournalEntry = async (userId: string, date: Date, content: string): Promise<void> => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const entryDocRef = doc(db, `users/${userId}/journal`, dateKey);
    await setDoc(entryDocRef, { date: dateKey, content: content });
};
