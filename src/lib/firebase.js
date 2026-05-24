import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnWQtW-IqcPzUOCgplE5oxsig5FhPseV0",
  authDomain: "volver-familia.firebaseapp.com",
  projectId: "volver-familia",
  storageBucket: "volver-familia.firebasestorage.app",
  messagingSenderId: "492798890252",
  appId: "1:492798890252:web:628f7dacfa60f7e898b929"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
