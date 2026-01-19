// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfJ5Z31ojGt-FflC9Dal0WtVehesuBn3Q",
  authDomain: "dole-gip-databse.firebaseapp.com",
  projectId: "dole-gip-databse",
  storageBucket: "dole-gip-databse.firebasestorage.app",
  messagingSenderId: "27239014654",
  appId: "1:27239014654:web:dc7eb19772b57de22145af",
  measurementId: "G-TWR2KH70XR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
