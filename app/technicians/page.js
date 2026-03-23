'use client'

import { useState } from 'react'
import { GlassPanel, Button, Badge, Input, Select, LoadingSpinner } from '@/components/ui'
import { Header, Sidebar } from '@/components/ui'
import { useTechnicians, useJobs } from '@/lib/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Phone, Mail, Clock, Briefcase, X } from 'lucide-react'

// Technician card
function TechCard({ tech, jobs, onEdit, onAssignJob }) {
  const statusColors = {
    available: 'text-accent-green',
    assigned: 'text-accent-blue',
    off: 'text-accent-orange',
    vacation: 'text-accent-red'
  }

  const currentJob = jobs?.find(j => j.assignedTechs?.includes(tech.id))

  return (
    <GlassPanel className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${tech.status === 'available' ? 'bg-accent-green/20' : 'bg-accent-orange/20'}`}>
        <Users className={`w-6 h-6 ${statusColors[tech.status]}`} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{tech.name}</h3>
          <Badge variant={tech.status === 'available' ? 'success' : tech.status === 'off' ? 'warning' : 'info'}>
            {tech.status}
          </Badge>
        </div>
        <p className="text-sm text-text-secondary">{tech.role}</p>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
          {tech.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {tech.phone}
            </span>
          )}
          {tech.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {tech.email}
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        {currentJob ? (
          <div>
            <p className="text-sm font-medium">{currentJob.storeNumber}</p>
            <p className="text-xs text-text-secondary">{currentJob.customerName}</p>
          </div>
        ) : (
          <p className="text-text-secondary text-sm">No active job</p>
        )}
      </div>

      {onEdit && (
        <button 
          onClick={() => onEdit(tech)}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          Edit
        </button>
      )}
    </GlassPanel>
  )
}

// Technician form
function TechForm({ tech, onSubmit, onClose, loading }) {
  const [formData, setFormData] = useState({
    name: tech?.name || '',
    email: tech?.email || '',
    phone: tech?.phone || '',
    role: tech?.role || 'tech',
    hourlyRate: tech?.hourlyRate?.toString() || '50',
    status: tech?.status || 'available',
    skills: tech?.skills?.join(', ') || ''
  })

  const roles = [
    { value: 'lead_tech', label: 'Lead Tech' },
    { value: 'tech', label: 'Technician' },
    { value: 'helper', label: 'Helper' }
  ]

  const statuses = [
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'off', label: 'Off' },
    { value: 'vacation', label: 'Vacation' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      hourlyRate: Number(formData.hourlyRate) || 0,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassPanel className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {tech ? 'Edit Technician' : 'Add Technician'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Smith"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@datadogs.com"
            />
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+15551234567"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roles}
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statuses}
            />
          </div>

          <Input
            label="Hourly Rate ($)"
            name="hourlyRate"
            type="number"
            value={formData.hourlyRate}
            onChange={handleChange}
          />

          <Input
            label="Skills (comma separated)"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="network, fiber, security"
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : tech ? 'Update' : 'Add Tech'}
            </Button>
          </div>
        </form>
      </GlassPanel>
    </div>
  )
}

export default function TechniciansPage() {
  const { technicians, loading, createTechnician, updateTechnician } = useTechnicians()
  const { jobs } = useJobs()
  const { isAdmin, isManager, user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingTech, setEditingTech] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const canManageAll = isAdmin || isManager
  const canEditOwn = (tech) => tech.id === user?.uid

  const handleCreate = async (techData) => {
    setFormLoading(true)
    const result = await createTechnician(techData)
    setFormLoading(false)
    if (result.success) {
      setShowForm(false)
    } else {
      alert('Error: ' + result.error)
    }
  }

  const handleUpdate = async (techData) => {
    if (!editingTech) return
    setFormLoading(true)
    const result = await updateTechnician(editingTech.id, techData)
    setFormLoading(false)
    if (result.success) {
      setEditingTech(null)
    } else {
      alert('Error: ' + result.error)
    }
  }

  const handleStatusChange = async (techId, newStatus) => {
    const result = await updateTechnician(techId, { status: newStatus })
    if (!result.success) {
      alert('Error updating status: ' + result.error)
    }
  }

  return (
    <div className="min-h-screen pb-8">
      <Sidebar />
      <main className="pl-24 pr-8 pt-8">
        <Header title="Technicians" subtitle="Team Management" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-accent-blue" />
            Team
            <Badge variant="info">{technicians.length}</Badge>
          </h2>

          {canManageAll && (
            <Button onClick={() => setShowForm(true)}>
              <Users className="w-4 h-4 mr-2" />
              Add Tech
            </Button>
          )}
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <GlassPanel>
            <p className="text-text-secondary text-sm">Available</p>
            <p className="text-2xl font-bold text-accent-green">
              {technicians.filter(t => t.status === 'available').length}
            </p>
          </GlassPanel>
          <GlassPanel>
            <p className="text-text-secondary text-sm">On Job</p>
            <p className="text-2xl font-bold text-accent-blue">
              {technicians.filter(t => t.status === 'assigned').length}
            </p>
          </GlassPanel>
          <GlassPanel>
            <p className="text-text-secondary text-sm">Off</p>
            <p className="text-2xl font-bold text-accent-orange">
              {technicians.filter(t => t.status === 'off').length}
            </p>
          </GlassPanel>
          <GlassPanel>
            <p className="text-text-secondary text-sm">Vacation</p>
            <p className="text-2xl font-bold text-accent-red">
              {technicians.filter(t => t.status === 'vacation').length}
            </p>
          </GlassPanel>
        </div>

        {/* Tech List */}
        <div className="space-y-4">
          {technicians.map(tech => (
            <TechCard
              key={tech.id}
              tech={tech}
              jobs={jobs}
              onEdit={canManageAll ? () => setEditingTech(tech) : null}
            />
          ))}
        </div>

        {technicians.length === 0 && !loading && (
          <GlassPanel className="text-center py-12">
            <p className="text-text-secondary">No technicians added yet</p>
            {canManageAll && (
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Add your first technician
              </Button>
            )}
          </GlassPanel>
        )}

        {/* Modal */}
        {(showForm || editingTech) && (
          <TechForm
            tech={editingTech}
            onSubmit={editingTech ? handleUpdate : handleCreate}
            onClose={() => { setShowForm(false); setEditingTech(null); }}
            loading={formLoading}
          />
        )}
      </main>
    </div>
  )
}