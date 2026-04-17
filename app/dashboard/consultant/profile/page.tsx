'use client'

import { useState, useEffect } from 'react'
import {
  User, Building2, MapPin, Phone, Globe,
  Save, CheckCircle, AlertCircle, Briefcase, Upload
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CITIES = [
  'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi',
  'Peshawar', 'Quetta', 'Multan', 'Faisalabad',
  'Hyderabad', 'Sargodha',
]

export default function ProfileEditor() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    display_name: '',
    business_name: '',
    city: '',
    office_address: '',
    phone: '',
    whatsapp_number: '',
    years_experience: '',
    bio: '',
  })

  const getInitials = (name: string) => {
    if (!name) return 'VC'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setForm({
          display_name: data.display_name || '',
          business_name: data.business_name || '',
          city: data.city || '',
          office_address: data.office_address || '',
          phone: data.phone || '',
          whatsapp_number: data.whatsapp_number || '',
          years_experience: data.years_experience?.toString() || '',
          bio: data.bio || '',
        })

        // ✅ avatar preview inside if(data) block
        if (data.avatar_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.avatar_url)
          setAvatarPreview(publicUrl)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    if (file.size > 3 * 1024 * 1024) {
      setError('Image too large. Max 3MB.')
      return
    }

    setUploadingAvatar(true)
    setError('')

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${profile.user_id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (uploadError) {
      setError(uploadError.message)
      setUploadingAvatar(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    await supabase.from('profiles')
      .update({ avatar_url: path })
      .eq('id', profile.id)

    setAvatarPreview(publicUrl)
    setUploadingAvatar(false)
    setSuccess(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name,
        business_name: form.business_name,
        city: form.city,
        office_address: form.office_address,
        phone: form.phone,
        whatsapp_number: form.whatsapp_number,
        years_experience: parseInt(form.years_experience) || 0,
        bio: form.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const inputClass = "font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-navy text-xl mb-1">Edit Profile</h1>
        <p className="font-body text-gray-500 text-sm">Update your public profile information</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-body px-4 py-3 rounded-xl mb-5">
          <CheckCircle size={16} className="shrink-0" /> Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl mb-5">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Profile Image Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="font-heading font-bold text-navy text-sm mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-navy rounded-2xl flex items-center justify-center text-white font-heading font-bold text-2xl shrink-0 overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              getInitials(form.display_name)
            )}
          </div>
          <div>
            <label className="cursor-pointer">
              <div className="font-heading font-semibold text-sm text-navy border border-navy px-4 py-2 rounded-xl hover:bg-navy hover:text-white transition-colors inline-flex items-center gap-2">
                <Upload size={14} />
                {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
              </div>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
            <p className="font-body text-xs text-gray-400 mt-2">JPG or PNG · Max 3MB</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-heading font-bold text-navy text-sm mb-2">Personal Information</h2>

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Display Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={form.display_name}
                onChange={(e) => update('display_name', e.target.value)}
                placeholder="Ahmed Hassan" required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Agency / Business Name</label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={form.business_name}
                onChange={(e) => update('business_name', e.target.value)}
                placeholder="Al-Noor Immigration" required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">City</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={form.city} onChange={(e) => update('city', e.target.value)} required
                className="font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all appearance-none bg-white">
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Office Address</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={form.office_address}
                onChange={(e) => update('office_address', e.target.value)}
                placeholder="Office 5, Blue Area" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Years of Experience</label>
            <div className="relative">
              <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" value={form.years_experience}
                onChange={(e) => update('years_experience', e.target.value)}
                placeholder="10" min="0" max="50" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-heading font-bold text-navy text-sm mb-2">Contact Details</h2>

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+92 300 1234567" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">WhatsApp Number</label>
            <div className="relative">
              <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" value={form.whatsapp_number}
                onChange={(e) => update('whatsapp_number', e.target.value)}
                placeholder="923001234567" className={inputClass} />
            </div>
            <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
              Without + or spaces (e.g. 923001234567)
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-heading font-bold text-navy text-sm mb-3">Bio / Description</h2>
          <textarea
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            placeholder="Tell visa seekers about your expertise, specializations, and what makes your agency different..."
            rows={5}
            maxLength={500}
            className="font-body w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all resize-none"
          />
          <p className="font-body text-xs text-gray-400 mt-1.5 text-right">
            {form.bio.length}/500 characters
          </p>
        </div>

        <button type="submit" disabled={saving}
          className="font-heading font-bold w-full bg-navy hover:bg-navy-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
          {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
        </button>
      </form>
    </div>
  )
}