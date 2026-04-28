'use client'
// FILE: app/forgot-password/page.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#1B3060] rounded-xl flex items-center justify-center text-white font-bold">VG</div>
              <span className="text-xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans']">VisaGate<span className="text-[#C9A227]">.pk</span></span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

          {status === 'sent' ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-[#1B3060] mb-2 font-['Plus_Jakarta_Sans']">
                Check Your Email
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                We've sent a password reset link to:
              </p>
              <p className="font-semibold text-[#1B3060] mb-6">{email}</p>
              <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-left">
                <p className="text-blue-800 text-sm font-semibold mb-1">📧 Didn't receive it?</p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure the email is correct</li>
                  <li>• Link expires in 1 hour</li>
                </ul>
              </div>
              <button
                onClick={() => { setStatus('idle'); setEmail('') }}
                className="text-[#C9A227] text-sm font-medium hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-[#1B3060]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Mail size={22} className="text-[#1B3060]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mb-1">
                  Forgot Password?
                </h2>
                <p className="text-gray-500 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060] focus:border-transparent"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    {errorMsg || 'Something went wrong. Please try again.'}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="w-full bg-[#1B3060] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#243d7a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending link...</>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3060] transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}