// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHQFIcPtd97RAPiT41EyQXaCflHga4jXI",
  authDomain: "masbotinventory.firebaseapp.com",
  projectId: "masbotinventory",
  storageBucket: "masbotinventory.firebasestorage.app",
  messagingSenderId: "1040093470535",
  appId: "1:1040093470535:web:dc9ec5b6da52e37aa83662",
  measurementId: "G-FV1T8VHT5Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore and export it for use in other components
export const db = getFirestore(app);
export const auth = getAuth(app);
