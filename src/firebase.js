// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAi2wIe0U7X3p3H_j-ziN_67H82gbgQU4Y",
  authDomain: "coffeeshopsystem-923ed.firebaseapp.com",
  projectId: "coffeeshopsystem-923ed",
  storageBucket: "coffeeshopsystem-923ed.firebasestorage.app",
  messagingSenderId: "622503359203",
  appId: "1:622503359203:web:396e8a62117f4d67a28bd6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };