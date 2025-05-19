// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4cgsnL9lrayrR_v4FlhbOV7KTH4Lu-gM",
  authDomain: "lufeed-e4b4f.firebaseapp.com",
  projectId: "lufeed-e4b4f",
  storageBucket: "lufeed-e4b4f.appspot.com", // 🔧 fix typo here
  messagingSenderId: "465707844779",
  appId: "1:465707844779:web:cfc732e7dc9f65ebdaa3ee"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);

// Export the auth instance
const auth = getAuth(app);

export { auth };

export const db = getFirestore(app);
