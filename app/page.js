'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, DollarSign, Users, Briefcase, MapPin, 
  Brain, FileText, Activity, Zap, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  AlertTriangle, Target, BarChart3, Radio, RefreshCw,
  Plus, X, Send
} from 'lucide-react'
import { getDb, collection, getDocs, addDoc, query, orderBy, onSnapshot } from './firebase'

// Components
function GlassPanel({ children, className = '', glow = false }) {
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

function StatCard({ icon: Icon, label, value, change, prefix = '' }) {
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

function JobCard({ job, onUpdate }) {
  const statusColors = {
    active: 'bg-accent-green',
    bidding: 'bg-accent-orange',
    research: 'bg-accent-blue',
    completed: 'bg-text-secondary',
  }
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[job.status]} pulse-live`} />
        <div>
          <p className="font-medium text-sm">{job.name}</p>
          <p className="text-xs text-text-secondary">${(job.value || 0).toLocaleString()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{job.probability || 0}%</p>
        <p className="text-xs text-text-secondary">win prob</p>
      </div>
    </div>
  )
}

function TechCard({ tech }) {
  const statusColors = {
    field: 'text-accent-green',
    shop: 'text-accent-orange',
  }
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
      <div className={`p-2 rounded-lg ${tech.status === 'field' ? 'bg-accent-green/20' : 'bg-accent-orange/20'}`}>
        <Users className={`w-5 h-5 ${statusColors[tech.status]}`} />
      </div>
      <div className="flex-1">
        <p className="font-medium">{tech.name}</p>
        <p className="text-xs text-text-secondary">{tech.job || 'Available'}</p>
      </div>
      <div className="text-right">
        <p className="text-sm">{tech.eta || '-'}</p>
        <p className="text-xs text-text-secondary">{tech.location || 'Base'}</p>
      </div>
    </div>
  )
}

function InsightCard({ insight }) {
  const priorityColors = {
    high: 'border-l-accent-red',
    medium: 'border-l-accent-orange',
    low: 'border-l-accent-blue',
  }
  const icons = {
    opportunity: Target,
    warning: AlertTriangle,
    recommendation: Brain,
  }
  const Icon = icons[insight.type] || Brain
  
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg bg-white/5 border-l-4 ${priorityColors[insight.priority]}`}>
      <Icon className="w-5 h-5 text-accent-blue mt-0.5" />
      <p className="text-sm">{insight.text}</p>
    </div>
  )
}

function MetricBar({ label, value, max, color = 'bg-accent-blue' }) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span>${(value || 0).toLocaleString()}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  )
}

function CommandBar({ onCommand, loading }) {
  const [query, setQuery] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onCommand(query)
      setQuery('')
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask Kevin anything..."
        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
      />
      <button 
        type="submit"
        disabled={loading}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-accent-blue rounded-lg hover:bg-accent-blue/80 transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}

