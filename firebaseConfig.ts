
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: REPLACE THESE VALUES WITH YOUR REAL FIREBASE CONSOLE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyAJufz7dPvyM4D0htNj96MlODFCPljDWHY",
  authDomain: "flowapp-v1.firebaseapp.com",
  projectId: "flowapp-v1",
  storageBucket: "flowapp-v1.firebasestorage.app",
  messagingSenderId: "1086010933434",
  appId: "1:1086010933434:web:f0737e45d49b2745320283",
  measurementId: "G-2TVEHEVVDZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the database and auth instances so the app can use them
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("Firebase initialized:", app.name);
