'use client'

import { useState, useEffect } from 'react'
import { GlassPanel, Input, Select, TextArea, Button } from '@/components/ui'
import { X } from 'lucide-react'

const jobTypes = [
  { value: 'network_install', label: 'Network Install' },
  { value: 'fiber', label: 'Fiber' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'install', label: 'Install' }
]

const jobStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'complete', label: 'Complete' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'cancelled', label: 'Cancelled' }
]

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]

export function JobForm({ job, onSubmit, onClose, loading }) {
  const [formData, setFormData] = useState({
    storeNumber: '',
    customerName: '',
    jobType: 'network_install',
    status: 'pending',
    priority: 'medium',
    quotedRevenue: '',
    estimatedCost: '',
    notes: '',
    // Location
    address: '',
    city: '',
    state: '',
    zip: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (job) {
      setFormData({
        storeNumber: job.storeNumber || '',
        customerName: job.customerName || '',
        jobType: job.jobType || 'network_install',
        status: job.status || 'pending',
        priority: job.priority || 'medium',
        quotedRevenue: job.quotedRevenue?.toString() || '',
        estimatedCost: job.estimatedCost?.toString() || '',
        notes: job.notes || '',
        address: job.location?.address || '',
        city: job.location?.city || '',
        state: job.location?.state || '',
        zip: job.location?.zip || ''
      })
    }
  }, [job])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    console.log('[validate] Checking storeNumber:', formData.storeNumber, 'trim:', formData.storeNumber.trim(), 'bool:', !!formData.storeNumber.trim())
    if (!formData.storeNumber.trim()) newErrors.storeNumber = 'Store number is required'
    
    console.log('[validate] Checking customerName:', formData.customerName, 'trim:', formData.customerName.trim(), 'bool:', !!formData.customerName.trim())
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required'
    
    if (formData.quotedRevenue && isNaN(Number(formData.quotedRevenue))) {
      newErrors.quotedRevenue = 'Must be a number'
    }
    if (formData.estimatedCost && isNaN(Number(formData.estimatedCost))) {
      newErrors.estimatedCost = 'Must be a number'
    }
    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    console.log('[validate] Final result:', isValid, 'errors:', newErrors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('[JobForm] handleSubmit called')
    console.log('[JobForm] Form data:', formData)
    
    const isValid = validate()
    console.log('[JobForm] Validation result:', isValid)
    if (!isValid) {
      console.log('[JobForm] Validation failed, errors:', errors)
      return
    }

    const jobData = {
      storeNumber: formData.storeNumber.trim(),
      customerName: formData.customerName.trim(),
      jobType: formData.jobType,
      status: formData.status,
      priority: formData.priority,
      quotedRevenue: Number(formData.quotedRevenue) || 0,
      estimatedCost: Number(formData.estimatedCost) || 0,
      notes: formData.notes.trim(),
      location: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim()
      }
    }

    console.log('[JobForm] Calling onSubmit with:', jobData)
    onSubmit(jobData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassPanel className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {job ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Store Number"
              name="storeNumber"
              value={formData.storeNumber}
              onChange={handleChange}
              placeholder="Pilot #54"
              required
              error={errors.storeNumber}
            />
            <Input
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Pilot Flying J"
              required
              error={errors.customerName}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Job Type"
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              options={jobTypes}
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={jobStatuses}
            />
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={priorities}
            />
          </div>

          {/* Financial */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quoted Revenue ($)"
              name="quotedRevenue"
              type="number"
              value={formData.quotedRevenue}
              onChange={handleChange}
              placeholder="0"
              error={errors.quotedRevenue}
            />
            <Input
              label="Estimated Cost ($)"
              name="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={handleChange}
              placeholder="0"
              error={errors.estimatedCost}
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-secondary">Location</h3>
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St"
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Knoxville"
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="TN"
              />
              <Input
                label="ZIP"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="37902"
              />
            </div>
          </div>

          {/* Notes */}
          <TextArea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Job details, special instructions..."
            rows={3}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
            </Button>
          </div>
        </form>
      </GlassPanel>
    </div>
  )
}