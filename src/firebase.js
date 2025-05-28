// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDm43cvWtD4fV6vh8Eko5ABWah3PqdvXY0",
  authDomain: "cakes-and-more-pos.firebaseapp.com",
  projectId: "cakes-and-more-pos",
  storageBucket: "cakes-and-more-pos.firebasestorage.app",
  messagingSenderId: "1090207986442",
  appId: "1:1090207986442:web:a9cdf9ab3243c38770c0f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };