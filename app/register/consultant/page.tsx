'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold transition-all ${
              i < step ? 'bg-green-500 text-white' :
              i === step ? 'bg-navy text-white' :
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
          <span key={s} className={`font-body text-xs ${
            i === step ? 'text-navy font-semibold' : 'text-gray-400'
          }`}>{s}</span>
        ))}
      </div>
    </div>
  )
}

function ErrorBox({ error }: { error: string }) {
  if (!error) return null
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-body px-4 py-3 rounded-xl mb-5">
      <AlertCircle size={14} className="shrink-0" />
      {error}
    </div>
  )
}

export default function ConsultantRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step 1
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  // Step 2
  const [displayName, setDisplayName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [experience, setExperience] = useState('')

  // Step 3
  const [oepLicenseNumber, setOepLicenseNumber] = useState('')
  const [oepExpiryDate, setOepExpiryDate] = useState('')
  const [secpDate, setSecpDate] = useState('')
  const [ntnNumber, setNtnNumber] = useState('')

  const inputClass = "font-body w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
  const iconInputClass = `${inputClass} pl-10`

  // ── Step 1 ───────────────────────────────────────────────
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'consultant' } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      setUserId(data.user.id)
      await supabase.from('profiles').update({
        role: 'consultant',
        full_name: fullName,
        phone,
      }).eq('user_id', data.user.id)
    }
    setLoading(false)
    setStep(1)
  }

  // ── Step 2 ───────────────────────────────────────────────
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      business_name: businessName,
      city,
      office_address: address,
      years_experience: parseInt(experience) || 0,
    }).eq('user_id', userId)
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    setStep(2)
  }

  // ── Step 3 ───────────────────────────────────────────────
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
 const oepFormat = /^OEPL\s*No\.\s*\d{1,6}\/[A-Z]{2,5}$/i
