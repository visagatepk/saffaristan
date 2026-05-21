'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Edit2, Trash2, Globe, DollarSign,
  Clock, AlertCircle, X, ImageIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const VISA_TYPES = [
  'Student Visa', 'Work Permit', 'Visit Visa', 'Family Visa',
  'Business Visa', 'Tourist Visa', 'PR / Permanent Residency',
  'Umrah Visa', 'Schengen Visa',
]

const COUNTRIES = [
  'Canada', 'United Kingdom', 'United States', 'Australia',
  'UAE', 'Saudi Arabia', 'Germany', 'Turkey', 'Malaysia',
  'Italy', 'France', 'Japan', 'South Korea', 'New Zealand',
]

export default function ServicesPage() {
  const [services, setServices]                 = useState<any[]>([])
  const [profileId, setProfileId]               = useState('')
  const [loading, setLoading]                   = useState(true)
  const [showForm, setShowForm]                 = useState(false)
  const [editingId, setEditingId]               = useState<string | null>(null)
  const [saving, setSaving]                     = useState(false)
  const [uploadingImage, setUploadingImage]     = useState(false)
  const [serviceImageUrl, setServiceImageUrl]   = useState('')   // full public URL
  const [serviceImagePreview, setServiceImagePreview] = useState('')
  const [error, setError]                       = useState('')

  const [form, setForm] = useState({
    title: '', visa_type: '', destination_country: '',
    description: '', price_min: '', price_max: '', processing_days: '',
  })

  // ── Reset form ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({
      title: '', visa_type: '', destination_country: '',
      description: '', price_min: '', price_max: '', processing_days: '',
    })
    setEditingId(null)
    setShowForm(false)
    setError('')
    setServiceImageUrl('')
    setServiceImagePreview('')
  }

  // ── Load services ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()

      if (prof) {
        setProfileId(prof.id)
        const { data: svcs } = await supabase
          .from('services').select('*').eq('consultant_id', prof.id)
          .order('created_at', { ascending: false })
        setServices(svcs || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Image upload ───────────────────────────────────────────────────────
  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Max 5MB.')
      return
    }

    setUploadingImage(true)
    setError('')
    const supabase = createClient()
    const ext  = file.name.split('.').pop()
    const path = `${profileId}-${Date.now()}.${ext}`

    // ✅ Bug 2 fixed: upload to 'services' bucket, not 'avatars'
    const { error: upErr } = await supabase.storage
      .from('services')
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (upErr) {
      setError(upErr.message)
      setUploadingImage(false)
      return
    }

    // ✅ Bug 3 fixed: store full public URL, not just path
    const { data: { publicUrl } } = supabase.storage
      .from('services')
      .getPublicUrl(path)

    setServiceImageUrl(publicUrl)   // full URL saved to DB
    setServiceImagePreview(publicUrl)
    setUploadingImage(false)
  }

  // ── Save service ───────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()

    // ✅ Bug 1 fixed: image_url included in payload
    const payload = {
      consultant_id:      profileId,
      title:              form.title,
      visa_type:          form.visa_type,
      destination_country: form.destination_country,
      description:        form.description,
      price_min:          parseInt(form.price_min)      || 0,
      price_max:          parseInt(form.price_max)      || 0,
      processing_days:    parseInt(form.processing_days) || 0,
      is_active:          true,
      image_url:          serviceImageUrl || null,  // ✅ now included
    }

    if (editingId) {
      const { error } = await supabase
        .from('services').update(payload).eq('id', editingId)
      if (error) { setError(error.message); setSaving(false); return }
      setServices(prev => prev.map(s => s.id === editingId ? { ...s, ...payload } : s))
    } else {
      const { data, error } = await supabase
        .from('services').insert(payload).select().single()
      if (error) { setError(error.message); setSaving(false); return }
      if (data) setServices(prev => [data, ...prev])
    }

    setSaving(false)
    resetForm()
  }

  // ── Edit ───────────────────────────────────────────────────────────────
  const handleEdit = (s: any) => {
    setForm({
      title:              s.title,
      visa_type:          s.visa_type          || '',
      destination_country: s.destination_country || '',
      description:        s.description        || '',
      price_min:          s.price_min?.toString()       || '',
      price_max:          s.price_max?.toString()       || '',
      processing_days:    s.processing_days?.toString() || '',
    })
    // Restore existing image preview if service already has one
    if (s.image_url) {
      setServiceImageUrl(s.image_url)
      setServiceImagePreview(s.image_url)
    } else {
      setServiceImageUrl('')
      setServiceImagePreview('')
    }
    setEditingId(s.id)
    setShowForm(true)
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    const supabase = createClient()
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-navy text-xl mb-1">My Services</h1>
          <p className="font-body text-gray-500 text-sm">{services.length} services listed</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="font-heading font-bold text-sm bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
            <Plus size={16} /> Add Service
          </button>
        )}
      </div>

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-navy text-base">
              {editingId ? 'Edit Service' : 'Add New Service'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-body px-4 py-3 rounded-xl mb-4">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">

            {/* Title */}
            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Service Title</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="UK Student Visa Consultation" required
                className="font-body w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all" />
            </div>

            {/* Visa Type + Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Visa Type</label>
                <select value={form.visa_type}
                  onChange={(e) => setForm({ ...form, visa_type: e.target.value })} required
                  className="font-body w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all bg-white">
                  <option value="">Select</option>
                  {VISA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Destination Country</label>
                <select value={form.destination_country}
                  onChange={(e) => setForm({ ...form, destination_country: e.target.value })} required
                  className="font-body w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all bg-white">
                  <option value="">Select</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Description</label>
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what this service includes..." rows={3}
                className="font-body w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all resize-none" />
            </div>

            {/* Service Image */}
            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                Service Image
                <span className="text-gray-400 font-normal ml-1">(Thumbnail image size: Minimum: 712 x 430 px)</span>
              </label>
              <label className="cursor-pointer block">
                {serviceImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden h-36 bg-gray-100">
                    <img src={serviceImagePreview} alt="service" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-body font-semibold">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-36 border-2 border-dashed border-gray-200 rounded-xl hover:border-navy/40 bg-gray-50 transition-colors">
                    <div className="text-center">
                      {uploadingImage ? (
                        <div className="w-6 h-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin mx-auto mb-2" />
                      ) : (
                        <ImageIcon size={24} className="text-gray-300 mx-auto mb-2" />
                      )}
                      <p className="font-body text-xs text-gray-400">
                        {uploadingImage ? 'Uploading...' : 'Click to upload service image'}
                      </p>
                      <p className="font-body text-xs text-gray-300 mt-0.5">JPG, PNG · Max 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleServiceImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Min Price (PKR)</label>
                <input type="number" value={form.price_min}
                  onChange={(e) => setForm({ ...form, price_min: e.target.value })}
                  placeholder="5000" min="0"
                  className="font-body w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all" />
              </div>
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Max Price (PKR)</label>
                <input type="number" value={form.price_max}
                  onChange={(e) => setForm({ ...form, price_max: e.target.value })}
                  placeholder="25000" min="0"
                  className="font-body w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all" />
              </div>
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Processing Days</label>
                <input type="number" value={form.processing_days}
                  onChange={(e) => setForm({ ...form, processing_days: e.target.value })}
                  placeholder="30" min="1"
                  className="font-body w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy transition-all" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={resetForm}
                className="font-heading font-bold flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving || uploadingImage}
                className="font-heading font-bold flex-1 bg-navy hover:bg-navy-dark text-white py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Services list ── */}
      {services.length > 0 ? (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all">
              <div className="flex items-start justify-between gap-4">
                {/* Thumbnail */}
                {s.image_url && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-navy text-sm">{s.title}</h3>
                    {s.is_active && <span className="w-2 h-2 bg-green-400 rounded-full shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {s.visa_type && (
                      <span className="font-body text-xs bg-navy-light text-navy px-2 py-0.5 rounded-full">
                        {s.visa_type}
                      </span>
                    )}
                    {s.destination_country && (
                      <span className="font-body text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {s.destination_country}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="font-body text-gray-500 text-xs line-clamp-1 mb-2">{s.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {(s.price_min > 0 || s.price_max > 0) && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={11} />
                        PKR {s.price_min?.toLocaleString()}
                        {s.price_max > 0 ? ` — ${s.price_max.toLocaleString()}` : ''}
                      </span>
                    )}
                    {s.processing_days > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />{s.processing_days} days
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(s)}
                    className="p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Globe size={32} className="text-gray-200 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-navy text-base mb-1">No services yet</h3>
          <p className="font-body text-gray-400 text-xs mb-4">Add your visa services to attract seekers</p>
          <button onClick={() => setShowForm(true)}
            className="font-heading font-bold text-sm bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2">
            <Plus size={16} /> Add First Service
          </button>
        </div>
      )}
    </div>
  )
}