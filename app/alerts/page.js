'use client'

import { GlassPanel, Badge, EmptyState, LoadingSpinner } from '@/components/ui'
import { Header, Sidebar } from '@/components/ui'
import { useAlerts } from '@/lib/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { AlertTriangle, CheckCircle, Bell, Clock } from 'lucide-react'

export default function AlertsPage() {
  const { alerts, loading, resolveAlert } = useAlerts()
  const { isAdmin, isManager } = useAuth()

  const unresolvedAlerts = alerts.filter(a => !a.resolved)
  const resolvedAlerts = alerts.filter(a => a.resolved)

  const severityColors = {
    critical: 'bg-accent-red/20 border-accent-red text-accent-red',
    high: 'bg-accent-red/10 border-accent-red/50',
    medium: 'bg-accent-orange/10 border-accent-orange/50',
    low: 'bg-accent-blue/10 border-accent-blue/50'
  }

  const typeIcons = {
    financial: '$',
    operational: '⚙',
    risk: '⚠',
    safety: '🔒',
    schedule: '📅'
  }

  const handleResolve = async (alertId) => {
    const result = await resolveAlert(alertId)
    if (!result.success) {
      alert('Error resolving alert: ' + result.error)
    }
  }

  return (
    <div className="min-h-screen pb-8">
      <Sidebar />
      <main className="pl-24 pr-8 pt-8">
        <Header title="Alerts" subtitle="System Notifications" />

        <div className="grid grid-cols-2 gap-4 mb-6">
          <GlassPanel>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent-red/20">
                <AlertTriangle className="w-6 h-6 text-accent-red" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Active Alerts</p>
                <p className="text-2xl font-bold">{unresolvedAlerts.length}</p>
              </div>
            </div>
          </GlassPanel>
          <GlassPanel>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent-green/20">
                <CheckCircle className="w-6 h-6 text-accent-green" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Resolved</p>
                <p className="text-2xl font-bold">{resolvedAlerts.length}</p>
              </div>
            </div>
          </GlassPanel>
        </div>

        <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : unresolvedAlerts.length > 0 ? (
          <div className="space-y-3">
            {unresolvedAlerts.map(alert => (
              <GlassPanel key={alert.id} className={`border-l-4 ${severityColors[alert.severity]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'danger' : 'warning'}>
                        {alert.severity}
                      </Badge>
                      <Badge>{alert.type}</Badge>
                    </div>
                    <h3 className="font-medium">{alert.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">{alert.message}</p>
                    {alert.relatedEntityType && (
                      <p className="text-xs text-text-secondary mt-2">
                        Related: {alert.relatedEntityType} ({alert.relatedEntityId})
                      </p>
                    )}
                  </div>
                  
                  {(isAdmin || isManager) && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1 text-sm bg-accent-green/20 text-accent-green rounded-lg hover:bg-accent-green/30"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </GlassPanel>
            ))}
          </div>
        ) : (
          <GlassPanel className="text-center py-12">
            <Bell className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No active alerts</p>
          </GlassPanel>
        )}

        {resolvedAlerts.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Resolved</h2>
            <div className="space-y-3 opacity-60">
              {resolvedAlerts.slice(0, 10).map(alert => (
                <GlassPanel key={alert.id} className="border-l-4 border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{alert.title}</h3>
                      <p className="text-sm text-text-secondary">{alert.message}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-accent-green" />
                  </div>
                </GlassPanel>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}