'use client'
// FILE: app/verify-email/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, Mail, AlertCircle, RefreshCw } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'verified' | 'pending' | 'error'>('checking')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user?.email_confirmed_at) {
        setEmail(session.user.email || '')
        setStatus('verified')
        // Redirect based on role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()

        setTimeout(() => {
          const role = profile?.role
          if (role === 'admin') router.push('/dashboard/admin')
          else if (role === 'editor') router.push('/dashboard/editor')
          else if (role === 'consultant') router.push('/dashboard/consultant')
          else router.push('/dashboard/seeker')
        }, 2500)
      } else if (session?.user) {
        setEmail(session.user.email || '')
        setStatus('pending')
      } else {
        setStatus('pending')
      }
    }
    check()

    // Listen for auth changes (when user clicks link in another tab)
    const supabaseClient = createClient()
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setStatus('verified')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleResend = async () => {
    if (!email || resending) return
    setResending(true)
    const supabase = createClient()
    await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    setResent(true)
    setTimeout(() => setResent(false), 5000)
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#1B3060]" />
      </div>
    )
  }

  if (status === 'verified') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B3060] mb-2 font-['Plus_Jakarta_Sans']">
            Email Verified! 🎉
          </h2>
          <p className="text-gray-500 text-sm mb-2">Your email has been verified successfully.</p>
          <p className="text-gray-400 text-xs">Redirecting you to your dashboard...</p>
          <div className="flex justify-center mt-4">
            <Loader2 size={22} className="animate-spin text-[#C9A227]" />
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

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-[#1B3060]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail size={30} className="text-[#1B3060]" />
          </div>

          <h2 className="text-2xl font-bold text-[#1B3060] mb-2 font-['Plus_Jakarta_Sans']">
            Verify Your Email
          </h2>

          {email ? (
            <p className="text-gray-500 text-sm mb-1">
              We sent a verification link to:
            </p>
          ) : null}
          {email && (
            <p className="font-semibold text-[#1B3060] mb-5">{email}</p>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 text-left">
            <p className="text-amber-800 text-sm font-semibold mb-2">📬 Next steps:</p>
            <ol className="text-amber-700 text-sm space-y-1.5 list-decimal list-inside">
              <li>Open your email inbox</li>
              <li>Find the email from VisaGate.pk</li>
              <li>Click the <strong>"Confirm your email"</strong> button</li>
              <li>You'll be redirected to your dashboard</li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-gray-600 text-sm font-semibold mb-1">Didn't receive it?</p>
            <ul className="text-gray-500 text-xs space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you used the correct email</li>
              <li>• The link expires in 24 hours</li>
            </ul>
          </div>

          {resent && (
            <div className="flex items-center gap-2 text-green-600 text-sm mb-4 justify-center bg-green-50 py-2.5 rounded-xl">
              <CheckCircle size={14} /> Verification email resent!
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 mb-4"
          >
            {resending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Resend Verification Email
          </button>

          <Link href="/login" className="text-sm text-gray-400 hover:text-[#1B3060] transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}