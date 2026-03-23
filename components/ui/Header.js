'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Brain, RefreshCw, LogOut } from 'lucide-react'

export function Header({ onRefresh, title = 'Mission Control', subtitle = 'Data Dogs Operations' }) {
  const { user, userRole, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {title}
          <span className="px-2 py-1 text-xs bg-accent-green/20 text-accent-green rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-accent-green rounded-full pulse-live" />
            LIVE
          </span>
        </h1>
        <p className="text-text-secondary">
          {subtitle} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-text-secondary">Sync</span>
          </button>
        )}
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-blue/20 border border-accent-blue/30">
          <Brain className="w-4 h-4 text-accent-blue" />
          <span className="text-sm font-medium">Kevin Active</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center text-sm font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-sm">
            <p className="font-medium">{userRole?.role || 'User'}</p>
            <p className="text-text-secondary text-xs truncate max-w-[120px]">{user?.email}</p>
          </div>
        </div>

        <button 
          onClick={signOut}
          className="p-2 rounded-xl text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}