function Sidebar() {
  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-20 h-screen fixed left-0 top-0 glass-panel rounded-none border-y-0 border-l-0 flex flex-col items-center py-8 gap-6 z-50"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
        <span className="text-xl font-bold">DD</span>
      </div>
      <nav className="flex flex-col gap-4">
        {[
          { icon: Activity, active: true },
          { icon: TrendingUp },
          { icon: Briefcase },
          { icon: MapPin },
          { icon: Brain },
          { icon: FileText },
        ].map((item, i) => (
          <button 
            key={i}
            className={`p-3 rounded-xl transition-all ${item.active ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>
      <div className="mt-auto">
        <button className="p-3 rounded-xl text-text-secondary hover:bg-white/5 hover:text-white transition-all">
          <Radio className="w-5 h-5 pulse-live" />
        </button>
      </div>
    </motion.aside>
  )
}

function Header({ onRefresh }) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          Mission Control
          <span className="px-2 py-1 text-xs bg-accent-green/20 text-accent-green rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-accent-green rounded-full pulse-live" />
            LIVE
          </span>
        </h1>
        <p className="text-text-secondary">Data Dogs Operations • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-text-secondary">Sync</span>
        </button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-blue/20 border border-accent-blue/30">
          <Brain className="w-4 h-4 text-accent-blue" />
          <span className="text-sm font-medium">Kevin Active</span>
        </div>
      </div>
    </header>
  )
}

function AddJobForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', value: '', status: 'active', probability: 90 })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      value: parseInt(formData.value) || 0,
      probability: parseInt(formData.probability) || 0,
      createdAt: new Date().toISOString()
    })
    onClose()
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <GlassPanel className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New Job</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Job Name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
            required
          />
          <input
            type="number"
            placeholder="Value ($)"
            value={formData.value}
            onChange={e => setFormData({...formData, value: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
          />
          <select
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
          >
            <option value="active">Active</option>
            <option value="bidding">Bidding</option>
            <option value="research">Research</option>
          </select>
          <input
            type="number"
            placeholder="Win Probability %"
            value={formData.probability}
            onChange={e => setFormData({...formData, probability: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
          />
          <button type="submit" className="w-full bg-accent-blue py-3 rounded-lg font-medium">
            Add Job
          </button>
        </form>
      </GlassPanel>
    </div>
  )
}

export default function Dashboard() {
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [financials, setFinancials] = useState({ revenue: 0, expenses: 0, profit: 0, cashPosition: 0 })
  const [insights, setInsights] = useState([])
  const [showAddJob, setShowAddJob] = useState(false)
  
  // Fetch data from Firebase
  useEffect(() => {
    let unsubJobs, unsubTechs, unsubFin, unsubInsights
    
    const initFirebase = async () => {
      const db = await getDb()
      if (!db) {
        console.log('Firebase not initialized')
        return
      }
      
      // Jobs
      const jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
      unsubJobs = onSnapshot(jobsQuery, (snapshot) => {
        const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setJobs(jobsData)
      })
      
      // Technicians
      const techsQuery = query(collection(db, 'technicians'), orderBy('name', 'asc'))
      unsubTechs = onSnapshot(techsQuery, (snapshot) => {
        const techsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setTechnicians(techsData)
      })
      
      // Financials
      const finQuery = query(collection(db, 'financials'), orderBy('date', 'desc'))
      unsubFin = onSnapshot(finQuery, (snapshot) => {
        if (!snapshot.empty) {
          const latest = snapshot.docs[0].data()
          setFinancials(latest)
        }
      })
      
      // Insights
      const insightsQuery = query(collection(db, 'insights'), orderBy('createdAt', 'desc'))
      unsubInsights = onSnapshot(insightsQuery, (snapshot) => {
        const insightsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setInsights(insightsData.slice(0, 3))
      })
    }
    
    initFirebase()
    
    return () => {
      unsubJobs?.()
      unsubTechs?.()
      unsubFin?.()
      unsubInsights?.()
    }
  }, [])
  
  const handleRefresh = async () => {
    // Force re-render by updating state
    window.location.reload()
  }
  
  const handleCommand = async (cmd) => {
    setLoading(true)
    // In production, this would call Kevin API
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }
  
  const handleAddJob = async (jobData) => {
    try {
      const db = await getDb()
      if (!db) return
      await addDoc(collection(db, 'jobs'), {
        ...jobData,
        createdAt: new Date().toISOString()
      })
      setShowAddJob(false)
    } catch (e) {
      console.error('Error adding job:', e)
    }
  }
  
  const activeJobs = jobs.filter(j => j.status === 'active')
  const completedJobs = jobs.filter(j => j.status === 'completed')
  
  const totalValue = jobs.reduce((sum, j) => sum + (j.value || 0), 0)
  const avgProbability = jobs.length > 0 
    ? Math.round(jobs.reduce((sum, j) => sum + (j.probability || 0), 0) / jobs.length)
    : 0
  
  return (
    <div className="min-h-screen pb-8">
      <Sidebar />
      <main className="pl-24 pr-8 pt-8">
        <Header onRefresh={handleRefresh} />
        <CommandBar onCommand={handleCommand} loading={loading} />
        
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <StatCard 
            icon={Briefcase} 
            label="Active Jobs" 
            value={activeJobs.length} 
            change={8}
          />
          <StatCard 
            icon={CheckCircle} 
            label="Completed" 
            value={completedJobs.length} 
            change={23}
          />
          <StatCard 
            icon={DollarSign} 
            label="Pipeline Value" 
            value={totalValue} 
            prefix="$"
            change={12}
          />
          <StatCard 
            icon={TrendingUp} 
            label="Avg Win Rate" 
            value={avgProbability} 
            prefix="%"
            change={5}
          />
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Operations */}
          <GlassPanel className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-blue" />
                Operations Command
              </h2>
              <button 
                onClick={() => setShowAddJob(true)}
                className="text-accent-blue text-sm flex items-center gap-1 hover:underline"
              >
                <Plus size={16} /> Add Job
              </button>
            </div>
            <div className="space-y-3">
              {jobs.filter(j => j.status === 'active').map(job => (
                <JobCard key={job.id} job={job} />
              ))}
              {jobs.filter(j => j.status === 'active').length === 0 && (
                <p className="text-text-secondary text-center py-8">No active jobs. Add one!</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-text-secondary text-sm">In Progress</p>
                <p className="text-2xl font-bold text-accent-orange">{jobs.filter(j => j.status === 'active').length}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-text-secondary text-sm">Bidding</p>
                <p className="text-2xl font-bold text-accent-blue">{jobs.filter(j => j.status === 'bidding').length}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-text-secondary text-sm">Completed</p>
                <p className="text-2xl font-bold text-accent-green">{completedJobs.length}</p>
              </div>
            </div>
          </GlassPanel>
          
          {/* Financial */}
          <GlassPanel>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-accent-green" />
              Financial Command
            </h2>
            <div className="space-y-4">
              <MetricBar label="Revenue" value={financials.revenue || 284500} max={350000} color="bg-accent-green" />
              <MetricBar label="Expenses" value={financials.expenses || 142300} max={350000} color="bg-accent-red" />
              <MetricBar label="Profit" value={financials.profit || 142200} max={350000} color="bg-accent-blue" />
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Cash Position</span>
                <span className="font-medium">${(financials.cashPosition || 89200).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Pipeline</span>
                <span className="font-medium">${totalValue.toLocaleString()}</span>
              </div>
            </div>
          </GlassPanel>
          
          {/* Contracts */}
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent-purple" />
                Contract Pipeline
              </h2>
            </div>
            <div className="space-y-2">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
              {jobs.length === 0 && (
                <p className="text-text-secondary text-center py-8">No contracts yet</p>
              )}
            </div>
          </GlassPanel>
          
          {/* Techs */}
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-orange" />
                Technician Status
              </h2>
              <span className="text-xs text-text-secondary">{technicians.length} techs</span>
            </div>
            <div className="space-y-2">
              {technicians.map(tech => (
                <TechCard key={tech.id} tech={tech} />
              ))}
              {technicians.length === 0 && (
                <>
                  <TechCard tech={{ name: 'Dalton', status: 'field', job: 'Pilot #47', eta: '45 min', location: 'Knoxville' }} />
                  <TechCard tech={{ name: 'Tech #1', status: 'shop', job: 'Available', eta: '-', location: 'Base' }} />
                </>
              )}
            </div>
          </GlassPanel>
          
          {/* AI Insights */}
          <GlassPanel glow>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent-blue" />
                Kevin Insights
              </h2>
              <span className="text-xs text-accent-blue">AI Powered</span>
            </div>
            <div className="space-y-2">
              {insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
              {insights.length === 0 && (
                <>
                  <InsightCard insight={{ type: 'opportunity', text: 'Add jobs to see AI insights', priority: 'low' }} />
                </>
              )}
            </div>
            <button className="w-full mt-4 py-2 rounded-lg bg-accent-blue/20 text-accent-blue text-sm hover:bg-accent-blue/30 transition-colors">
              Ask Kevin →
            </button>
          </GlassPanel>
        </div>
        
        {/* Command Response */}
        <AnimatePresence>
          {command && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <GlassPanel className="border-accent-purple/30">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-accent-purple/20">
                    <Brain className="w-5 h-5 text-accent-purple" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">You asked:</p>
                    <p className="font-medium mb-2">"{command}"</p>
                    {loading ? (
                      <p className="text-sm text-accent-blue">Kevin is analyzing your data...</p>
                    ) : (
                      <p className="text-sm">I can help you analyze your business data, suggest contracts to bid on, or provide strategic recommendations. Try asking things like "Which job has the highest profit margin?" or "What should we bid next?"</p>
                    )}
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Add Job Modal */}
      <AnimatePresence>
        {showAddJob && (
          <AddJobForm 
            onClose={() => setShowAddJob(false)} 
            onSubmit={handleAddJob} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
