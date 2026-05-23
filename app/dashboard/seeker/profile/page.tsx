'use client'

import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Save,
  CheckCircle, AlertCircle, Upload, MapPin,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function getInitials(name: string) {
  if (!name) return 'VS'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function SeekerProfile() {
  const [profile, setProfile]               = useState<any>(null)
  const [userEmail, setUserEmail]           = useState('')   // from auth.users — not profiles
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState(false)
  const [success, setSuccess]               = useState(false)
  const [error, setError]                   = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview]   = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')
  const [city, setCity]         = useState('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // [FIX] Email lives in auth.users, not profiles — store separately
      setUserEmail(user.email || '')

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
        setCity(data.city || '')

        if (data.avatar_url) {
          setAvatarPreview(
            `${supabaseUrl}/storage/v1/object/public/avatars/${data.avatar_url}`
          )
        }
      }
      setLoading(false)
    }
    load()
  }, [supabaseUrl])

  const showSuccess = () => {
    setSuccess(true)
    // [FIX] Auto-clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000)
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
    const ext  = file.name.split('.').pop()
    const path = `${profile.user_id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (uploadError) {
      setError(uploadError.message)
      setUploadingAvatar(false)
      return
    }

    await supabase.from('profiles')
      .update({ avatar_url: path })
      .eq('id', profile.id)

    setAvatarPreview(`${supabaseUrl}/storage/v1/object/public/avatars/${path}`)
    setUploadingAvatar(false)
    showSuccess()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()
    const { error: saveError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, city })
      .eq('id', profile.id)

    setSaving(false)
    if (saveError) setError(saveError.message)
    else showSuccess()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const inputClass = "font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10 transition-all bg-white"

  return (
    <div className="max-w-lg">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-1">My Profile</h1>
        <p className="font-body text-gray-400 text-sm">Update your personal information</p>
      </div>

      {/* Toast messages */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-body px-4 py-3 rounded-xl mb-5">
          <CheckCircle size={15} className="shrink-0" /> Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl mb-5">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Profile Photo ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 mb-4">
        <h2 className="font-heading font-bold text-[#1B3060] text-sm mb-4 uppercase tracking-wide">
          Profile Photo
        </h2>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#1B3060] flex items-center justify-center shrink-0 border-2 border-gray-100">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading font-bold text-white text-2xl">
                {getInitials(fullName)}
              </span>
            )}
          </div>

          <div>
            <label className={`cursor-pointer ${uploadingAvatar ? 'pointer-events-none' : ''}`}>
              <span className={`font-heading font-semibold text-sm border px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-colors ${
                uploadingAvatar
                  ? 'border-gray-200 text-gray-400 bg-gray-50'
                  : 'border-[#1B3060] text-[#1B3060] hover:bg-[#1B3060] hover:text-white'
              }`}>
                <Upload size={14} />
                {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
            <p className="font-body text-xs text-gray-400 mt-2">
              JPG, PNG or WEBP · Max 3MB
            </p>
          </div>
        </div>
      </div>

      {/* ── Profile Form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
        <h2 className="font-heading font-bold text-[#1B3060] text-sm mb-5 uppercase tracking-wide">
          Personal Information
        </h2>

        <form onSubmit={handleSave} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="font-body text-xs font-medium text-gray-600 block mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Muhammad Ali"
                required
                autoComplete="name"
                className={inputClass}
              />
            </div>
          </div>

          {/* Email — read-only, from auth.users */}
          <div>
            <label className="font-body text-xs font-medium text-gray-600 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={userEmail}
                disabled
                className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`}
              />
            </div>
            <p className="font-body text-xs text-gray-400 mt-1 ml-1">
              Email cannot be changed here
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="font-body text-xs font-medium text-gray-600 block mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                autoComplete="tel"
                className={inputClass}
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="font-body text-xs font-medium text-gray-600 block mb-1.5">
              City
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Karachi, Lahore, Islamabad..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full font-heading font-bold text-sm text-white bg-[#1B3060] hover:bg-[#243d7a] disabled:opacity-60 disabled:cursor-not-allowed py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}