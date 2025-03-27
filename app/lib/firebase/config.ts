import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAiPhci5uziTomiUXm9y5dvdKiVchq6bjI',
  authDomain: 'kofounda-79d3b.firebaseapp.com',
  projectId: 'kofounda-79d3b',
  storageBucket: 'kofounda-79d3b.firebasestorage.app',
  messagingSenderId: '262610611862',
  appId: '1:262610611862:web:37cb2081e75941999d5cb7',
  measurementId: 'G-G9X39PZ5ES',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 