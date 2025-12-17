// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6hLmQywn8JLjMHzliLPXwp3HoTxh345M",
  authDomain: "flowapp-v0.firebaseapp.com",
  projectId: "flowapp-v0",
  storageBucket: "flowapp-v0.firebasestorage.app",
  messagingSenderId: "844763227975",
  appId: "1:844763227975:web:72f6639a01d65ee0740e62",
  measurementId: "G-RKK9PBP3QD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);