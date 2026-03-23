'use client'

import { useState, useEffect } from 'react'
import { GlassPanel, StatCard, Badge, LoadingSpinner } from '@/components/ui'
import { Header, Sidebar } from '@/components/ui'
import { JobList, JobCard } from '@/components/jobs'
import { useJobs, useAlerts, useInsights } from '@/lib/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Briefcase, CheckCircle, DollarSign, TrendingUp, 
  Activity, Brain, AlertTriangle, Target, Zap
} from 'lucide-react'

// Command bar component
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
        <Zap className="w-4 h-4" />
      </button>
    </form>
  )
}

// Job status summary
function JobStatusSummary({ jobs }) {
  const statusCounts = {
    active: jobs.filter(j => j.status === 'active').length,
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    complete: jobs.filter(j => j.status === 'complete').length,
    blocked: jobs.filter(j => j.status === 'blocked').length
  }

  return (
    <div className="grid grid-cols-5 gap-4 mt-6">
      <div className="p-4 rounded-xl bg-white/5">
        <p className="text-text-secondary text-sm">Active</p>
        <p className="text-2xl font-bold text-accent-green">{statusCounts.active}</p>
      </div>
      <div className="p-4 rounded-xl bg-white/5">
        <p className="text-text-secondary text-sm">Scheduled</p>
        <p className="text-2xl font-bold text-accent-blue">{statusCounts.scheduled}</p>
      </div>
      <div className="p-4 rounded-xl bg-white/5">
        <p className="text-text-secondary text-sm">Pending</p>
        <p className="text-2xl font-bold text-accent-orange">{statusCounts.pending}</p>
      </div>
      <div className="p-4 rounded-xl bg-white/5">
        <p className="text-text-secondary text-sm">Blocked</p>
        <p className="text-2xl font-bold text-accent-red">{statusCounts.blocked}</p>
      </div>
      <div className="p-4 rounded-xl bg-white/5">
        <p className="text-text-secondary text-sm">Completed</p>
        <p className="text-2xl font-bold">{statusCounts.complete}</p>
      </div>
    </div>
  )
}

// Metric bar component
function MetricBar({ label, value, max, color = 'bg-accent-blue' }) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span>${(value || 0).toLocaleString()}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

