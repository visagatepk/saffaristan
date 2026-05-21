'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  User, Lock, Shield, Trash2, Camera, CheckCircle,
  AlertTriangle, Eye, EyeOff, Loader2, LogOut,
  MapPin, Phone, Mail, Calendar, BadgeCheck, ChevronRight
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  city: string | null
  avatar_url: string | null
  role: string | null
  email?: string | null
  created_at?: string | null
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium transition-all duration-300 ${type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
      {type === 'success'
        ? <CheckCircle size={17} className="flex-shrink-0" />
        : <AlertTriangle size={17} className="flex-shrink-0" />}
      {message}
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-7 py-6 border-b border-gray-100 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#1B3060]/10 flex items-center justify-center text-[#1B3060]">
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-[#1B3060] text-lg leading-tight">{title}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="px-7 py-7">{children}</div>
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, type = 'text', icon, placeholder, disabled = false
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; icon?: React.ReactNode; placeholder?: string; disabled?: boolean
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border border-gray-200 rounded-xl py-3 pr-4 text-gray-800 text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1B3060]/20 focus:border-[#1B3060]
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
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function SeekerSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── State ────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account' | 'danger'>('profile')

  // Profile form
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

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

  // ── Load profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserEmail(user.email ?? '')
      setMemberSince(
        user.created_at
          ? new Date(user.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
          : ''
      )

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, city, avatar_url, role, created_at')
        .eq('id', user.id)
        .single()

      if (error || !data) { router.push('/login'); return }

      // Guard: only seekers can access this page
      if (data.role !== 'seeker') {
        router.push('/dashboard/consultant/settings')
        return
      }

      setProfile(data)
      setFullName(data.full_name ?? '')
      setPhone(data.phone ?? '')
      setCity(data.city ?? '')
      setAvatarUrl(data.avatar_url ?? null)
      setLoading(false)
    }
    load()
  }, [])

  // ── Avatar upload ─────────────────────────────────────────────────────────
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    if (file.size > 3 * 1024 * 1024) {
      showToast('Image must be under 3 MB', 'error'); return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG or WebP allowed', 'error'); return
    }

    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${profile.id}-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (upErr) { showToast('Upload failed. Try again.', 'error'); setAvatarUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id)

    if (dbErr) { showToast('Could not save avatar.', 'error'); setAvatarUploading(false); return }

    setAvatarUrl(publicUrl)
    showToast('Profile photo updated!', 'success')
    setAvatarUploading(false)
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  async function handleSaveProfile() {
    if (!profile) return
    if (!fullName.trim()) { showToast('Full name is required.', 'error'); return }

    setProfileSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
      })
      .eq('id', profile.id)

    if (error) {
      showToast('Failed to save changes. Try again.', 'error')
    } else {
      showToast('Profile updated successfully!', 'success')
    }
    setProfileSaving(false)
  }

  // ── Change password ───────────────────────────────────────────────────────
  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields.', 'error'); return
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error'); return
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error'); return
    }

    setPasswordSaving(true)

    // Re-authenticate with current password
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    })
    if (signInErr) {
      showToast('Current password is incorrect.', 'error')
      setPasswordSaving(false); return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      showToast('Failed to update password. Try again.', 'error')
    } else {
      showToast('Password changed successfully!', 'success')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }
    setPasswordSaving(false)
  }

  // ── Sign out ───────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  // ── Delete account ────────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      showToast('Type DELETE exactly to confirm.', 'error'); return
    }
    if (!profile) return

    setDeleteLoading(true)

    // Delete profile row first (cascade RLS handles related rows)
    await supabase.from('profiles').delete().eq('id', profile.id)

    // Sign out — actual auth user deletion requires server-side (admin) call
    await supabase.auth.signOut()
    router.push('/?account=deleted')
  }

  // ── Tabs config ───────────────────────────────────────────────────────────
  const TABS = [
    { key: 'profile' as const, label: 'Profile', icon: <User size={17} /> },
    { key: 'password' as const, label: 'Password', icon: <Lock size={17} /> },
    { key: 'account' as const, label: 'Account', icon: <Shield size={17} /> },
    { key: 'danger' as const, label: 'Danger Zone', icon: <Trash2 size={17} /> },
  ]

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#1B3060]" size={36} />
            <p className="text-gray-400 text-sm">Loading your settings…</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <Navbar />

      <div className="min-h-screen bg-gray-50">

        {/* ── Page header ── */}
        <div className="bg-[#1B3060] pt-16 pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-[#C9A227]/20 border-2 border-[#C9A227]/40 overflow-hidden flex items-center justify-center">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : <User size={32} className="text-[#C9A227]" />
                  }
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#C9A227] flex items-center justify-center shadow-lg hover:bg-[#b8911f] transition-colors disabled:opacity-60"
                >
                  {avatarUploading
                    ? <Loader2 size={14} className="text-white animate-spin" />
                    : <Camera size={14} className="text-white" />
                  }
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">{fullName || 'Your Name'}</h1>
                <p className="text-blue-200 text-sm mt-0.5">{userEmail}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#C9A227]/20 border border-[#C9A227]/30 text-[#C9A227] text-xs font-semibold px-3 py-1 rounded-full">
                    <BadgeCheck size={12} />
                    Seeker Account
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-20">
          <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">

            {/* ── Sidebar tabs ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <nav className="p-2">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all mb-1 last:mb-0
                      ${activeTab === tab.key
                        ? tab.key === 'danger'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-[#1B3060] text-white shadow-sm'
                        : tab.key === 'danger'
                          ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-[#1B3060]'
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.key && tab.key !== 'danger' && (
                      <ChevronRight size={15} className="ml-auto" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Sign out */}
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                >
                  <LogOut size={17} />
                  Sign Out
                </button>
              </div>
            </div>

            {/* ── Tab content ── */}
            <div>

              {/* ── PROFILE TAB ── */}
              {activeTab === 'profile' && (
                <Section
                  icon={<User size={20} />}
                  title="Profile Information"
                  subtitle="Update your personal details and photo"
                >
                  <div className="space-y-5">
                    <Field
                      label="Full Name"
                      value={fullName}
                      onChange={setFullName}
                      icon={<User size={16} />}
                      placeholder="e.g. Ali Raza"
                    />
                    <Field
                      label="Phone Number"
                      value={phone}
                      onChange={setPhone}
                      type="tel"
                      icon={<Phone size={16} />}
                      placeholder="+92 3XX XXXXXXX"
                    />
                    <Field
                      label="City"
                      value={city}
                      onChange={setCity}
                      icon={<MapPin size={16} />}
                      placeholder="e.g. Lahore"
                    />
                    <Field
                      label="Email Address"
                      value={userEmail}
                      onChange={() => {}}
                      type="email"
                      icon={<Mail size={16} />}
                      disabled
                    />
                    <p className="text-xs text-gray-400 -mt-2 ml-1">
                      Email cannot be changed. Contact support if needed.
                    </p>

                    <div className="pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={profileSaving}
                        className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-7 py-3 rounded-xl hover:bg-[#243d7a] transition-colors disabled:opacity-60 text-sm"
                      >
                        {profileSaving
                          ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                          : <><CheckCircle size={16} /> Save Changes</>
                        }
                      </button>
                    </div>
                  </div>
                </Section>
              )}

              {/* ── PASSWORD TAB ── */}
              {activeTab === 'password' && (
                <Section
                  icon={<Lock size={20} />}
                  title="Change Password"
                  subtitle="Keep your account secure with a strong password"
                >
                  <div className="space-y-5">
                    <Field
                      label="Current Password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      type="password"
                      placeholder="Enter your current password"
                    />
                    <div className="border-t border-gray-100 pt-5">
                      <Field
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        type="password"
                        placeholder="At least 8 characters"
                      />
                    </div>
                    <Field
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      type="password"
                      placeholder="Repeat your new password"
                    />

                    {/* Strength hints */}
                    {newPassword.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-4 space-y-1.5">
                        {[
                          { label: 'At least 8 characters', ok: newPassword.length >= 8 },
                          { label: 'Contains a number', ok: /\d/.test(newPassword) },
                          { label: 'Contains a letter', ok: /[a-zA-Z]/.test(newPassword) },
                        ].map((hint, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hint.ok ? 'bg-green-500' : 'bg-gray-200'}`}>
                              {hint.ok && <CheckCircle size={10} className="text-white" />}
                            </div>
                            <span className={hint.ok ? 'text-green-700' : 'text-gray-400'}>{hint.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={passwordSaving}
                        className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-7 py-3 rounded-xl hover:bg-[#243d7a] transition-colors disabled:opacity-60 text-sm"
                      >
                        {passwordSaving
                          ? <><Loader2 size={16} className="animate-spin" /> Updating…</>
                          : <><Lock size={16} /> Update Password</>
                        }
                      </button>
                    </div>
                  </div>
                </Section>
              )}

              {/* ── ACCOUNT TAB ── */}
              {activeTab === 'account' && (
                <Section
                  icon={<Shield size={20} />}
                  title="Account Information"
                  subtitle="Your account details and role on VisaGate"
                >
                  <div className="space-y-4">
                    {[
                      {
                        icon: <Mail size={17} className="text-[#1B3060]" />,
                        label: 'Email Address',
                        value: userEmail,
                      },
                      {
                        icon: <BadgeCheck size={17} className="text-[#C9A227]" />,
                        label: 'Account Type',
                        value: 'Seeker — Visa Service Buyer',
                      },
                      {
                        icon: <Calendar size={17} className="text-[#1B3060]" />,
                        label: 'Member Since',
                        value: memberSince || '—',
                      },
                      {
                        icon: <Shield size={17} className="text-green-600" />,
                        label: 'Account Status',
                        value: 'Active',
                        badge: true,
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                            {item.icon}
                          </div>
                          <span className="text-sm text-gray-500">{item.label}</span>
                        </div>
                        {item.badge
                          ? <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              {item.value}
                            </span>
                          : <span className="text-sm font-semibold text-[#1B3060]">{item.value}</span>
                        }
                      </div>
                    ))}

                    <div className="mt-4 bg-[#1B3060]/5 rounded-2xl p-5">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        <span className="font-semibold text-[#1B3060]">Want to become a consultant?</span>{' '}
                        Create a separate consultant account at{' '}
                        <a href="/register/consultant" className="text-[#C9A227] hover:underline font-medium">
                          visagate.pk/register/consultant
                        </a>
                        . Each role requires its own account.
                      </p>
                    </div>
                  </div>
                </Section>
              )}

              {/* ── DANGER ZONE TAB ── */}
              {activeTab === 'danger' && (
                <div className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden">
                  <div className="px-7 py-6 border-b border-red-50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-red-600 text-lg leading-tight">Danger Zone</h2>
                      <p className="text-gray-400 text-sm mt-0.5">Irreversible account actions</p>
                    </div>
                  </div>
                  <div className="px-7 py-7">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6 flex gap-3">
                      <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 mb-1">This action cannot be undone</p>
                        <p className="text-sm text-red-600 leading-relaxed">
                          Deleting your account will permanently remove your profile, saved consultants, appointment history, and all messages from VisaGate. This data cannot be recovered.
                        </p>
                      </div>
                    </div>

                    {!showDeleteBox ? (
                      <button
                        onClick={() => setShowDeleteBox(true)}
                        className="inline-flex items-center gap-2 bg-white border-2 border-red-200 text-red-500 font-semibold px-6 py-3 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all text-sm"
                      >
                        <Trash2 size={16} />
                        Delete My Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Type <span className="text-red-600 font-bold">DELETE</span> to confirm
                          </label>
                          <input
                            type="text"
                            value={deleteConfirm}
                            onChange={e => setDeleteConfirm(e.target.value)}
                            placeholder="Type DELETE here"
                            className="w-full border-2 border-red-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 bg-red-50/30 placeholder:text-gray-300"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                            className="inline-flex items-center gap-2 bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-40 text-sm"
                          >
                            {deleteLoading
                              ? <><Loader2 size={16} className="animate-spin" /> Deleting…</>
                              : <><Trash2 size={16} /> Yes, Delete My Account</>
                            }
                          </button>
                          <button
                            onClick={() => { setShowDeleteBox(false); setDeleteConfirm('') }}
                            className="text-sm text-gray-400 hover:text-gray-600 font-medium px-4 py-3"
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
        </div>
      </div>

      <Footer />
    </>
  )
}