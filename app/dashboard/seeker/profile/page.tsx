'use client'
// FILE: app/dashboard/seeker/profile/page.tsx

import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, MapPin, Globe, Calendar, Shield, Lock,
  Edit2, Camera, Upload, Download, Trash2, CheckCircle,
  AlertCircle, Bell, ChevronRight, Save, LogOut,
  FileText, Eye, EyeOff, Loader2, Plus,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Tab = 'personal' | 'journey' | 'preferences' | 'security'

// ─────────────────────────────────────────────────────────────────────────────
// Profile completion ring SVG
// ─────────────────────────────────────────────────────────────────────────────
function ProgressRing({ pct = 0, size = 68, strokeWidth = 6 }: { pct: number; size?: number; strokeWidth?: number }) {
  const r   = (size - strokeWidth) / 2
  const c   = 2 * Math.PI * r
  const off = c - (pct / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EBF0F8" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#C9A227" strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
        fontFamily="Plus Jakarta Sans" fontWeight="900" fontSize="14" fill="#1B3060">
        {pct}%
      </text>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle switch
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 shrink-0 ${on ? 'bg-[#C9A227]' : 'bg-gray-300'}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function SeekerProfilePage() {
  const router = useRouter()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  const [activeTab, setActiveTab]           = useState<Tab>('personal')
  const [profile, setProfile]               = useState<any>(null)
  const [userEmail, setUserEmail]           = useState('')
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState(false)
  const [success, setSuccess]               = useState(false)
  const [error, setError]                   = useState('')
  const [avatarPreview, setAvatarPreview]   = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Personal form
  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')
  const [city, setCity]         = useState('')
  const [bio, setBio]           = useState('')

  // Security
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew]                 = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [pwLoading, setPwLoading]             = useState(false)
  const [pwSuccess, setPwSuccess]             = useState(false)
  const [pwError, setPwError]                 = useState('')

  // Notifications
  const [notifMessages, setNotifMessages]     = useState(true)
  const [notifBookings, setNotifBookings]     = useState(true)
  const [notifNews, setNotifNews]             = useState(true)
  const [notifPromo, setNotifPromo]           = useState(false)

  // Visa preferences
  const VISA_TYPES = ['Student Visa', 'Work Permit', 'Visit Visa', 'Family Visa', 'PR / Settlement', 'Business Visa']
  const [selectedVisaTypes, setSelectedVisaTypes] = useState<string[]>(['Student Visa'])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
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
        setBio(data.bio || '')
        if (data.avatar_url) {
          setAvatarPreview(
            data.avatar_url.startsWith('http')
              ? data.avatar_url
              : `${supabaseUrl}/storage/v1/object/public/avatars/${data.avatar_url}`
          )
        }
      }
      setLoading(false)
    }
    load()
  }, [router, supabaseUrl])

  // Compute profile completion
  const completion = (() => {
    if (!profile) return 0
    const checks = [
      !!fullName, !!phone, !!city, !!bio,
      !!profile.avatar_url, !!userEmail,
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  })()

  function getInitials(name: string) {
    if (!name) return 'VS'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const showSuccess = (msg = '') => {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (file.size > 3 * 1024 * 1024) { setError('Image too large. Max 3MB.'); return }
    setUploadingAvatar(true)
    setError('')
    const supabase = createClient()
    const ext  = file.name.split('.').pop()
    const path = `${profile.user_id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' })
    if (upErr) { setError(upErr.message); setUploadingAvatar(false); return }
    await supabase.from('profiles').update({ avatar_url: path }).eq('id', profile.id)
    setAvatarPreview(`${supabaseUrl}/storage/v1/object/public/avatars/${path}`)
    setUploadingAvatar(false)
    showSuccess()
  }

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: saveErr } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, city, bio, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
    setSaving(false)
    if (saveErr) setError(saveErr.message)
    else showSuccess()
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return }
    if (newPassword.length < 6) { setPwError('Minimum 6 characters'); return }
    setPwLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPwError(error.message)
    else {
      setPwSuccess(true)
      setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setPwSuccess(false), 3000)
    }
    setPwLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#1B3060]" size={32} />
      </div>
    )
  }

  const displayName = fullName || userEmail?.split('@')[0] || 'Visa Seeker'
  const firstName   = displayName.split(' ')[0]

  const TABS: { key: Tab; label: string }[] = [
    { key: 'personal',     label: 'Personal' },
    { key: 'journey',      label: 'Visa Journey' },
    { key: 'preferences',  label: 'Preferences' },
    { key: 'security',     label: 'Security' },
  ]

  return (
    <div className="max-w-3xl">

      {/* Toast */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">
          <CheckCircle size={15} className="shrink-0" /> Saved successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Profile header card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 mb-5 flex items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-[18px] overflow-hidden bg-[#1B3060] flex items-center justify-center">
            {avatarPreview
              ? <img src={avatarPreview} alt={displayName} className="w-full h-full object-cover" />
              : <span className="font-heading font-black text-white text-2xl">{getInitials(displayName)}</span>
            }
          </div>
          <label className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#1B3060] border-2 border-white flex items-center justify-center cursor-pointer hover:bg-[#243d7a] transition-colors ${uploadingAvatar ? 'pointer-events-none opacity-60' : ''}`}>
            {uploadingAvatar ? <Loader2 size={12} className="text-white animate-spin" /> : <Camera size={12} className="text-white" />}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
          </label>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-heading font-black text-[#1B3060] text-xl tracking-tight leading-none">
              {displayName}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full">
              <CheckCircle size={10} className="fill-green-700" strokeWidth={0} /> Verified
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-2.5">{userEmail}</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            {city && <span className="flex items-center gap-1"><MapPin size={11} className="text-[#C9A227]" />{city}</span>}
            <span className="flex items-center gap-1"><Globe size={11} />Targeting UK 🇬🇧</span>
            <span className="flex items-center gap-1"><Calendar size={11} />
              Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' }) : 'Recently'}
            </span>
          </div>
        </div>

        {/* Profile completion */}
        <div className="shrink-0 text-center">
          <ProgressRing pct={completion} size={72} strokeWidth={7} />
          <p className="text-[11px] text-gray-400 font-semibold mt-1">Profile</p>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`pb-3 px-4 text-sm font-bold border-b-[3px] -mb-px transition-all font-heading ${
              activeTab === t.key
                ? 'border-[#C9A227] text-[#1B3060]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PERSONAL TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-heading font-extrabold text-[#1B3060] text-lg">Personal Information</h3>
              <p className="text-sm text-gray-400 mt-0.5">This info helps consultants understand your context</p>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <form onSubmit={handleSavePersonal} className="space-y-5">

              {/* Name + Email row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    <User size={11} className="inline mr-1.5 text-gray-400" />Full Name
                  </label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Muhammad Ali"
                    className="font-body w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10 outline-none transition-all" />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    <Mail size={11} className="inline mr-1.5 text-gray-400" />Email
                  </label>
                  <input type="email" value={userEmail} disabled
                    className="font-body w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
                </div>
              </div>

              {/* Phone + City row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    <Phone size={11} className="inline mr-1.5 text-gray-400" />Phone Number
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="font-body w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10 outline-none transition-all" />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    <MapPin size={11} className="inline mr-1.5 text-gray-400" />City
                  </label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)}
                    placeholder="Karachi, Lahore, Islamabad…"
                    className="font-body w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10 outline-none transition-all" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  About Me
                </label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                  placeholder="Tell consultants about yourself, your visa goals, and what you're looking for…"
                  className="font-body w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10 outline-none transition-all resize-none"
                />
                <p className={`text-xs mt-1 text-right ${bio.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {bio.length}/500
                </p>
              </div>

              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white bg-[#1B3060] hover:bg-[#243d7a] disabled:opacity-60 px-6 py-2.5 rounded-xl transition-colors">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VISA JOURNEY TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'journey' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-[#1B3060] text-lg">Visa Journey</h3>
              <p className="text-sm text-gray-400 mt-0.5">Track your progress from start to visa stamp</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> On track
            </span>
          </div>

          {/* Active application card */}
          <div className="bg-[#1B3060] rounded-2xl p-6 relative overflow-hidden text-white">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-[0.18]"
              style={{ background: 'radial-gradient(circle,#C9A227 0%,transparent 70%)', transform: 'translate(30%,-30%)' }} />
            <div className="relative flex items-center gap-6">
              <div className="text-5xl drop-shadow-lg">🇬🇧</div>
              <div className="flex-1">
                <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest mb-1">Active Application</p>
                <h3 className="font-heading font-black text-2xl mb-1">UK Student Visa</h3>
                <p className="text-sm text-white/50">Complete your profile to attract the best consultants</p>
              </div>
              <div className="text-center shrink-0">
                <ProgressRing pct={completion} size={80} strokeWidth={7} />
                <p className="text-[11px] text-white/40 mt-1 font-semibold">Complete</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <h4 className="font-heading font-extrabold text-[#1B3060] text-sm mb-6 uppercase tracking-wide">Your Journey</h4>
            <div className="space-y-0">
              {[
                { title: 'Profile Created',       done: true,  active: false, desc: 'Joined VisaGate.pk',                date: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                { title: 'Profile Completed',     done: completion >= 80, active: false, desc: 'Fill in all profile fields',    date: completion >= 80 ? 'Done' : 'In progress' },
                { title: 'Book a Consultant',     done: false, active: true,  desc: 'Browse and book your first consultation', date: 'Next step' },
                { title: 'Visa Application',      done: false, active: false, desc: 'Submit your visa application',             date: 'Upcoming' },
                { title: 'Decision',              done: false, active: false, desc: 'Receive your visa decision',               date: 'Upcoming' },
              ].map((step, i, arr) => (
                <div key={i} className="flex gap-4 relative pb-6 last:pb-0">
                  {i < arr.length - 1 && (
                    <div className={`absolute left-[13px] top-7 bottom-0 w-0.5 ${step.done ? 'bg-green-400' : 'bg-gray-100'}`} />
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    step.done   ? 'bg-green-500 shadow-[0_0_0_3px_rgba(5,150,105,0.12)]' :
                    step.active ? 'bg-[#C9A227] shadow-[0_0_0_4px_rgba(201,162,39,0.15)]' :
                    'bg-gray-100'
                  }`}>
                    {step.done
                      ? <CheckCircle size={13} className="text-white fill-white" strokeWidth={0} />
                      : step.active
                        ? <div className="w-2 h-2 rounded-full bg-white" />
                        : null
                    }
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-heading font-bold text-sm ${step.done ? 'text-gray-800' : step.active ? 'text-[#1B3060]' : 'text-gray-400'}`}>
                        {step.title}
                      </p>
                      {step.active && (
                        <span className="text-[10px] font-bold bg-[#FBF5E0] text-[#C9A227] border border-[#C9A227]/30 px-1.5 py-0.5 rounded-full">
                          Next up
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mb-0.5">{step.date}</p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#EBF0F8] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-heading font-bold text-[#1B3060] text-sm mb-0.5">Ready to find a consultant?</p>
              <p className="text-xs text-gray-500">Browse verified consultants and book your first consultation</p>
            </div>
            <a href="/consultants"
              className="shrink-0 inline-flex items-center gap-1.5 font-heading font-bold text-sm text-white bg-[#1B3060] hover:bg-[#243d7a] px-5 py-2.5 rounded-xl transition-colors">
              Find Consultants <ChevronRight size={14} />
            </a>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PREFERENCES TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-[#1B3060] text-lg">Visa Preferences</h3>
            <p className="text-sm text-gray-400 mt-0.5">Help us match you with the right consultants</p>
          </div>

          {/* Preferred destinations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-heading font-bold text-[#1B3060] text-sm flex items-center gap-2">
                <Globe size={15} className="text-[#C9A227]" /> Preferred Destinations
              </h4>
              <button className="text-xs font-semibold text-[#1B3060] bg-[#EBF0F8] px-3 py-1.5 rounded-lg hover:bg-[#1B3060] hover:text-white transition-colors flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { flag: '🇬🇧', country: 'United Kingdom', primary: true },
                { flag: '🇨🇦', country: 'Canada',         primary: false },
                { flag: '🇦🇺', country: 'Australia',      primary: false },
              ].map(d => (
                <div key={d.country}
                  className={`relative p-4 rounded-xl border ${
                    d.primary ? 'bg-[#FBF5E0] border-[#C9A227]/30' : 'bg-gray-50 border-gray-200'
                  }`}>
                  {d.primary && (
                    <div className="absolute -top-2.5 right-3 text-[9px] font-black text-white bg-[#C9A227] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ★ Primary
                    </div>
                  )}
                  <div className="text-3xl mb-2">{d.flag}</div>
                  <p className="font-heading font-bold text-[#1B3060] text-sm">{d.country}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visa categories */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <h4 className="font-heading font-bold text-[#1B3060] text-sm flex items-center gap-2 mb-4">
              <FileText size={15} className="text-[#C9A227]" /> Visa Categories of Interest
            </h4>
            <div className="flex flex-wrap gap-2">
              {VISA_TYPES.map(type => {
                const on = selectedVisaTypes.includes(type)
                return (
                  <button key={type} onClick={() => setSelectedVisaTypes(prev =>
                    on ? prev.filter(t => t !== type) : [...prev, type]
                  )}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      on ? 'bg-[#1B3060] text-white border-[#1B3060]' : 'bg-white text-gray-500 border-gray-300 hover:border-[#1B3060] hover:text-[#1B3060]'
                    }`}>
                    {on ? '✓ ' : ''}{type}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <h4 className="font-heading font-bold text-[#1B3060] text-sm flex items-center gap-2 mb-4">
              <Bell size={15} className="text-[#C9A227]" /> Notification Preferences
            </h4>
            {[
              { label: 'New messages from consultants', sub: 'Email & in-app', on: notifMessages, set: () => setNotifMessages(!notifMessages) },
              { label: 'Booking reminders',             sub: '24 hours before consultation', on: notifBookings, set: () => setNotifBookings(!notifBookings) },
              { label: 'Visa news & updates',           sub: 'Weekly digest about your destinations', on: notifNews, set: () => setNotifNews(!notifNews) },
              { label: 'Promotional offers',            sub: 'Special discounts from consultants', on: notifPromo, set: () => setNotifPromo(!notifPromo) },
            ].map((n, i, arr) => (
              <div key={n.label} className={`flex items-center gap-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex-1">
                  <p className="font-body text-sm font-semibold text-gray-800">{n.label}</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">{n.sub}</p>
                </div>
                <Toggle on={n.on} onChange={n.set} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SECURITY TAB
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-[#1B3060] text-lg">Security & Privacy</h3>
            <p className="text-sm text-gray-400 mt-0.5">Manage your account safety and data</p>
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#EBF0F8] flex items-center justify-center">
                <Lock size={17} className="text-[#1B3060]" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-[#1B3060] text-sm">Change Password</h4>
                <p className="text-xs text-gray-400">Keep your account secure with a strong password</p>
              </div>
            </div>

            {pwSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
                <CheckCircle size={14} className="shrink-0" /> Password updated!
              </div>
            )}
            {pwError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                <AlertCircle size={14} className="shrink-0" /> {pwError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="font-body text-xs font-semibold text-gray-500 block mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters" required
                    className="font-body w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10 outline-none transition-all" />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-gray-500 block mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password" required
                    className={`font-body w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                      confirmPassword && newPassword !== confirmPassword ? 'border-red-300 focus:border-red-400' :
                      confirmPassword && newPassword === confirmPassword ? 'border-green-300 focus:border-green-400' :
                      'border-gray-200 focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10'
                    }`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              {/* Strength indicators */}
              {newPassword && (
                <div className="flex gap-1.5 pt-1">
                  {[newPassword.length >= 6, newPassword.length >= 10, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword)].map((met, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${met ? 'bg-green-400' : 'bg-gray-200'}`} />
                  ))}
                </div>
              )}
              <button type="submit" disabled={pwLoading}
                className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white px-6 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' }}>
                {pwLoading ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : <><Lock size={14} /> Update Password</>}
              </button>
            </form>
          </div>

          {/* 2FA card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Shield size={17} className="text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-heading font-bold text-[#1B3060] text-sm">Two-Factor Authentication</p>
                <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Enabled</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">SMS verification active</p>
            </div>
            <button className="font-heading font-semibold text-xs text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Manage
            </button>
          </div>

          {/* Sign out */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EBF0F8] flex items-center justify-center shrink-0">
              <LogOut size={17} className="text-[#1B3060]" />
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-[#1B3060] text-sm">Sign Out</p>
              <p className="text-xs text-gray-400 mt-0.5">Sign out of your account on this device</p>
            </div>
            <button onClick={handleLogout}
              className="font-heading font-semibold text-xs text-[#1B3060] bg-[#EBF0F8] border border-[#1B3060]/20 px-4 py-2 rounded-lg hover:bg-[#1B3060] hover:text-white transition-colors">
              Sign Out
            </button>
          </div>

          {/* ── Become a Consultant ── */}
          <div className="bg-[#1B3060] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-10"
              style={{ background: 'radial-gradient(circle,#C9A227 0%,transparent 70%)', transform: 'translate(20%,-20%)' }} />
            <div className="relative flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/30 flex items-center justify-center shrink-0">
                <span className="text-xl">💼</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-white text-sm mb-0.5">
                  Become a Consultant
                </p>
                <p className="font-body text-white/50 text-xs leading-relaxed">
                  List your visa services and start earning on VisaGate.pk
                </p>
              </div>
              <button
                onClick={async () => {
                  const supabase = createClient()
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user || !profile) return
                  await supabase.from('profiles').update({ role: 'consultant' }).eq('id', profile.id)
                  router.push('/dashboard/consultant/verify')
                }}
                className="shrink-0 inline-flex items-center gap-2 font-heading font-bold text-sm text-[#1B3060] px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}
              >
                Switch Account <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
            <h4 className="font-heading font-bold text-red-600 text-sm mb-4">Danger Zone</h4>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="font-body text-sm font-semibold text-gray-800">Download My Data</p>
                <p className="text-xs text-gray-400 mt-0.5">Get a copy of all your data</p>
              </div>
              <button className="font-heading font-semibold text-xs text-gray-600 border border-gray-200 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
                <Download size={12} /> Export
              </button>
            </div>
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-body text-sm font-semibold text-gray-800">Delete Account</p>
                <p className="text-xs text-gray-400 mt-0.5">Permanently remove your account and all data</p>
              </div>
              <button className="font-heading font-semibold text-xs text-red-600 border border-red-200 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}