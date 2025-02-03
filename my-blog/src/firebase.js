import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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

// Initialize Firestore
const db = getFirestore(app);

// Log the initialization details
console.log('Firebase initialized with project:', firebaseConfig.projectId);
console.log('Firestore instance:', db);

export { db };
