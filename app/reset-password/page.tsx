'use client'
// FILE: app/reset-password/page.tsx

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'invalid'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase sets the session from the URL hash automatically
    const supabase = createClient()
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setSessionReady(true)
      }
    })

    // Check if we already have a session (recovery token in URL)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setSessionReady(true)
      else {
        // Give it a moment for URL hash to be processed
        setTimeout(async () => {
          const { data: { session: s2 } } = await supabase.auth.getSession()
          if (s2) setSessionReady(true)
          else setStatus('invalid')
        }, 1500)
      }
    }
    checkSession()
  }, [])

  const getStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const strength = getStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setStatus('error')
      setErrorMsg('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setStatus('error')
      setErrorMsg('Password must be at least 8 characters.')
      return
    }
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('success')
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  // Invalid/expired link
  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1B3060] mb-2 font-['Plus_Jakarta_Sans']">Link Expired</h2>
          <p className="text-gray-500 text-sm mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
          <Link href="/forgot-password" className="inline-block bg-[#1B3060] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#243d7a] transition-colors">
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  // Success
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-[#1B3060] mb-2 font-['Plus_Jakarta_Sans']">Password Updated!</h2>
          <p className="text-gray-500 text-sm mb-6">Your password has been changed successfully. Redirecting you to login...</p>
          <div className="flex justify-center">
            <Loader2 size={24} className="animate-spin text-[#C9A227]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1B3060] rounded-xl flex items-center justify-center text-white font-bold">VG</div>
              <span className="text-xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans']">VisaGate<span className="text-[#C9A227]">.pk</span></span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-[#1B3060]/10 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={22} className="text-[#1B3060]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mb-1">
              Set New Password
            </h2>
            <p className="text-gray-500 text-sm">Choose a strong password for your account.</p>
          </div>

          {!sessionReady ? (
            <div className="flex items-center justify-center py-8 gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Verifying reset link...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength Meter */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-orange-500' : strength === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060] ${
                      confirm && password !== confirm ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                )}
                {confirm && password === confirm && confirm.length > 0 && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><CheckCircle size={11} /> Passwords match</p>
                )}
              </div>

              {/* Password Rules */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-medium mb-1.5">Password must have:</p>
                <div className="space-y-1">
                  {[
                    { rule: 'At least 8 characters', met: password.length >= 8 },
                    { rule: 'One uppercase letter', met: /[A-Z]/.test(password) },
                    { rule: 'One number', met: /[0-9]/.test(password) },
                  ].map(({ rule, met }) => (
                    <p key={rule} className={`text-xs flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle size={11} className={met ? 'text-green-500' : 'text-gray-300'} />
                      {rule}
                    </p>
                  ))}
                </div>
              </div>

              {status === 'error' && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-sm">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !password || !confirm}
                className="w-full bg-[#C9A227] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#b8911f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Updating...</>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}