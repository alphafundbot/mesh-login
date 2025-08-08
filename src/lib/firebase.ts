// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "stratagemai-xi7q8",
  appId: "1:405937962472:web:2cb16838674ed6e0acb85d",
  storageBucket: "stratagemai-xi7q8.firebasestorage.app",
  apiKey: "AIzaSyBPJX1gPclHOhKzICEyJJ7jDnLIgkoSraU",
  authDomain: "stratagemai-xi7q8.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "405937962472",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
