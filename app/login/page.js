'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassPanel, Input, Button, LoadingSpinner } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle, signInAsDev } = useAuth()
  const router = useRouter()

  // DEV ONLY: Check if in development
  const isDev = process.env.NODE_ENV === 'development'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn(email, password)
    
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    const result = await signInWithGoogle()
    
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary gradient-mesh grid-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassPanel className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold">DD</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Data Dogs Mission Control</h1>
          <p className="text-text-secondary">Sign in to your account</p>
        </GlassPanel>

        <GlassPanel>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-accent-red/20 border border-accent-red/30 text-accent-red text-sm">
                {error}
              </div>
            )}
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@datadogs.com"
              required
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? <LoadingSpinner /> : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-text-secondary">or</span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleSignIn}
            variant="secondary"
            disabled={loading}
            className="w-full"
          >
            Sign in with Google
          </Button>
        </GlassPanel>

        <p className="text-center text-text-secondary text-sm mt-6">
          Need access? Contact your administrator.
        </p>

        {/* DEV ONLY: Local dev login button */}
        {isDev && (
          <div className="mt-4 p-4 border border-accent-orange/30 rounded-lg bg-accent-orange/10">
            <p className="text-accent-orange text-xs text-center mb-2">DEV MODE ONLY</p>
            <Button 
              onClick={async () => {
                setLoading(true)
                const result = await signInAsDev()
                if (result.success) {
                  router.push('/')
                }
                setLoading(false)
              }}
              variant="secondary"
              disabled={loading}
              className="w-full"
            >
              {loading ? <LoadingSpinner /> : <span>Dev Login (Admin)</span>}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}