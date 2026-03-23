'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
export { Sidebar } from './Sidebar'
export { Header } from './Header'
export { ProtectedRoute } from './ProtectedRoute'

export function GlassPanel({ children, className = '', glow = false }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel p-6 ${glow ? 'glow-blue' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl bg-white/5 border border-white/10 ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, change, prefix = '', loading = false }) {
  if (loading) {
    return (
      <GlassPanel className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-accent-blue/20 animate-pulse">
          <div className="w-6 h-6 bg-accent-blue/30 rounded" />
        </div>
        <div>
          <p className="text-text-secondary text-sm">{label}</p>
          <div className="h-8 w-24 bg-white/10 rounded animate-pulse mt-1" />
        </div>
      </GlassPanel>
    )
  }

  const isPositive = change >= 0
  
  return (
    <GlassPanel className="flex items-center gap-4">
      <div className="p-3 rounded-xl bg-accent-blue/20">
        <Icon className="w-6 h-6 text-accent-blue" />
      </div>
      <div>
        <p className="text-text-secondary text-sm">{label}</p>
        <p className="text-2xl font-bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {change !== undefined && (
          <p className={`text-xs ${isPositive ? 'text-accent-green' : 'text-accent-red'} flex items-center gap-1`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </p>
        )}
      </div>
    </GlassPanel>
  )
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}) {
  const variants = {
    primary: 'bg-accent-blue hover:bg-accent-blue/80 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    danger: 'bg-accent-red hover:bg-accent-red/80 text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Input({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  placeholder = '',
  required = false,
  error = '',
  disabled = false,
  className = ''
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm text-text-secondary">
          {label} {required && <span className="text-accent-red">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full bg-white/5 border ${error ? 'border-accent-red' : 'border-white/10'} rounded-lg p-3 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all disabled:opacity-50`}
      />
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  )
}

export function Select({ 
  label, 
  value, 
  onChange, 
  options = [],
  required = false,
  error = '',
  className = ''
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm text-text-secondary">
          {label} {required && <span className="text-accent-red">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-white/5 border ${error ? 'border-accent-red' : 'border-white/10'} rounded-lg p-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all appearance-none`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  )
}

export function TextArea({ 
  label, 
  value, 
  onChange, 
  placeholder = '',
  rows = 3,
  required = false,
  error = '',
  className = ''
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm text-text-secondary">
          {label} {required && <span className="text-accent-red">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full bg-white/5 border ${error ? 'border-accent-red' : 'border-white/10'} rounded-lg p-3 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all resize-none disabled:opacity-50`}
      />
      {error && <p className="text-xs text-accent-red">{error}</p>}
    </div>
  )
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/10 text-white',
    success: 'bg-accent-green/20 text-accent-green',
    warning: 'bg-accent-orange/20 text-accent-orange',
    danger: 'bg-accent-red/20 text-accent-red',
    info: 'bg-accent-blue/20 text-accent-blue'
  }

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`${sizes[size]} border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin`} />
  )
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="w-12 h-12 text-text-secondary mb-4" />}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-4">{message}</p>
      {action}
    </div>
  )
}