'use client'
// FILE: app/register/consultant/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Lock, Phone, Building2, MapPin,
  Briefcase, CheckCircle, AlertCircle, Eye, EyeOff,
  ArrowRight, ArrowLeft, Calendar, Hash
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import GoogleAuthButton from '@/components/GoogleAuthButton'

const STEPS = ['Basic Info', 'Business Info', 'Verification', 'Complete']

const CITIES = [
  'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi',
  'Peshawar', 'Quetta', 'Multan', 'Faisalabad',
  'Hyderabad', 'Sargodha',
]

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-green-500 text-white' :
              i === step ? 'bg-[#1B3060] text-white' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-10 sm:w-14 mx-1 transition-colors ${
                i < step ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {STEPS.map((s, i) => (
          <span key={s} className={`text-xs ${
            i === step ? 'text-[#1B3060] font-semibold' : 'text-gray-400'
          }`}>{s}</span>
        ))}
      </div>
    </div>
  )
}

export default function ConsultantSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [isExistingUser, setIsExistingUser] = useState(false)

  // Step 1 fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Step 2 fields
  const [displayName, setDisplayName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [experience, setExperience] = useState('')

  // Step 3 fields
  const [oepLicenseNumber, setOepLicenseNumber] = useState('')
  const [oepExpiryDate, setOepExpiryDate] = useState('')
  const [secpDate, setSecpDate] = useState('')
  const [ntnNumber, setNtnNumber] = useState('')

  // ── Check if already logged in as seeker ─────────────────────
  useEffect(() => {
    const supabase = createClient()
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, display_name, full_name, phone')
          .eq('user_id', session.user.id)
          .single()

        if (profile?.role === 'seeker') {
          setIsExistingUser(true)
          setUserId(session.user.id)
          setFullName(profile.full_name || profile.display_name || '')
          setPhone(profile.phone || '')
          setStep(1) // skip account creation
        } else if (profile?.role === 'consultant') {
          router.push('/dashboard/consultant')
        }
      }
    }
    check()
  }, [])

  // ── Step 1: Create account (new users only) ───────────────────
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!phone.trim()) { setError('Phone number is required.'); return }

    setLoading(true)
    const supabase = createClient()

    // Check phone uniqueness
    const { data: existingPhone } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', phone.trim())
    if (existingPhone && existingPhone.length > 0) {
      setError('This phone number is already registered. Please use a different number.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'consultant' } },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      setUserId(data.user.id)
      await supabase.from('profiles').update({
        role: 'consultant',
        full_name: fullName,
        phone: phone.trim(),
      }).eq('user_id', data.user.id)
    }
    setLoading(false)
    setStep(1)
  }

  // ── Step 2: Business info ─────────────────────────────────────
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!displayName.trim() || !city) { setError('Please fill all required fields.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.from('profiles').update({
      display_name: displayName.trim(),
      business_name: businessName.trim(),
      city,
      office_address: address.trim(),
      years_experience: parseInt(experience) || 0,
      role: 'consultant',
    }).eq('user_id', userId)
    if (updateError) { setError(updateError.message); setLoading(false); return }
    setLoading(false)
    setStep(2)
  }

  // ── Step 3: Verification ──────────────────────────────────────
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const oepFormat = /^OEPL\s*No\.\s*\d{1,6}\/[A-Z]{2,5}$/i
    if (!oepFormat.test(oepLicenseNumber.trim())) {
      setError('OEP format must be: OEPL No. 3702/LHR')
      return
    }
    if (!oepExpiryDate || !secpDate || !ntnNumber.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Check OEP uniqueness
    const { data: existingOep } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('oep_license_number', oepLicenseNumber.trim().toUpperCase())
      .neq('user_id', userId)
    if (existingOep && existingOep.length > 0) {
      setError('This OEP license number is already registered on VisaGate.pk.')
      setLoading(false)
      return
    }

    // Check NTN uniqueness
    const { data: existingNtn } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('ntn_number', ntnNumber.trim())
      .neq('user_id', userId)
    if (existingNtn && existingNtn.length > 0) {
      setError('This NTN number is already registered on VisaGate.pk.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.from('profiles').update({
      oep_license_number: oepLicenseNumber.trim().toUpperCase(),
      oep_expiry_date: oepExpiryDate,
      secp_registration_date: secpDate,
      ntn_number: ntnNumber.trim(),
      verification_status: 'pending_verification',
      role: 'consultant',
    }).eq('user_id', userId)

    if (updateError) { setError(updateError.message); setLoading(false); return }
    setLoading(false)
    setStep(3)
  }

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1B3060] rounded-xl flex items-center justify-center text-white font-bold">VG</div>
              <span className="text-xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans']">
                VisaGate<span className="text-[#C9A227]">.pk</span>
              </span>
            </div>
          </Link>
          {isExistingUser && (
            <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-xl inline-block">
              Upgrading your account to Consultant 🎉
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
          <StepIndicator step={step} />

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* ── STEP 0: Account Creation ── */}
          {step === 0 && !isExistingUser && (
            <form onSubmit={handleStep1} className="space-y-4">
              <h2 className="font-bold text-[#1B3060] text-lg font-['Plus_Jakarta_Sans'] mb-4">Create Your Account</h2>

              <GoogleAuthButton role="consultant" />

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs">or with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                    placeholder="Ahmad Khan"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-600 font-medium border-r border-gray-200 pr-3">
                    🇵🇰 +92
                  </div>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                    placeholder="3XX XXXXXXX"
                    className="w-full pl-24 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#1B3060] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#243d7a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Creating...' : <><span>Continue</span><ArrowRight size={15} /></>}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-[#C9A227] font-semibold hover:underline">Sign in</Link>
              </p>
            </form>
          )}

          {/* ── STEP 1: Business Info ── */}
          {step === 1 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <h2 className="font-bold text-[#1B3060] text-lg font-['Plus_Jakarta_Sans'] mb-4">Business Information</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required
                    placeholder="Name shown to clients"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business / Company Name</label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    placeholder="Optional"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select value={city} onChange={e => setCity(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060] bg-white">
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Office Address</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                    placeholder="Office address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060] resize-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years of Experience</label>
                <div className="relative">
                  <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" min="0" max="50" value={experience} onChange={e => setExperience(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {!isExistingUser && (
                  <button type="button" onClick={() => setStep(0)}
                    className="flex items-center gap-1.5 px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#1B3060] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#243d7a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? 'Saving...' : <><span>Continue</span><ArrowRight size={15} /></>}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: Verification ── */}
          {step === 2 && (
            <form onSubmit={handleStep3} className="space-y-4">
              <h2 className="font-bold text-[#1B3060] text-lg font-['Plus_Jakarta_Sans'] mb-1">Verification Details</h2>
              <p className="text-gray-500 text-sm mb-4">Reviewed by our admin team within 24 hours.</p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  OEP License Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={oepLicenseNumber} onChange={e => setOepLicenseNumber(e.target.value)} required
                    placeholder="OEPL No. 3702/LHR"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Format: OEPL No. 3702/LHR</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">OEP Expiry Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={oepExpiryDate} onChange={e => setOepExpiryDate(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">SECP Registration Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" value={secpDate} onChange={e => setSecpDate(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">NTN Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={ntnNumber} onChange={e => setNtnNumber(e.target.value)} required
                    placeholder="e.g. 1234567-8"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  <ArrowLeft size={14} /> Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#C9A227] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#b8911f] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? 'Submitting...' : <><span>Submit for Review</span><ArrowRight size={15} /></>}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-[#1B3060] mb-2 font-['Plus_Jakarta_Sans']">
                Application Submitted! 🎉
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                Your consultant profile is now <strong>pending review</strong>.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Our admin team will verify your credentials within 24 hours.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 text-left">
                <p className="text-amber-800 text-sm font-semibold mb-2">⏳ What happens next?</p>
                <ul className="text-amber-700 text-xs space-y-1.5">
                  <li>• Admin reviews your OEP license and SECP details</li>
                  <li>• You receive approval email within 24 hours</li>
                  <li>• Your profile goes live on VisaGate.pk</li>
                  <li>• Clients can find and book you</li>
                </ul>
              </div>
              <Link href="/dashboard/consultant"
                className="inline-flex items-center gap-2 bg-[#1B3060] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#243d7a] transition-colors">
                Go to Dashboard <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}