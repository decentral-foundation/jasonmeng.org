import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDoTY0gH4zpDX48hS5OUIyLD_3Tk6mn1vM",
  authDomain: "my-first-firebase-projec-21e91.firebaseapp.com",
  projectId: "my-first-firebase-projec-21e91",
  storageBucket: "my-first-firebase-projec-21e91.firebasestorage.app",
  messagingSenderId: "325210711922",
  appId: "1:325210711922:web:1468289ba342fb11b35feb",
  measurementId: "G-RLMDGK6S9G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
