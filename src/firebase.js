import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBgoDboWRbOffT6Odr7AJ4IvOdOmK-F4N0",
  authDomain: "akio-792c1.firebaseapp.com",
  projectId: "akio-792c1",
  storageBucket: "akio-792c1.firebasestorage.app",
  messagingSenderId: "246113416163",
  appId: "1:246113416163:web:878dd3f78f5a1ee3a366d6",
  measurementId: "G-L82PCRWHC5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
