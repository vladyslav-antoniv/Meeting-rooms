import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8TF4sIFeGkDjQlTD4BqdS1AZY87NbltM",
  authDomain: "meeting-room-app-antoniv.firebaseapp.com",
  projectId: "meeting-room-app-antoniv",
  storageBucket: "meeting-room-app-antoniv.firebasestorage.app",
  messagingSenderId: "1054529234544",
  appId: "1:1054529234544:web:14169bcff5c207732776b5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);