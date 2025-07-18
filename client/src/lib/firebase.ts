// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Check if all required Firebase environment variables are available, otherwise use demo config
const hasEnvConfig = 
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Demo Firebase configuration for development/testing
const demoFirebaseConfig = {
  apiKey: "AIzaSyBKBjAVUR0s9ygf_E7uztQX0PP5VB-5DxQ",
  authDomain: "washr-mainz.firebaseapp.com",
  projectId: "washr-mainz",
  storageBucket: "washr-mainz.firebasestorage.app",
  messagingSenderId: "931508775204",
  appId: "1:931508775204:web:c23e8cc39361a7ff676bb1"
};

const firebaseConfig = hasEnvConfig ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
} : demoFirebaseConfig;

console.log('Firebase env check:', {
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  allRequired: hasEnvConfig ? 'env-config' : 'washr-mainz'
});

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let isFirebaseConfigured = false;

// Always try to initialize Firebase (with env config or demo config)
try {
  console.log('Initializing Firebase with config:', firebaseConfig);
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Enable persistence for seamless login experience
  setPersistence(auth, browserLocalPersistence).catch(console.error);
  
  isFirebaseConfigured = true;
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  isFirebaseConfigured = false;
}

export { auth, db, isFirebaseConfigured };
export default app;