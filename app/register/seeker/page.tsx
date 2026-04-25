'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import UserAgreementModal from '@/components/UserAgreementModal'

export default function SeekerSignup() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [pendingGoogleSignup, setPendingGoogleSignup] = useState(false)

  // Google signup — show agreement first
  const handleGoogleClick = () => {
    setError('')
    if (!agreedToTerms) {
      setPendingGoogleSignup(true)
      setShowAgreement(true)
      return
    }
    proceedWithGoogle()
  }

  const proceedWithGoogle = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { role: 'seeker' },
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  // Form submit — show agreement first
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!agreedToTerms) {
      setPendingGoogleSignup(false)
      setShowAgreement(true)
      return
    }

    handleSignup()
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'seeker' } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        user_id: data.user.id,
        full_name: fullName,
        email,
        phone,
        role: 'seeker',
      })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/seeker'), 2000)
    }
    setLoading(false)
  }

  // Called when user accepts agreement
  const handleAgreementAccept = () => {
    setAgreedToTerms(true)
    setShowAgreement(false)
    if (pendingGoogleSignup) {
      setPendingGoogleSignup(false)
      proceedWithGoogle()
    } else {
      handleSignup()
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <h2 className="font-heading font-bold text-navy text-xl mb-2">Account Created!</h2>
          <p className="font-body text-gray-500 text-sm mb-1">Welcome to VisaGate.pk</p>
          <p className="font-body text-gray-400 text-xs">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  const inputClass = "font-body w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Agreement Modal */}
      {showAgreement && (
        <UserAgreementModal
          onAccept={handleAgreementAccept}
          onDecline={() => {
            setShowAgreement(false)
            setPendingGoogleSignup(false)
          }}
        />
      )}

      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16 max-w-xl mx-auto w-full">

        <Link href="/" className="mb-8 inline-block">
          <Image src="/logo.png" alt="VisaGate.pk" width={150} height={38} className="h-9 w-auto" />
        </Link>

        <div className="mb-6">
          <h1 className="font-heading font-bold text-navy text-2xl lg:text-3xl mb-2">
            Create Free Account
          </h1>
          <p className="font-urdu text-gold text-base mb-1">مفت اکاؤنٹ بنائیں</p>
          <p className="font-body text-gray-500 text-sm">
            Find verified visa consultants across Pakistan
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Google Signup Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-heading font-semibold text-sm py-3 rounded-xl transition-all duration-200 mb-5 disabled:opacity-60"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="font-body text-xs text-gray-400">or sign up with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Full Name *</label>
            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Muhammad Ali" required autoComplete="name" className={inputClass} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" className={inputClass} />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+92 300 1234567" autoComplete="tel" className={inputClass} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Password *</label>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters" required autoComplete="new-password"
                className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Confirm Password *</label>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password" required autoComplete="new-password"
                className={`${inputClass} pr-12 ${
                  confirmPassword && password !== confirmPassword ? 'border-red-300' :
                  confirmPassword && password === confirmPassword ? 'border-green-300' : ''
                }`} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="font-body text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
            )}
          </div>

          {/* Terms notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="font-body text-xs text-amber-700 leading-relaxed">
              ⚠️ You will be asked to read and agree to our User Agreement before account creation.
            </p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="font-heading font-bold w-full text-white py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 text-sm hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' }}>
            {loading ? 'Creating Account...' : 'Create Account — Free'}
          </button>

        </form>

        <p className="font-body text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-navy hover:text-gold transition-colors">
            Sign In
          </Link>
        </p>
        <p className="font-body text-center text-xs text-gray-400 mt-2">
          Are you a consultant?{' '}
          <Link href="/register/consultant" className="font-semibold text-gold hover:underline">
            Register here
          </Link>
        </p>
      </div>

      {/* Right — Decorative */}
      <div className="hidden lg:flex flex-1 bg-navy items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full border border-white/5 -translate-x-1/2 translate-y-1/2" />

        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2 className="font-heading font-bold text-white text-2xl mb-2">Find Trusted Consultants</h2>
          <p className="font-urdu text-gold text-lg mb-3">قابل اعتماد کنسلٹنٹ تلاش کریں</p>
          <p className="font-body text-white/50 text-sm leading-relaxed mb-8">
            Join thousands of Pakistanis who found their perfect visa consultant on VisaGate.pk
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { num: '500+', label: 'Consultants' },
              { num: '4.8★', label: 'Avg Rating' },
              { num: 'Free', label: 'To Join' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="font-heading font-extrabold text-gold text-xl">{s.num}</div>
                <div className="font-body text-white/40 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3 text-left">
            {[
              'Browse 500+ verified consultants',
              'Compare reviews and success rates',
              'Message consultants directly',
              'Book appointments easily',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle size={11} className="text-gold" />
                </div>
                <span className="font-body text-white/60 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}