'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import '@/app/globals.css'

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}