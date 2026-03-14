// Firebase config - loaded dynamically on client only
// This avoids build-time resolution issues

const firebaseConfig = {
  apiKey: "AIzaSyB01_PXvb24vysqrpi5AgVYS1hdsop_6Q0",
  authDomain: "data-dogs-mission-control.firebaseapp.com",
  projectId: "data-dogs-mission-control",
  storageBucket: "data-dogs-mission-control.firebasestorage.app",
  messagingSenderId: "381045722112",
  appId: "1:381045722112:web:8c23474ad283fea0c75ce5"
}

let db = null

export const getDb = async () => {
  if (typeof window === 'undefined') return null
  
  if (!db) {
    const { initializeApp } = await import('firebase/app')
    const { getFirestore } = await import('firebase/firestore')
    
    const app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  }
  
  return db
}

export const collection = async (db, name) => {
  const { collection: coll } = await import('firebase/firestore')
  return coll(db, name)
}

export const query = async (...args) => {
  const { query: q } = await import('firebase/firestore')
  return q(...args)
}

export const orderBy = async (...args) => {
  const { orderBy: ob } = await import('firebase/firestore')
  return ob(...args)
}

export const onSnapshot = async (q, callback) => {
  const { onSnapshot: os } = await import('firebase/firestore')
  return os(q, callback)
}

export const addDoc = async (db, ...args) => {
  const { addDoc: ad } = await import('firebase/firestore')
  const dbInstance = await getDb()
  return ad(...args)
}

export const getDocs = async (q) => {
  const { getDocs: gd } = await import('firebase/firestore')
  return gd(q)
}
