'use client'

import { GlassPanel, Badge, EmptyState, LoadingSpinner } from '@/components/ui'
import { Header, Sidebar } from '@/components/ui'
import { useInsights } from '@/lib/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { Brain, Target, AlertTriangle, Lightbulb, TrendingUp, Clock } from 'lucide-react'

export default function InsightsPage() {
  const { insights, loading } = useInsights()

  const priorityColors = {
    high: 'border-l-accent-red bg-accent-red/5',
    medium: 'border-l-accent-orange bg-accent-orange/5',
    low: 'border-l-accent-blue bg-accent-blue/5'
  }

  const typeIcons = {
    opportunity: Target,
    warning: AlertTriangle,
    recommendation: Lightbulb,
    alert: AlertTriangle
  }

  return (
    <div className="min-h-screen pb-8">
      <Sidebar />
      <main className="pl-24 pr-8 pt-8">
        <Header title="Kevin Insights" subtitle="AI-Powered Recommendations" />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <GlassPanel>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent-green/20">
                <Target className="w-6 h-6 text-accent-green" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Opportunities</p>
                <p className="text-2xl font-bold">
                  {insights.filter(i => i.type === 'opportunity').length}
                </p>
              </div>
            </div>
          </GlassPanel>
          <GlassPanel>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent-orange/20">
                <AlertTriangle className="w-6 h-6 text-accent-orange" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Warnings</p>
                <p className="text-2xl font-bold">
                  {insights.filter(i => i.type === 'warning').length}
                </p>
              </div>
            </div>
          </GlassPanel>
          <GlassPanel>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent-blue/20">
                <Lightbulb className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Recommendations</p>
                <p className="text-2xl font-bold">
                  {insights.filter(i => i.type === 'recommendation').length}
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>

        <h2 className="text-xl font-semibold mb-4">Recent Insights</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map(insight => {
              const Icon = typeIcons[insight.type] || Brain
              return (
                <GlassPanel 
                  key={insight.id} 
                  glow={insight.priority === 'high'}
                  className={`border-l-4 ${priorityColors[insight.priority]}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-white/10">
                      <Icon className="w-5 h-5 text-accent-blue" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          insight.priority === 'high' ? 'danger' : 
                          insight.priority === 'medium' ? 'warning' : 'info'
                        }>
                          {insight.priority}
                        </Badge>
                        <Badge>{insight.type}</Badge>
                        {insight.confidence && (
                          <span className="text-xs text-text-secondary">
                            {insight.confidence}% confidence
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium">{insight.title}</h3>
                      <p className="text-sm text-text-secondary mt-1">{insight.message}</p>
                      
                      {insight.recommendation && (
                        <div className="mt-3 p-3 bg-white/5 rounded-lg">
                          <p className="text-sm">
                            <span className="text-accent-blue font-medium">Recommendation: </span>
                            {insight.recommendation}
                          </p>
                        </div>
                      )}
                      
                      {insight.relatedEntityType && (
                        <p className="text-xs text-text-secondary mt-2">
                          Related: {insight.relatedEntityType} ({insight.relatedEntityId})
                        </p>
                      )}
                    </div>
                    
                    <div className="text-xs text-text-secondary flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {insight.createdAt?.toDate ? insight.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                </GlassPanel>
              )
            })}
          </div>
        ) : (
          <GlassPanel className="text-center py-12">
            <Brain className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No insights generated yet</p>
            <p className="text-sm text-text-secondary mt-2">
              Kevin generates insights from your data automatically
            </p>
          </GlassPanel>
        )}
      </main>
    </div>
  )
}