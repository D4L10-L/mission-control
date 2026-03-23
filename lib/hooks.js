// lib/hooks.js - Custom hooks for data fetching
import { useState, useEffect, useCallback } from 'react'
import { 
  db, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc
} from '@/lib/firebase'
import { getAuth } from 'firebase/auth'

// Jobs hook
export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;

    
    // Check auth state
    const auth = getAuth()

    const q = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const jobsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setJobs(jobsData)
        setLoading(false)
      },
      (err) => {
        
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const createJob = useCallback(async (jobData) => {
    try {
      
      // Check auth
      const auth = getAuth()
      
      const docRef = await addDoc(collection(db, 'jobs'), {
        ...jobData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (err) {
      return { success: false, error: err.message, code: err.code }
    }
  }, [])

  const updateJob = useCallback(async (jobId, jobData) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        ...jobData,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (err) {
      console.error('Error updating job:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const deleteJob = useCallback(async (jobId) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId))
      return { success: true }
    } catch (err) {
      console.error('Error deleting job:', err)
      return { success: false, error: err.message }
    }
  }, [])

  return { jobs, loading, error, createJob, updateJob, deleteJob }
}

// Leads hook
export function useLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = query(
      collection(db, 'leads'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const leadsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setLeads(leadsData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching leads:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const createLead = useCallback(async (leadData) => {
    try {
      const docRef = await addDoc(collection(db, 'leads'), {
        ...leadData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Error creating lead:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const updateLead = useCallback(async (leadId, leadData) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        ...leadData,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (err) {
      console.error('Error updating lead:', err)
      return { success: false, error: err.message }
    }
  }, [])

  return { leads, loading, error, createLead, updateLead }
}

// Technicians hook
export function useTechnicians() {
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = query(
      collection(db, 'technicians'),
      orderBy('name', 'asc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const techsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setTechnicians(techsData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching technicians:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const createTechnician = useCallback(async (techData) => {
    try {
      const docRef = await addDoc(collection(db, 'technicians'), {
        ...techData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Error creating technician:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const updateTechnician = useCallback(async (techId, techData) => {
    try {
      await updateDoc(doc(db, 'technicians', techId), {
        ...techData,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (err) {
      console.error('Error updating technician:', err)
      return { success: false, error: err.message }
    }
  }, [])

  return { technicians, loading, error, createTechnician, updateTechnician }
}

// Alerts hook
export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = query(
      collection(db, 'alerts'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(50)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setAlerts(alertsData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching alerts:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const resolveAlert = useCallback(async (alertId) => {
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        resolved: true,
        resolvedAt: serverTimestamp()
      })
      return { success: true }
    } catch (err) {
      console.error('Error resolving alert:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const createAlert = useCallback(async (alertData) => {
    try {
      const docRef = await addDoc(collection(db, 'alerts'), {
        ...alertData,
        resolved: false,
        createdAt: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Error creating alert:', err)
      return { success: false, error: err.message }
    }
  }, [])

  return { alerts, loading, error, resolveAlert, createAlert }
}

// Insights hook
export function useInsights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = query(
      collection(db, 'insights'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(20)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const insightsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setInsights(insightsData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching insights:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { insights, loading, error }
}