if (!oepFormat.test(oepLicenseNumber.trim())) {
  setError('Format must be: OEPL No. 3702/LHR')
  return
}
    if (!oepExpiryDate || !secpDate || !ntnNumber.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      oep_license_number: oepLicenseNumber.trim().toUpperCase(),
      oep_expiry_date: oepExpiryDate,
      secp_registration_date: secpDate,
      ntn_number: ntnNumber.trim(),
      verification_status: 'pending_verification',
    }).eq('user_id', userId)
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    setStep(3)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">

      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="VisaGate.pk" width={150} height={38} className="h-9 w-auto" />
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-lg shadow-sm">

        <div className="flex items-center gap-2 mb-6">
          <Link href="/register" className="font-body text-xs text-gray-400 hover:text-navy transition-colors">
            ← Back
          </Link>
          <span className="font-body text-xs text-gray-300">|</span>
          <span className="font-body text-xs text-gray-400">Consultant Registration</span>
        </div>

        <StepIndicator step={step} />
        <ErrorBox error={error} />

        {/* ── STEP 1 — Basic Info ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-navy text-xl mb-0.5">Basic Information</h2>
              <p className="font-body text-gray-400 text-xs">Create your consultant account</p>
            </div>

            <GoogleAuthButton label="Sign up with Google" role="consultant" />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="font-body text-xs text-gray-400">or fill manually</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muhammad Ali" required autoComplete="name" className={iconInputClass} />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.com" required autoComplete="email" className={iconInputClass} />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567" required autoComplete="tel" className={iconInputClass} />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" required minLength={8}
                    autoComplete="new-password"
                    className={`${iconInputClass} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="font-heading font-bold w-full bg-navy hover:bg-navy-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                {loading ? 'Please wait...' : <>Continue <ArrowRight size={14} /></>}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2 — Business Info ── */}
        {step === 1 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <div>
              <h2 className="font-heading font-bold text-navy text-xl mb-0.5">Business Information</h2>
              <p className="font-body text-gray-400 text-xs">Tell seekers about your agency</p>
            </div>

            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Display Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ahmed Hassan" required autoComplete="off" className={iconInputClass} />
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Agency / Business Name</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Al-Noor Immigration Services" required autoComplete="organization"
                  className={iconInputClass} />
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">City</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={city} onChange={(e) => setCity(e.target.value)} required
                  className="font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all appearance-none bg-white">
                  <option value="">Select your city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Office Address</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="Office 5, Blue Area, Islamabad" required autoComplete="street-address"
                  className={iconInputClass} />
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Years of Experience</label>
              <div className="relative">
                <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)}
                  placeholder="5" min="0" max="50" required className={iconInputClass} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(0)}
                className="font-heading font-bold flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
              <button type="submit" disabled={loading}
                className="font-heading font-bold flex-1 bg-navy hover:bg-navy-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                {loading ? 'Saving...' : <>Continue <ArrowRight size={14} /></>}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3 — License Verification ── */}
        {step === 2 && (
          <form onSubmit={handleStep3} className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-navy text-xl mb-0.5">License Verification</h2>
              <p className="font-body text-gray-400 text-xs">Enter your official registration details</p>
            </div>

            {/* Info notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-2.5">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <p className="font-body text-xs text-blue-700 leading-relaxed">
                Information is securely stored and only visible to admins for verification. We verify your credentials against BEOE and SECP records.
              </p>
            </div>

            {/* OEP License Number */}
            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                BEOE / OEP License Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold" />
                <input
                  type="text"
                  value={oepLicenseNumber}
                  onChange={(e) => setOepLicenseNumber(e.target.value.toUpperCase())}
                 placeholder="OEPL No. 3702/LHR"
                  required
                  autoComplete="off"
                  className={`${iconInputClass} font-mono tracking-wide`}
                />
              </div>
              <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                Format: <span className="font-mono font-semibold text-navy">OEPL No. 3702/LHR</span>

              </p>
            </div>

            {/* OEP Expiry Date */}
            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                OEP License Expiry Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={oepExpiryDate}
                  onChange={(e) => setOepExpiryDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className={iconInputClass}
                />
              </div>
              <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                License must be currently valid
              </p>
            </div>

            {/* SECP Registration Date */}
            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                SECP Registration Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={secpDate}
                  onChange={(e) => setSecpDate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className={iconInputClass}
                />
              </div>
              <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                Date on your SECP registration certificate
              </p>
            </div>

            {/* NTN Number */}
            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                NTN Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={ntnNumber}
                  onChange={(e) => setNtnNumber(e.target.value)}
                  placeholder="1234567-8"
                  required
                  autoComplete="off"
                  className={`${iconInputClass} font-mono`}
                />
              </div>
              <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                National Tax Number from FBR
              </p>
            </div>

            {/* Live review card */}
            {oepLicenseNumber && oepExpiryDate && secpDate && ntnNumber && (
              <div className="bg-navy-light border border-navy/20 rounded-xl p-4 space-y-2.5">
                <p className="font-heading font-semibold text-navy text-xs flex items-center gap-1.5 mb-3">
                  <CheckCircle size={13} className="text-green-500" />
                  Review before submitting
                </p>
                {[
                  { label: 'OEP Number', value: oepLicenseNumber },
                  { label: 'OEP Expiry', value: new Date(oepExpiryDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'SECP Date', value: new Date(secpDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'NTN', value: ntnNumber },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="font-body text-xs text-gray-500">{item.label}</span>
                    <span className="font-mono font-semibold text-navy text-xs bg-white px-2 py-0.5 rounded">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)}
                className="font-heading font-bold flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
              <button type="submit" disabled={loading}
                className="font-heading font-bold flex-1 bg-gold hover:bg-gold-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                {loading ? 'Submitting...' : <>Submit <ArrowRight size={14} /></>}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4 — Success ── */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gold/10 border-2 border-gold/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-gold" />
            </div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-2">Application Submitted!</h2>
            <p className="font-body text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              Your license details are under review. You'll receive an email within 24–48 hours once verified.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="font-body text-xs text-amber-700 font-semibold mb-1">⏳ Pending Verification</p>
              <p className="font-body text-xs text-amber-600">
                Our team verifies OEP and SECP credentials to maintain platform quality.
              </p>
            </div>
            <Link href="/login"
              className="font-heading font-bold text-sm bg-navy hover:bg-navy-dark text-white px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
              Go to Login <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {step < 3 && (
          <p className="font-body text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-navy hover:text-gold transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}