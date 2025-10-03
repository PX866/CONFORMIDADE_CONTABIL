import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBpZ_25f6JqjEvezD3urhEB_oy34whZSnE",
  authDomain: "conformidade-contabil.firebaseapp.com",
  databaseURL: "https://conformidade-contabil-default-rtdb.firebaseio.com",
  projectId: "conformidade-contabil",
  storageBucket: "conformidade-contabil.firebasestorage.app",
  messagingSenderId: "147005050821",
  appId: "1:147005050821:web:5d3a88d0e4273594af85ac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export default app;
