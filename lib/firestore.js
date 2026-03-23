// lib/firestore.js - Firestore operations
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { app } from './firebase';

// Initialize Firestore
export const db = getFirestore(app);

// Collection references
export const collections = {
  jobs: 'jobs',
  leads: 'leads',
  technicians: 'technicians',
  financials: 'financials',
  alerts: 'alerts',
  insights: 'insights',
  users: 'users'
};

// Helper to get collection ref
export const getCollection = (name) => collection(db, name);

// Query helpers
export const q = {
  where,
  orderBy,
  limit
};

// Server timestamp helper
export const timestamp = serverTimestamp;

// Export individual functions for convenience
export {
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  increment
};