'use client'

import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Save,
  CheckCircle, AlertCircle, Upload
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SeekerProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const getInitials = (name: string) => {
    if (!name) return 'VS'
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
        setFullName(data.full_name || '')
        setPhone(data.phone || '')

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
      .update({ full_name: fullName, phone })
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
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-navy text-xl mb-1">My Profile</h1>
        <p className="font-body text-gray-500 text-sm">Update your personal information</p>
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

      {/* Profile Photo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="font-heading font-bold text-navy text-sm mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">

          {/* Avatar preview */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-navy flex items-center justify-center shrink-0 border-2 border-gray-100">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading font-bold text-white text-2xl">
                {getInitials(fullName)}
              </span>
            )}
          </div>

          <div>
            <label className="cursor-pointer">
              <div className={`font-heading font-semibold text-sm border px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-colors ${
                uploadingAvatar
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-navy text-navy hover:bg-navy hover:text-white'
              }`}>
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
            <p className="font-body text-xs text-gray-400 mt-2">
              JPG or PNG · Max 3MB
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSave} className="space-y-4">

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammad Ali"
                required
                autoComplete="name"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`}
              />
            </div>
            <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                autoComplete="tel"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="font-heading font-bold w-full bg-navy hover:bg-navy-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  )
}