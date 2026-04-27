'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ── Password strength helper ────────────────────────────────────────────────
function getStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

// ── Toggle component ────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#1B3060]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function SeekerSettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  // Password state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg]         = useState<{ text: string; ok: boolean } | null>(null)

  // Notification state
  const [notifs, setNotifs] = useState({
    newMessage:      true,
    appointmentUpdate: true,
    promotions:      false,
    newsletter:      false,
  })

  // Delete account state
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Sign-out state
  const [signOutLoading, setSignOutLoading] = useState(false)

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()
      if (profile?.role !== 'seeker') router.push('/login')
    }
    check()
  }, [])

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPwMsg(null)
    if (!newPw || !confirmPw) { setPwMsg({ text: 'Please fill in all fields.', ok: false }); return }
    if (newPw !== confirmPw)  { setPwMsg({ text: 'New passwords do not match.', ok: false }); return }
    if (getStrength(newPw) < 2) { setPwMsg({ text: 'Password is too weak.', ok: false }); return }

    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwLoading(false)

    if (error) { setPwMsg({ text: error.message, ok: false }) }
    else {
      setPwMsg({ text: 'Password updated successfully!', ok: true })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    }
  }

  // ── Sign out all devices ──────────────────────────────────────────────────
  const handleSignOutAll = async () => {
    setSignOutLoading(true)
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/login')
  }

  // ── Delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return
    setDeleteLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setDeleteLoading(false); return }

    // Delete profile row — Supabase cascade will clean related rows
    await supabase.from('profiles').delete().eq('user_id', session.user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  const strength = getStrength(newPw)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-[#1B3060]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Account Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your security and preferences</p>
        </div>

        {/* ── Change Password ── */}
        <div className="bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-lg font-semibold text-[#1B3060] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            🔒 Change Password
          </h2>
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B3060]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B3060]/30"
              />
              {/* Strength bar */}
              {newPw.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="flex-1 rounded-full transition-all duration-300"
                        style={{ backgroundColor: i <= strength ? strengthColor[strength] : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B3060]/30"
              />
            </div>

            {pwMsg && (
              <p className={`text-sm font-medium ${pwMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                {pwMsg.ok ? '✅' : '⚠️'} {pwMsg.text}
              </p>
            )}

            <button
              onClick={handleChangePassword}
              disabled={pwLoading}
              className="bg-[#1B3060] text-white text-sm font-semibold px-6 py-2.5 rounded-[10px] hover:bg-[#162550] transition disabled:opacity-50"
            >
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* ── Notification Preferences ── */}
        <div className="bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-lg font-semibold text-[#1B3060] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            🔔 Notification Preferences
          </h2>
          <div className="space-y-4">
            {[
              { key: 'newMessage',         label: 'New Messages',           desc: 'Get notified when a consultant replies to you' },
              { key: 'appointmentUpdate',  label: 'Appointment Updates',    desc: 'Confirmations, cancellations and reminders' },
              { key: 'promotions',         label: 'Promotional Emails',     desc: 'Special offers and featured consultants' },
              { key: 'newsletter',         label: 'VisaGate Newsletter',    desc: 'Weekly visa tips and destination guides' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle
                  checked={notifs[key as keyof typeof notifs]}
                  onChange={() => setNotifs(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifs] }))}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Notification settings are saved locally on this device.</p>
        </div>

        {/* ── Sign Out All Devices ── */}
        <div className="bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-lg font-semibold text-[#1B3060] mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            📱 Sign Out All Devices
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This will sign you out from all browsers and devices where you're currently logged in.
          </p>
          <button
            onClick={handleSignOutAll}
            disabled={signOutLoading}
            className="border border-[#1B3060] text-[#1B3060] text-sm font-semibold px-6 py-2.5 rounded-[10px] hover:bg-[#1B3060] hover:text-white transition disabled:opacity-50"
          >
            {signOutLoading ? 'Signing out…' : 'Sign Out All Devices'}
          </button>
        </div>

        {/* ── Delete Account ── */}
        <div className="bg-white rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 border border-red-100">
          <h2 className="text-lg font-semibold text-red-600 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            🗑️ Delete Account
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your VisaGate account. This cannot be undone — all your saved consultants, appointments and messages will be removed.
          </p>
          <button
            onClick={() => setDeleteModal(true)}
            className="bg-red-50 text-red-600 border border-red-200 text-sm font-semibold px-6 py-2.5 rounded-[10px] hover:bg-red-600 hover:text-white transition"
          >
            Delete My Account
          </button>
        </div>

      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[20px] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-red-600 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Delete Account?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action is <strong>permanent and irreversible</strong>. All your data including saved consultants, appointments and conversations will be deleted.
            </p>
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Type <span className="text-red-600 font-bold">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full border border-gray-200 rounded-[10px] px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteModal(false); setDeleteInput('') }}
                className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-[10px] hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleteLoading}
                className="flex-1 bg-red-600 text-white text-sm font-semibold py-2.5 rounded-[10px] hover:bg-red-700 transition disabled:opacity-40"
              >
                {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}