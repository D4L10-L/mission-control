'use client'

import { Badge } from '@/components/ui'

const statusColors = {
  pending: 'bg-text-secondary',
  scheduled: 'bg-accent-blue',
  active: 'bg-accent-green',
  complete: 'bg-accent-green',
  blocked: 'bg-accent-red',
  cancelled: 'bg-accent-red'
}

const priorityColors = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'danger'
}

export function JobCard({ job, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${statusColors[job.status]} pulse-live`} />
        <div>
          <p className="font-medium text-sm">{job.storeNumber || job.customerName}</p>
          <p className="text-xs text-text-secondary">
            {job.customerName} • ${(job.quotedRevenue || 0).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <Badge variant={priorityColors[job.priority]}>
          {job.priority || 'medium'}
        </Badge>
        <p className="text-xs text-text-secondary mt-1">
          {job.probability || 0}% win
        </p>
      </div>
    </div>
  )
}

export function JobList({ jobs, onJobClick, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg bg-white/5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-white/20 rounded mb-2" />
                <div className="h-3 w-24 bg-white/10 rounded" />
              </div>
              <div className="text-right">
                <div className="h-4 w-12 bg-white/20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        No jobs found. Create your first job to get started.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard 
          key={job.id} 
          job={job} 
          onClick={() => onJobClick?.(job)}
        />
      ))}
    </div>
  )
}