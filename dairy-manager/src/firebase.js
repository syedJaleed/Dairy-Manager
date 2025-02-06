import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHu8NhkRhswS_uaGAf2AyBdt3ts_9-IN8",
  authDomain: "dairy-manager1.firebaseapp.com",
  projectId: "dairy-manager1",
  storageBucket: "dairy-manager1.firebasestorage.app",
  messagingSenderId: "183739749680",
  appId: "1:183739749680:web:7ebc5e836abe117a41e4f5",
  measurementId: "G-BNLR8DBN3V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);