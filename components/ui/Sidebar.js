'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  Briefcase, 
  MapPin, 
  Brain, 
  FileText,
  Radio,
  LogOut,
  Users
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { icon: Activity, label: 'Dashboard', href: '/' },
  { icon: Briefcase, label: 'Jobs', href: '/jobs' },
  { icon: TrendingUp, label: 'Leads', href: '/leads' },
  { icon: Users, label: 'Techs', href: '/technicians' },
  { icon: Brain, label: 'Insights', href: '/insights' },
  { icon: FileText, label: 'Alerts', href: '/alerts' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut, isAdmin } = useAuth()

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-20 h-screen fixed left-0 top-0 glass-panel rounded-none border-y-0 border-l-0 flex flex-col items-center py-8 gap-6 z-50"
    >
      <Link href="/">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
          <span className="text-xl font-bold">DD</span>
        </div>
      </Link>
      
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`p-3 rounded-xl transition-all relative group ${isActive ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <button 
          onClick={signOut}
          className="p-3 rounded-xl text-text-secondary hover:bg-white/5 hover:text-white transition-all"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <div className="p-3 rounded-xl">
          <Radio className="w-5 h-5 text-accent-green pulse-live" />
        </div>
      </div>
    </motion.aside>
  )
}