// Insight card component
function InsightCard({ insight }) {
  const icons = {
    opportunity: Target,
    warning: AlertTriangle,
    recommendation: Brain,
  }
  const colors = {
    high: 'border-l-accent-red',
    medium: 'border-l-accent-orange',
    low: 'border-l-accent-blue'
  }
  const Icon = icons[insight.type] || Brain

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg bg-white/5 border-l-4 ${colors[insight.priority]}`}>
      <Icon className="w-5 h-5 text-accent-blue mt-0.5" />
      <div>
        <p className="text-sm">{insight.message}</p>
        {insight.recommendation && (
          <p className="text-xs text-text-secondary mt-1">{insight.recommendation}</p>
        )}
      </div>
    </div>
  )
}

// Alert card component
function AlertCard({ alert, onResolve }) {
  const colors = {
    critical: 'border-l-accent-red bg-accent-red/10',
    high: 'border-l-accent-red',
    medium: 'border-l-accent-orange',
    low: 'border-l-accent-blue'
  }

  return (
    <div className={`flex items-start justify-between p-3 rounded-lg bg-white/5 border-l-4 ${colors[alert.severity]}`}>
      <div>
        <p className="font-medium text-sm">{alert.title}</p>
        <p className="text-xs text-text-secondary">{alert.message}</p>
      </div>
      {!alert.resolved && (
        <button 
          onClick={() => onResolve(alert.id)}
          className="text-xs text-accent-blue hover:underline"
        >
          Resolve
        </button>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { jobs, loading: jobsLoading } = useJobs()
  const { alerts, loading: alertsLoading, resolveAlert } = useAlerts()
  const { insights, loading: insightsLoading } = useInsights()
  const [commandLoading, setCommandLoading] = useState(false)
  const { isAdmin, isManager } = useAuth()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleCommand = async (cmd) => {
    setCommandLoading(true)
    // For now, just simulate - Kevin integration comes last
    setTimeout(() => {
      setCommandLoading(false)
    }, 2000)
  }

  // Calculate real metrics
  const activeJobs = jobs.filter(j => j.status === 'active')
  const completedJobs = jobs.filter(j => j.status === 'complete')
  const totalPipelineValue = jobs.reduce((sum, j) => sum + (j.quotedRevenue || 0), 0)
  const completedRevenue = jobs
    .filter(j => j.status === 'complete')
    .reduce((sum, j) => sum + (j.actualRevenue || 0), 0)
  
  const avgWinRate = jobs.length > 0 
    ? Math.round(jobs.reduce((sum, j) => sum + (j.probability || 0), 0) / jobs.length)
    : 0

  const unresolvedAlerts = alerts.filter(a => !a.resolved)

  if (jobsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <Sidebar />
      <main className="pl-24 pr-8 pt-8">
        <Header onRefresh={handleRefresh} />
        
        {/* Command Bar */}
        {isAdmin || isManager ? (
          <CommandBar onCommand={handleCommand} loading={commandLoading} />
        ) : null}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <StatCard 
            icon={Briefcase} 
            label="Active Jobs" 
            value={activeJobs.length}
            loading={jobsLoading}
          />
          <StatCard 
            icon={CheckCircle} 
            label="Completed" 
            value={completedJobs.length}
            loading={jobsLoading}
          />
          <StatCard 
            icon={DollarSign} 
            label="Pipeline Value" 
            value={totalPipelineValue} 
            prefix="$"
            loading={jobsLoading}
          />
          <StatCard 
            icon={TrendingUp} 
            label="Avg Win Rate" 
            value={avgWinRate} 
            prefix="%"
            loading={jobsLoading}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Operations Command */}
          <GlassPanel className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-blue" />
                Operations Command
              </h2>
              <a href="/jobs" className="text-accent-blue text-sm hover:underline">
                View all
              </a>
            </div>
            
            {activeJobs.length > 0 ? (
              <JobList jobs={activeJobs} onJobClick={() => {}} />
            ) : (
              <div className="text-center py-8 text-text-secondary">
                No active jobs
              </div>
            )}
            
            <JobStatusSummary jobs={jobs} />
          </GlassPanel>

          {/* Financial Command */}
          <GlassPanel>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-accent-green" />
              Financial Command
            </h2>
            <div className="space-y-4">
              <MetricBar label="Revenue (YTD)" value={completedRevenue} max={500000} color="bg-accent-green" />
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Pipeline</span>
                <span className="font-medium">${totalPipelineValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Completed Jobs</span>
                <span className="font-medium">{completedJobs.length}</span>
              </div>
            </div>
          </GlassPanel>

          {/* Alerts */}
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent-red" />
                Alerts
              </h2>
              {unresolvedAlerts.length > 0 && (
                <Badge variant="danger">{unresolvedAlerts.length}</Badge>
              )}
            </div>
            <div className="space-y-2">
              {unresolvedAlerts.slice(0, 3).map(alert => (
                <AlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onResolve={resolveAlert}
                />
              ))}
              {unresolvedAlerts.length === 0 && (
                <p className="text-text-secondary text-sm text-center py-4">
                  No active alerts
                </p>
              )}
            </div>
          </GlassPanel>

          {/* Kevin Insights */}
          <GlassPanel glow>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent-blue" />
                Kevin Insights
              </h2>
              <span className="text-xs text-accent-blue">AI Powered</span>
            </div>
            <div className="space-y-2">
              {insights.slice(0, 3).map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
              {insights.length === 0 && (
                <p className="text-text-secondary text-sm text-center py-4">
                  No insights available yet
                </p>
              )}
            </div>
            <a href="/insights" className="block mt-4 text-center text-accent-blue text-sm hover:underline">
              View all insights →
            </a>
          </GlassPanel>
        </div>
      </main>
    </div>
  )
}