'use client'
// FILE: app/dashboard/consultant/settings/page.tsx

import { useState, useEffect } from 'react'
import {
  Bell, Lock, Trash2, Shield,
  CheckCircle, AlertCircle, Eye, EyeOff,
  Save, AlertTriangle, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ConsultantSettings() {
  const router   = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Password
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew]                 = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError]     = useState('')

  // Notifications
  const [notifBooking, setNotifBooking]       = useState(true)
  const [notifMessage, setNotifMessage]       = useState(true)
  const [notifReview, setNotifReview]         = useState(true)
  const [notifNewsletter, setNotifNewsletter] = useState(false)
  const [notifLoading, setNotifLoading]       = useState(false)
  const [notifSuccess, setNotifSuccess]       = useState(false)

  // Danger zone
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading]         = useState(false)
  const [showDeleteModal, setShowDeleteModal]     = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('profiles')
        .select('id, notify_booking, notify_message, notify_review, notify_newsletter')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setProfile(data)
        // Restore saved notification prefs if they exist
        if (data.notify_booking  != null) setNotifBooking(data.notify_booking)
        if (data.notify_message  != null) setNotifMessage(data.notify_message)
        if (data.notify_review   != null) setNotifReview(data.notify_review)
        if (data.notify_newsletter != null) setNotifNewsletter(data.notify_newsletter)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }
    if (newPassword.length < 6) { setPasswordError('Must be at least 6 characters'); return }

    setPasswordLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPasswordError(error.message)
    else {
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    }
    setPasswordLoading(false)
  }

  const handleNotifSave = async () => {
    setNotifLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      notify_booking:    notifBooking,
      notify_message:    notifMessage,
      notify_review:     notifReview,
      notify_newsletter: notifNewsletter,
    }).eq('id', profile.id)
    setNotifSuccess(true)
    setTimeout(() => setNotifSuccess(false), 3000)
    setNotifLoading(false)
  }

  const handleLogoutAll = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setDeleteLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      verification_status: 'inactive',
      display_name: 'Deleted Account',
      bio: null, phone: null,
    }).eq('id', profile.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const inputClass = "font-body w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10 transition-all"
  const cardClass  = "bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]"

  return (
    <div className="max-w-2xl space-y-5">

      <div className="mb-2">
        <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-1">Settings</h1>
        <p className="font-body text-gray-400 text-sm">Manage your account security and preferences</p>
      </div>

      {/* ── Password ── */}
      <div className={cardClass}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-8 h-8 bg-[#EBF0F8] rounded-lg flex items-center justify-center">
            <Lock size={15} className="text-[#1B3060]" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-[#1B3060] text-sm">Change Password</h2>
            <p className="font-body text-gray-400 text-xs">Update your account password</p>
          </div>
        </div>
        <div className="p-6">
          {passwordSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-body px-4 py-3 rounded-xl mb-5">
              <CheckCircle size={15} className="shrink-0" /> Password updated successfully!
            </div>
          )}
          {passwordError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={15} className="shrink-0" /> {passwordError}
            </div>
          )}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="font-body text-xs font-medium text-gray-600 block mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {/* Confirm Password */}
            <div>
              <label className="font-body text-xs font-medium text-gray-600 block mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className={`${inputClass} pl-10 pr-10 ${
                    confirmPassword && newPassword !== confirmPassword ? 'border-red-300' :
                    confirmPassword && newPassword === confirmPassword ? 'border-green-300' : ''
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="font-body text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
              )}
            </div>
            {/* Strength indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {[newPassword.length >= 6, newPassword.length >= 10, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword)].map((met, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${met ? 'bg-green-400' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <div className="space-y-1">
                  {[
                    { label: 'At least 6 characters',        met: newPassword.length >= 6 },
                    { label: 'At least 10 characters',       met: newPassword.length >= 10 },
                    { label: 'Contains uppercase letter',    met: /[A-Z]/.test(newPassword) },
                    { label: 'Contains a number',            met: /[0-9]/.test(newPassword) },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${item.met ? 'bg-green-400' : 'bg-gray-200'}`}>
                        {item.met && <CheckCircle size={9} className="text-white" />}
                      </div>
                      <span className={`font-body text-xs ${item.met ? 'text-green-600' : 'text-gray-400'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" disabled={passwordLoading}
              className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white px-6 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' }}>
              <Save size={14} />
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className={cardClass}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-8 h-8 bg-[#FBF5E0] rounded-lg flex items-center justify-center">
            <Bell size={15} className="text-[#C9A227]" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-[#1B3060] text-sm">Notification Preferences</h2>
            <p className="font-body text-gray-400 text-xs">Choose what updates you receive</p>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {notifSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-body px-4 py-3 rounded-xl">
              <CheckCircle size={15} className="shrink-0" /> Preferences saved!
            </div>
          )}
          {[
            { label: 'Booking Requests',              desc: 'When a seeker books a consultation with you',          value: notifBooking,     setter: setNotifBooking,     important: true },
            { label: 'New Messages',                  desc: 'When you receive a new chat message',                  value: notifMessage,     setter: setNotifMessage,     important: true },
            { label: 'New Reviews',                   desc: 'When someone leaves a review on your profile',         value: notifReview,      setter: setNotifReview,      important: false },
            { label: 'Platform Updates & Newsletter', desc: 'News, tips and announcements from VisaGate.pk',        value: notifNewsletter,  setter: setNotifNewsletter,  important: false },
          ].map(item => (
            <div key={item.label} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-heading font-semibold text-[#1B3060] text-sm">{item.label}</p>
                  {item.important && (
                    <span className="font-body text-[10px] font-bold bg-[#FBF5E0] text-[#C9A227] px-1.5 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="font-body text-gray-500 text-xs">{item.desc}</p>
              </div>
              <button
                onClick={() => item.setter(!item.value)}
                className={`relative w-11 h-6 rounded-full transition-all duration-200 shrink-0 mt-0.5 ${
                  item.value ? 'bg-[#1B3060]' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  item.value ? 'left-5' : 'left-0.5'
                }`} />
              </button>
            </div>
          ))}
          <button onClick={handleNotifSave} disabled={notifLoading}
            className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white px-6 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 mt-1"
            style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
            <Save size={14} />
            {notifLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* ── Security ── */}
      <div className={cardClass}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Shield size={15} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-[#1B3060] text-sm">Security</h2>
            <p className="font-body text-gray-400 text-xs">Manage your active sessions</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl mb-4">
            <div>
              <p className="font-heading font-semibold text-[#1B3060] text-sm mb-0.5">Current Session</p>
              <p className="font-body text-gray-500 text-xs">You are currently logged in on this device</p>
            </div>
            <span className="font-body text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full shrink-0">
              Active
            </span>
          </div>
          <button
            onClick={handleLogoutAll}
            className="inline-flex items-center gap-2 font-heading font-bold text-sm text-[#1B3060] border border-[#1B3060]/20 bg-[#EBF0F8] hover:bg-[#1B3060] hover:text-white px-5 py-2.5 rounded-xl transition-all"
          >
            <LogOut size={14} /> Sign Out of All Devices
          </button>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="bg-white rounded-2xl border-2 border-red-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100 bg-red-50">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle size={15} className="text-red-500" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-red-700 text-sm">Danger Zone</h2>
            <p className="font-body text-red-400 text-xs">Irreversible actions — proceed with caution</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div>
              <p className="font-heading font-bold text-red-700 text-sm mb-1">Delete Account</p>
              <p className="font-body text-red-600 text-xs leading-relaxed">
                Permanently remove your consultant profile, services, reviews and messages. Cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="font-heading font-bold text-xs text-red-600 border-2 border-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 px-4 py-2 rounded-xl transition-all shrink-0"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="font-heading font-bold text-[#1B3060] text-xl text-center mb-2">
              Delete Your Account?
            </h3>
            <p className="font-body text-gray-500 text-sm text-center leading-relaxed mb-6">
              This will permanently deactivate your consultant profile, remove your services and hide all listings. Reviews may remain anonymized.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="font-body text-red-700 text-xs leading-relaxed">
                ⚠️ All data removed within 14 days. This cannot be undone.
              </p>
            </div>
            <div className="mb-5">
              <label className="font-body text-xs font-medium text-gray-700 block mb-2">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="font-body w-full px-4 py-3 border-2 border-red-200 rounded-xl text-sm outline-none focus:border-red-400 transition-all tracking-widest font-bold text-red-600 placeholder-gray-300"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}
                className="flex-1 font-heading font-bold text-sm text-[#1B3060] border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className="flex-1 font-heading font-bold text-sm text-white py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: deleteConfirmText === 'DELETE' ? '#ef4444' : '#9ca3af' }}
              >
                {deleteLoading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Trash2 size={14} /> Delete Account</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}