import { initializeApp, getApps } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  increment 
} from 'firebase/firestore'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyB01_PXvb24vysqrpi5AgVYS1hdsop_6Q0",
  authDomain: "data-dogs-mission-control.firebaseapp.com",
  projectId: "data-dogs-mission-control",
  storageBucket: "data-dogs-mission-control.firebasestorage.app",
  messagingSenderId: "381045722112",
  appId: "1:381045722112:web:8c23474ad283fea0c75ce5"
}

// Initialize Firebase only on client side
let app, db, auth, googleProvider

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  db = getFirestore(app)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
}

export { 
  app,
  db, 
  auth,
  googleProvider,
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
}