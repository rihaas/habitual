import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "habitual-mfhmn",
  "appId": "1:923176920941:web:f0ec8f084d489d405adc64",
  "storageBucket": "habitual-mfhmn.firebasestorage.app",
  "apiKey": "AIzaSyBSmmUDse6BU6d41j0wpNJ_PiN8dR-3Azs",
  "authDomain": "habitual-mfhmn.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "923176920941"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
