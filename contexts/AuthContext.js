'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { 
  auth, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  googleProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

// DEV ONLY: Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      // In dev mode with mock user, skip Firestore lookup
      if (isDev && uid === 'dev-user-001') {
        setUserRole({ 
          role: 'admin', 
          permissions: { 
            canCreateJobs: true, 
            canEditJobs: true, 
            canDeleteJobs: true,
            canViewFinancials: true,
            canEditFinancials: true,
            canManageTechnicians: true,
            canManageUsers: true,
            canRunKevin: true
          } 
        })
        return
      }
      
      const { db } = await import('@/lib/firebase')
      const { doc, getDoc } = await import('firebase/firestore')
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        setUserRole(userDoc.data())
      } else {
        // Create default user doc if not exists
        setUserRole({ role: 'technician', permissions: {} })
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole({ role: 'technician', permissions: {} })
    }
  }

  useEffect(() => {
    // Skip Firebase auth listener in dev mode if using dev login
    if (isDev && localStorage.getItem('dev_user')) {
      const devUser = JSON.parse(localStorage.getItem('dev_user'))
      setUser(devUser)
      fetchUserRole(devUser.uid)
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await fetchUserRole(firebaseUser.uid)
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // DEV ONLY: Sign in without Firebase (for local testing)
  const signInAsDev = async () => {
    if (!isDev) {
      return { success: false, error: 'Dev login only available in development' }
    }
    
    const devUser = {
      uid: 'dev-user-001',
      email: 'dev@datadogs.com',
      displayName: 'Dev User',
      photoURL: null
    }
    
    localStorage.setItem('dev_user', JSON.stringify(devUser))
    setUser(devUser)
    await fetchUserRole(devUser.uid)
    
    return { success: true, user: devUser }
  }

  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      // Clear dev user if present
      if (isDev) {
        localStorage.removeItem('dev_user')
      }
      await firebaseSignOut(auth)
      setUser(null)
      setUserRole(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signInWithGoogle,
    signInAsDev, // DEV ONLY
    signOut,
    isAdmin: userRole?.role === 'admin',
    isManager: userRole?.role === 'admin' || userRole?.role === 'manager',
    isTechnician: userRole?.role === 'technician'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}