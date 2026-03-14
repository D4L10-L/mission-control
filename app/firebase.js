import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB01_PXvb24vysqrpi5AgVYS1hdsop_6Q0",
  authDomain: "data-dogs-mission-control.firebaseapp.com",
  projectId: "data-dogs-mission-control",
  storageBucket: "data-dogs-mission-control.firebasestorage.app",
  messagingSenderId: "381045722112",
  appId: "1:381045722112:web:8c23474ad283fea0c75ce5"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, onSnapshot }
