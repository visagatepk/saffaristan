'use client'
// FILE: app/register/seeker/page.tsx
// Updated: Phone number is now MANDATORY

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import UserAgreementModal from '@/components/UserAgreementModal'
import {
  User, Mail, Lock, Phone, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader2, ArrowRight
} from 'lucide-react'

export default function SeekerSignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const formatPhone = (val: string) => {
    // Auto-format Pakistani numbers
    const digits = val.replace(/\D/g, '')
    if (digits.startsWith('92')) return '+' + digits
    if (digits.startsWith('0')) return '+92' + digits.slice(1)
    return val
  }

  const validate = () => {
    if (!form.displayName.trim()) return 'Please enter your full name.'
    if (!form.email.trim()) return 'Please enter your email.'
    if (!form.phone.trim()) return 'Phone number is required.'
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) return 'Please enter a valid phone number.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    if (!agreed) return 'Please accept the Terms & Conditions.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          display_name: form.displayName.trim(),
          role: 'seeker',
          phone: formatPhone(form.phone),
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Update profile with phone
    if (data.user) {
      await supabase.from('profiles').update({
        phone: formatPhone(form.phone),
        display_name: form.displayName.trim(),
        role: 'seeker',
      }).eq('user_id', data.user.id)
    }

    setLoading(false)
    router.push('/verify-email')
  }

  const getStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }
  const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strength = getStrength(form.password)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1B3060] rounded-xl flex items-center justify-center text-white font-bold">VG</div>
              <span className="text-xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans']">VisaGate<span className="text-[#C9A227]">.pk</span></span>
            </div>
          </Link>
          <p className="text-gray-500 text-sm mt-3">Create your Seeker account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">

          {/* Google Auth */}
          <GoogleAuthButton role="seeker" />

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.displayName}
                  onChange={set('displayName')}
                  placeholder="Ahmad Hassan"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]"
                />
              </div>
            </div>

            {/* Phone — MANDATORY */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1 text-xs">(required)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-gray-600 font-medium border-r border-gray-200 pr-3">
                  🇵🇰 +92
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="3XX XXXXXXX"
                  required
                  className="w-full pl-24 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Used for appointment reminders and account security</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-orange-500' : 'text-green-600'}`}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Re-enter password"
                  required
                  className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060] ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#1B3060] cursor-pointer"
              />
              <label htmlFor="agree" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <button type="button" onClick={() => setShowModal(true)} className="text-[#C9A227] font-semibold hover:underline">
                  Terms & Conditions
                </button>
                {' '}and{' '}
                <Link href="/privacy-policy" target="_blank" className="text-[#C9A227] font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-sm">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B3060] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#243d7a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C9A227] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

  {showModal && (
  <UserAgreementModal
    onAccept={() => { setAgreed(true); setShowModal(false) }}
    onDecline={() => setShowModal(false)}
  />
)}
    </div>
  )
}