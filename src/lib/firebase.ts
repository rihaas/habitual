import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyBSmmUDse6BU6d41j0wpNJ_PiN8dR-3Azs",
    authDomain: "habitual-mfhmn.firebaseapp.com",
    projectId: "habitual-mfhmn",
    storageBucket: "habitual-mfhmn.firebasestorage.app",
    messagingSenderId: "923176920941",
    appId: "1:923176920941:web:f0ec8f084d489d405adc64"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };