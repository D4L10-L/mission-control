'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Test Page</h1>
      <p>This is a test page.</p>
    </div>
  )
}