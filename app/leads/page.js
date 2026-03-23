'use client'

import { useState } from 'react'
import { GlassPanel, Button, Badge, Input, Select, TextArea, LoadingSpinner } from '@/components/ui'
import { Header, Sidebar } from '@/components/ui'
import { useJobs } from '@/lib/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, TrendingUp, Building, Phone, Mail, X, ArrowRight } from 'lucide-react'

// Lead card component
function LeadCard({ lead, onClick, onConvert }) {
  const stageColors = {
    new: 'bg-text-secondary',
    contacted: 'bg-accent-blue',
    qualifying: 'bg-purple-500',
    proposing: 'bg-accent-orange',
    negotiating: 'bg-yellow-500',
    won: 'bg-accent-green',
    lost: 'bg-accent-red'
  }

  return (
    <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium">{lead.company}</h3>
          <p className="text-sm text-text-secondary">{lead.contactName}</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${stageColors[lead.stage]}`} />
      </div>
      
      <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          ${(lead.estimatedValue || 0).toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {lead.probabilityScore || 0}%
        </span>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant={lead.stage === 'won' ? 'success' : lead.stage === 'lost' ? 'danger' : 'default'}>
          {lead.stage}
        </Badge>
        {lead.stage === 'won' && onConvert && (
          <button 
            onClick={(e) => { e.stopPropagation(); onConvert(lead) }}
            className="text-xs text-accent-blue hover:underline flex items-center gap-1"
          >
            Convert to Job <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// Lead form component
function LeadForm({ lead, onSubmit, onClose, loading }) {
  const [formData, setFormData] = useState({
    company: lead?.company || '',
    contactName: lead?.contactName || '',
    contactEmail: lead?.contactEmail || '',
    contactPhone: lead?.contactPhone || '',
    source: lead?.source || 'web',
    jobType: lead?.jobType || '',
    description: lead?.description || '',
    estimatedValue: lead?.estimatedValue?.toString() || '',
    probabilityScore: lead?.probabilityScore?.toString() || '50',
    stage: lead?.stage || 'new'
  })

  const sources = [
    { value: 'sam.gov', label: 'SAM.gov' },
    { value: 'web', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'repeat', label: 'Repeat Client' }
  ]

  const stages = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualifying', label: 'Qualifying' },
    { value: 'proposing', label: 'Proposing' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      estimatedValue: Number(formData.estimatedValue) || 0,
      probabilityScore: Number(formData.probabilityScore) || 0
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassPanel className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {lead ? 'Edit Lead' : 'Create New Lead'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company Name"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Name"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="John Doe"
            />
            <Input
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="john@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="+15551234567"
            />
            <Select
              label="Source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              options={sources}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Estimated Value ($)"
              name="estimatedValue"
              type="number"
              value={formData.estimatedValue}
              onChange={handleChange}
              placeholder="0"
            />
            <Input
              label="Probability (%)"
              name="probabilityScore"
              type="number"
              value={formData.probabilityScore}
              onChange={handleChange}
              placeholder="50"
            />
            <Select
              label="Stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              options={stages}
            />
          </div>

          <Input
            label="Job Type"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            placeholder="e.g., Network Install, Fiber"
          />

          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the opportunity..."
            rows={3}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </GlassPanel>
    </div>
  )
}

export default function LeadsPage() {
  const { leads, loading, createLead, updateLead } = require('@/lib/hooks').useLeads()
  const { createJob } = useJobs()
  const { isAdmin, isManager } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true
    if (filter === 'active') return ['new', 'contacted', 'qualifying', 'proposing', 'negotiating'].includes(lead.stage)
    return lead.stage === filter
  })

  const handleCreateLead = async (leadData) => {
    setFormLoading(true)
    const result = await createLead(leadData)
    setFormLoading(false)
    if (result.success) {
      setShowForm(false)
    } else {
      alert('Error creating lead: ' + result.error)
    }
  }

  const handleUpdateLead = async (leadData) => {
    if (!editingLead) return
    setFormLoading(true)
    const result = await updateLead(editingLead.id, leadData)
    setFormLoading(false)
    if (result.success) {
      setEditingLead(null)
    } else {
      alert('Error updating lead: ' + result.error)
    }
  }

  const handleConvertToJob = async (lead) => {
    if (!confirm(`Convert "${lead.company}" to a job?`)) return
    
    const jobData = {
      storeNumber: lead.company,
      customerName: lead.company,
      jobType: lead.jobType || 'network_install',
      status: 'pending',
      priority: 'medium',
      quotedRevenue: lead.estimatedValue,
      notes: `Converted from lead.\nContact: ${lead.contactName}\n${lead.contactEmail}\n${lead.contactPhone}\n\n${lead.description || ''}`
    }

    const result = await createJob(jobData)
    if (result.success) {
      await updateLead(lead.id, { stage: 'won' })
      alert('Lead converted to job successfully!')
    } else {
      alert('Error converting lead: ' + result.error)
    }
  }

  const canCreate = isAdmin || isManager

  const stageCounts = {
    all: leads.length,
    active: leads.filter(l => ['new', 'contacted', 'qualifying', 'proposing', 'negotiating'].includes(l.stage)).length,
    won: leads.filter(l => l.stage === 'won').length,
    lost: leads.filter(l => l.stage === 'lost').length
  }

  return (
    <div className="min-h-screen pb-8">
      <Sidebar />
      <main className="pl-24 pr-8 pt-8">
        <Header title="Leads Pipeline" subtitle="Sales Opportunities" />
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent-blue" />
            Pipeline
            <Badge variant="info">{leads.length}</Badge>
          </h2>

          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {['all', 'active', 'won', 'lost'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                  filter === status 
                    ? 'bg-accent-blue text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {status} ({stageCounts[status]})
              </button>
            ))}
          </div>

          {canCreate && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </Button>
          )}
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-3 gap-4">
          {filteredLeads.map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onClick={() => canCreate && setEditingLead(lead)}
              onConvert={canCreate && lead.stage === 'won' ? () => handleConvertToJob(lead) : null}
            />
          ))}
        </div>

        {filteredLeads.length === 0 && !loading && (
          <GlassPanel className="text-center py-12">
            <p className="text-text-secondary">No leads found</p>
            {canCreate && (
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Create your first lead
              </Button>
            )}
          </GlassPanel>
        )}

        {/* Create/Edit Lead Modal */}
        {(showForm || editingLead) && (
          <LeadForm
            lead={editingLead}
            onSubmit={editingLead ? handleUpdateLead : handleCreateLead}
            onClose={() => { setShowForm(false); setEditingLead(null); }}
            loading={formLoading}
          />
        )}
      </main>
    </div>
  )
}