'use client'
// FILE: app/dashboard/seeker/settings/page.tsx

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  User, Lock, Shield, Trash2, Camera, CheckCircle,
  AlertTriangle, Eye, EyeOff, Loader2, LogOut,
  MapPin, Phone, Mail, Calendar, BadgeCheck, ChevronRight,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Profile {
  id: string
  user_id: string
  full_name: string | null
  phone: string | null
  city: string | null
  avatar_url: string | null
  role: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>
      {type === 'success'
        ? <CheckCircle size={17} className="shrink-0" />
        : <AlertTriangle size={17} className="shrink-0" />}
      {message}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────
function Section({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#1B3060]/10 flex items-center justify-center text-[#1B3060]">
          {icon}
        </div>
        <div>
          <h2 className="font-heading font-bold text-[#1B3060] text-base leading-tight">{title}</h2>
          <p className="font-body text-gray-400 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Field
// ─────────────────────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, type = 'text', icon, placeholder, disabled = false,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; icon?: React.ReactNode; placeholder?: string; disabled?: boolean
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label className="font-body block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        )}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`font-body w-full border border-gray-200 rounded-xl py-2.5 pr-4 text-gray-800 text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1B3060]/15 focus:border-[#1B3060]
            placeholder:text-gray-300 transition-all
            ${icon ? 'pl-10' : 'pl-4'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white hover:border-gray-300'}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function SeekerSettingsPage() {
  const router      = useRouter()
  const supabase    = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  const [profile, setProfile]       = useState<Profile | null>(null)
  const [userEmail, setUserEmail]   = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState<'profile' | 'password' | 'account' | 'danger'>('profile')

  // Profile form
  const [fullName, setFullName]             = useState('')
  const [phone, setPhone]                   = useState('')
  const [city, setCity]                     = useState('')
  const [avatarPreview, setAvatarPreview]   = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileSaving, setProfileSaving]   = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving]   = useState(false)

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteBox, setShowDeleteBox] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserEmail(user.email ?? '')
      setMemberSince(
        user.created_at
          ? new Date(user.created_at).toLocaleDateString('en-PK', {
              year: 'numeric', month: 'long', day: 'numeric',
            })
          : ''
      )

      // [FIX] Use user_id not id — profiles.user_id = auth.users.id
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, phone, city, avatar_url, role')
        .eq('user_id', user.id)
        .single()

      if (error || !data) { router.push('/login'); return }

      // Guard: only seekers
      if (data.role !== 'seeker') {
        router.push('/dashboard/consultant/settings')
        return
      }

      setProfile(data)
      setFullName(data.full_name ?? '')
      setPhone(data.phone ?? '')
      setCity(data.city ?? '')

      // [FIX] avatar_url is stored as a relative path — construct full URL here for preview only
      if (data.avatar_url) {
        setAvatarPreview(
          data.avatar_url.startsWith('http')
            ? data.avatar_url
            : `${supabaseUrl}/storage/v1/object/public/avatars/${data.avatar_url}`
        )
      }

      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Avatar upload ───────────────────────────────────────────────────────
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    if (file.size > 3 * 1024 * 1024) { showToast('Image must be under 3 MB', 'error'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG or WebP allowed', 'error'); return
    }

    setAvatarUploading(true)
    const ext  = file.name.split('.').pop()
    // [FIX] Store relative path (not full URL) — consistent with how all other
    // components read avatar_url and prepend the storage URL themselves
    const path = `${profile.user_id}/avatar.${ext}`

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (upErr) { showToast('Upload failed. Try again.', 'error'); setAvatarUploading(false); return }

    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ avatar_url: path })
      .eq('id', profile.id)

    if (dbErr) { showToast('Could not save avatar.', 'error'); setAvatarUploading(false); return }

    setAvatarPreview(`${supabaseUrl}/storage/v1/object/public/avatars/${path}`)
    showToast('Profile photo updated!', 'success')
    setAvatarUploading(false)
  }

  // ── Save profile ────────────────────────────────────────────────────────
  async function handleSaveProfile() {
    if (!profile) return
    if (!fullName.trim()) { showToast('Full name is required.', 'error'); return }

    setProfileSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() || null, city: city.trim() || null })
      .eq('id', profile.id)

    if (error) showToast('Failed to save changes.', 'error')
    else showToast('Profile updated successfully!', 'success')
    setProfileSaving(false)
  }

  // ── Change password ─────────────────────────────────────────────────────
  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields.', 'error'); return
    }
    if (newPassword.length < 8) { showToast('New password must be at least 8 characters.', 'error'); return }
    if (newPassword !== confirmPassword) { showToast('Passwords do not match.', 'error'); return }

    setPasswordSaving(true)

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: userEmail, password: currentPassword,
    })
    if (signInErr) { showToast('Current password is incorrect.', 'error'); setPasswordSaving(false); return }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) showToast('Failed to update password.', 'error')
    else {
      showToast('Password changed successfully!', 'success')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }
    setPasswordSaving(false)
  }

  // ── Sign out ────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  // ── Delete account ──────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') { showToast('Type DELETE exactly to confirm.', 'error'); return }
    if (!profile) return

    setDeleteLoading(true)
    await supabase.from('profiles').delete().eq('id', profile.id)
    await supabase.auth.signOut()
    router.push('/?account=deleted')
  }

  // ── Tabs ────────────────────────────────────────────────────────────────
  const TABS = [
    { key: 'profile'  as const, label: 'Profile',     icon: <User size={16} />    },
    { key: 'password' as const, label: 'Password',    icon: <Lock size={16} />    },
    { key: 'account'  as const, label: 'Account',     icon: <Shield size={16} />  },
    { key: 'danger'   as const, label: 'Danger Zone', icon: <Trash2 size={16} />  },
  ]

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#1B3060]" size={32} />
          <p className="font-body text-gray-400 text-sm">Loading settings…</p>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Profile header card — inside dashboard layout (no Navbar/Footer) */}
      <div className="bg-[#1B3060] rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}
        />
        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-xl bg-[#C9A227]/20 border-2 border-[#C9A227]/40 overflow-hidden flex items-center justify-center">
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                : <User size={26} className="text-[#C9A227]" />
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#C9A227] flex items-center justify-center shadow-lg hover:bg-[#b8911f] transition-colors disabled:opacity-60"
            >
              {avatarUploading
                ? <Loader2 size={12} className="text-white animate-spin" />
                : <Camera size={12} className="text-white" />
              }
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div>
            <h1 className="font-heading font-bold text-white text-lg">{fullName || 'Your Name'}</h1>
            <p className="font-body text-blue-200 text-sm">{userEmail}</p>
            <span className="inline-flex items-center gap-1.5 mt-1.5 bg-[#C9A227]/20 border border-[#C9A227]/30 text-[#C9A227] text-xs font-semibold px-2.5 py-1 rounded-full">
              <BadgeCheck size={11} /> Seeker Account
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-5 items-start">

        {/* Sidebar tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <nav className="p-2 space-y-0.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? tab.key === 'danger'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-[#1B3060] text-white shadow-sm'
                    : tab.key === 'danger'
                      ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#1B3060]'
                }`}
              >
                {tab.icon}
                <span className="flex-1 text-left">{tab.label}</span>
                {activeTab === tab.key && tab.key !== 'danger' && (
                  <ChevronRight size={13} className="text-white/50" />
                )}
              </button>
            ))}
          </nav>
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div>

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <Section icon={<User size={19} />} title="Profile Information" subtitle="Update your personal details">
              <div className="space-y-4">
                <Field label="Full Name *" value={fullName} onChange={setFullName} icon={<User size={15} />} placeholder="Muhammad Ali" />
                <Field label="Phone Number" value={phone} onChange={setPhone} type="tel" icon={<Phone size={15} />} placeholder="+92 300 1234567" />
                <Field label="City" value={city} onChange={setCity} icon={<MapPin size={15} />} placeholder="Karachi, Lahore, Islamabad…" />
                <Field label="Email Address" value={userEmail} onChange={() => {}} type="email" icon={<Mail size={15} />} disabled />
                <p className="font-body text-xs text-gray-400 -mt-2 ml-1">Email cannot be changed here</p>
                <div className="pt-1">
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-heading font-bold px-6 py-2.5 rounded-xl hover:bg-[#243d7a] transition-colors disabled:opacity-60 text-sm"
                  >
                    {profileSaving
                      ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                      : <><CheckCircle size={14} /> Save Changes</>
                    }
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
            <Section icon={<Lock size={19} />} title="Change Password" subtitle="Keep your account secure">
              <div className="space-y-4">
                <Field label="Current Password" value={currentPassword} onChange={setCurrentPassword} type="password" placeholder="Enter current password" />
                <div className="border-t border-gray-100 pt-4">
                  <Field label="New Password" value={newPassword} onChange={setNewPassword} type="password" placeholder="At least 8 characters" />
                </div>
                <Field label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Repeat new password" />

                {newPassword.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 space-y-1.5">
                    {[
                      { label: 'At least 8 characters', ok: newPassword.length >= 8 },
                      { label: 'Contains a number', ok: /\d/.test(newPassword) },
                      { label: 'Contains a letter', ok: /[a-zA-Z]/.test(newPassword) },
                    ].map((hint, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-body">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hint.ok ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {hint.ok && <CheckCircle size={9} className="text-white" />}
                        </div>
                        <span className={hint.ok ? 'text-green-700' : 'text-gray-400'}>{hint.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                    className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-heading font-bold px-6 py-2.5 rounded-xl hover:bg-[#243d7a] transition-colors disabled:opacity-60 text-sm"
                  >
                    {passwordSaving
                      ? <><Loader2 size={14} className="animate-spin" /> Updating…</>
                      : <><Lock size={14} /> Update Password</>
                    }
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <Section icon={<Shield size={19} />} title="Account Information" subtitle="Your account details and role">
              <div className="space-y-1">
                {[
                  { icon: <Mail size={16} className="text-[#1B3060]" />,      label: 'Email',        value: userEmail,                    badge: false },
                  { icon: <BadgeCheck size={16} className="text-[#C9A227]" />, label: 'Account Type', value: 'Seeker',                      badge: false },
                  { icon: <Calendar size={16} className="text-[#1B3060]" />,  label: 'Member Since', value: memberSince || '—',            badge: false },
                  { icon: <Shield size={16} className="text-green-600" />,     label: 'Status',       value: 'Active',                      badge: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">{item.icon}</div>
                      <span className="font-body text-sm text-gray-500">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {item.value}
                      </span>
                    ) : (
                      <span className="font-heading font-semibold text-sm text-[#1B3060]">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 bg-[#1B3060]/5 rounded-xl p-4">
                <p className="font-body text-xs text-gray-500 leading-relaxed">
                  <span className="font-semibold text-[#1B3060]">Want to become a consultant?</span>{' '}
                  Create a separate consultant account at{' '}
                  <a href="/register/consultant" className="text-[#C9A227] hover:underline font-medium">
                    visagate.pk/register/consultant
                  </a>.
                </p>
              </div>
            </Section>
          )}

          {/* DANGER ZONE TAB */}
          {activeTab === 'danger' && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-7 py-5 border-b border-red-50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                  <Trash2 size={19} />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-red-600 text-base">Danger Zone</h2>
                  <p className="font-body text-gray-400 text-xs mt-0.5">Irreversible account actions</p>
                </div>
              </div>
              <div className="px-7 py-6">
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 flex gap-3">
                  <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-red-600 leading-relaxed">
                    Deleting your account permanently removes your profile, saved consultants, appointment history and all messages. <strong>This cannot be undone.</strong>
                  </p>
                </div>

                {!showDeleteBox ? (
                  <button
                    onClick={() => setShowDeleteBox(true)}
                    className="inline-flex items-center gap-2 border-2 border-red-200 text-red-500 font-heading font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
                  >
                    <Trash2 size={15} /> Delete My Account
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="font-body block text-sm font-semibold text-gray-700 mb-1.5">
                        Type <span className="text-red-600 font-bold">DELETE</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        placeholder="Type DELETE here"
                        className="font-body w-full border-2 border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 bg-red-50/30 placeholder:text-gray-300"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                        className="inline-flex items-center gap-2 bg-red-500 text-white font-heading font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-40"
                      >
                        {deleteLoading
                          ? <><Loader2 size={14} className="animate-spin" /> Deleting…</>
                          : <><Trash2 size={14} /> Yes, Delete My Account</>
                        }
                      </button>
                      <button
                        onClick={() => { setShowDeleteBox(false); setDeleteConfirm('') }}
                        className="font-body text-sm text-gray-400 hover:text-gray-600 font-medium px-3 py-2.5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}