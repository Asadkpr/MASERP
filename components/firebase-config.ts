
// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firestore and export it for use in other components
export const db = firebase.firestore();
export const auth = firebase.auth();

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn('Firestore persistence failed: Multiple tabs open');
      } else if (err.code == 'unimplemented') {
          console.warn('Firestore persistence failed: Browser not supported');
      }
  });
