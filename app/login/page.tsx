'use client'
// FILE: app/login/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import GoogleAuthButton from '@/components/GoogleAuthButton'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Login failed. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user.id)
      .single()

  if (profile?.role === 'consultant') {
  router.push('/dashboard/consultant')
} else if (profile?.role === 'admin') {
  router.push('/dashboard/admin')
} else if (profile?.role === 'editor') {
  router.push('/dashboard/editor')
} else {
  router.push('/dashboard/seeker')
}
router.refresh()
} 
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16 max-w-xl mx-auto w-full">

        {/* Logo */}
        <Link href="/" className="mb-10 inline-block">
          <Image
            src="/logo.png"
            alt="VisaGate.pk"
            width={160}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-navy text-3xl mb-2">
            Welcome back
          </h1>
          <p className="font-urdu text-gold text-base">
            واپس خوش آمدید
          </p>
          <p className="font-body text-gray-500 mt-2 text-sm">
            Sign in to your VisaGate.pk account
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl mb-6">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="font-body text-sm font-medium text-gray-700 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="font-body w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-body text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-body text-xs text-gold hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="font-body w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="font-heading font-bold w-full bg-navy hover:bg-navy-dark text-white py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="font-body text-xs text-gray-400">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Login */}
        <GoogleAuthButton label="Continue with Google" />

        {/* Register link */}
        <p className="font-body text-center text-sm text-gray-500 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-navy hover:text-gold transition-colors">
            Create one free
          </Link>
        </p>

      </div>

      {/* Right — Decorative panel */}
      <div className="hidden lg:flex flex-1 bg-navy items-center justify-center p-16 relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full border border-white/10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full border border-white/5 -translate-x-1/2 translate-y-1/2" />

        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2 className="font-heading font-bold text-white text-2xl mb-3">
            Pakistan&apos;s Most Trusted Platform
          </h2>
          <p className="font-urdu text-gold/80 text-base mb-6">
            پاکستان کا سب سے قابل اعتماد پلیٹ فارم
          </p>
          <p className="font-body text-white/50 text-sm leading-relaxed">
            Join thousands of visa seekers who found their perfect consultant through VisaGate.pk
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { num: '500+', label: 'Consultants' },
              { num: '4.8★', label: 'Avg Rating' },
              { num: '0', label: 'Fraud Cases' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="font-heading font-extrabold text-gold text-xl">{s.num}</div>
                <div className="font-body text-white/40 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}