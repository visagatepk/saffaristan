'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { signUp } from '@/lib/supabase/auth'
import GoogleAuthButton from '@/components/GoogleAuthButton'
export default function SeekerRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const { error } = await signUp(form.email, form.password, form.fullName, 'seeker')

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="font-heading font-bold text-navy text-2xl mb-2">
            Account Created!
          </h2>
          <p className="font-urdu text-gold text-base mb-3">اکاؤنٹ بن گیا</p>
          <p className="font-body text-gray-500 text-sm">
            Check your email to verify your account. Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">

      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="VisaGate.pk" width={150} height={38} className="h-9 w-auto" />
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md shadow-sm">

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/register" className="font-body text-xs text-gray-400 hover:text-navy transition-colors">
              ← Back
            </Link>
          </div>
          <h1 className="font-heading font-bold text-navy text-2xl mb-1">
            Create Seeker Account
          </h1>
          <p className="font-urdu text-gold text-sm">ویزا تلاش کنندہ اکاؤنٹ</p>
          <p className="font-body text-gray-400 text-xs mt-2">
            Free forever — browse and contact consultants
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl mb-5">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Muhammad Ali"
                required
                className="font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                required
                className="font-body w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
                className="font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
              />
            </div>
          </div>

          {/* Terms */}
          <p className="font-body text-xs text-gray-400 leading-relaxed">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="text-navy hover:text-gold transition-colors">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-navy hover:text-gold transition-colors">Privacy Policy</Link>
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="font-heading font-bold w-full bg-navy hover:bg-navy-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? 'Creating Account...' : 'Create Free Account'}
          </button>{/* Divider */}
<div className="flex items-center gap-4 my-2">
  <div className="flex-1 h-px bg-gray-200" />
  <span className="font-body text-xs text-gray-400">or</span>
  <div className="flex-1 h-px bg-gray-200" />
</div>

{/* Google */}
<GoogleAuthButton label="Sign up with Google" />

        </form>

        <p className="font-body text-center text-xs text-gray-400 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-navy hover:text-gold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}