'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  User, MapPin, Briefcase, Building2, Phone,
  CheckCircle, AlertCircle, ArrowRight, ArrowLeft,
  Hash, FileText, Calendar, Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STEPS = ['Business Info', 'Verification', 'Complete']

const CITIES = [
  'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi',
  'Peshawar', 'Quetta', 'Multan', 'Faisalabad',
  'Hyderabad', 'Sargodha'
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [skipped, setSkipped] = useState(false)

  const [form, setForm] = useState({
    displayName: '',
    businessName: '',
    city: '',
    address: '',
    experience: '',
    phone: '',
    oepLicenseNumber: '',
    oepLicenseTitle: '',
    secpDate: '',
  })

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      setUserEmail(user.email || '')
      setUserName(user.user_metadata?.full_name || '')
      if (user.user_metadata?.full_name) {
        update('displayName', user.user_metadata.full_name)
      }
    }
    getUser()
  }, [])

  // Step 1 — Business Info
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.displayName,
        business_name: form.businessName,
        city: form.city,
        office_address: form.address,
        years_experience: parseInt(form.experience) || 0,
        phone: form.phone,
        role: 'consultant',
      })
      .eq('user_id', userId)
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    setStep(1)
  }

  // Step 2 — Submit verification
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const oepFormat = /^OEPL\s*No\.\s*\d{1,6}\/[A-Z]{2,5}$/i
    if (!oepFormat.test(form.oepLicenseNumber.trim())) {
      setError('Format must be: OEPL No. 3702/LHR')
      return
    }
    if (!form.oepLicenseTitle.trim()) {
      setError('Please enter your OEP License Title')
      return
    }
    if (!form.secpDate) {
      setError('Please enter your SECP Registration Date')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        oep_license_number: form.oepLicenseNumber.trim().toUpperCase(),
        oep_license_title: form.oepLicenseTitle.trim(),
        secp_registration_date: form.secpDate,
        verification_status: 'pending_verification',
      })
      .eq('user_id', userId)
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    setSkipped(false)
    setStep(2)
  }

  // Step 2 — Skip verification
  const handleSkip = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: 'unverified' })
      .eq('user_id', userId)
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    setSkipped(true)
    setStep(2)
  }

  const ProgressBar = () => (
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
              <div className={`h-px w-24 sm:w-36 mx-1 transition-colors ${
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

  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
      {text} {required && <span className="text-red-400">*</span>}
    </label>
  )

  const inputClass = "font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">

      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="VisaGate.pk" width={150} height={38} className="h-9 w-auto" />
      </Link>

      {userName && (
        <div className="bg-navy-light border border-navy/20 rounded-xl px-5 py-3 mb-6 flex items-center gap-3 max-w-lg w-full">
          <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center text-white font-heading font-bold text-sm shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-heading font-semibold text-navy text-sm">Welcome, {userName}!</p>
            <p className="font-body text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-lg shadow-sm">

        <div className="mb-6">
          <h1 className="font-heading font-bold text-navy text-xl mb-1">
            Complete Your Consultant Profile
          </h1>
          <p className="font-body text-xs text-gray-400">
            Required before your listing goes live on VisaGate.pk
          </p>
        </div>

        <div className="h-px bg-gray-100 mb-6" />
        <ProgressBar />

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-body px-4 py-3 rounded-xl mb-5">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── STEP 1 — Business Info ── */}
        {step === 0 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <h2 className="font-heading font-bold text-navy text-lg mb-4">
              Business Information
            </h2>

            <div>
              <Label text="Display Name" required />
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.displayName}
                  onChange={(e) => update('displayName', e.target.value)}
                  placeholder="Ahmed Hassan" required className={inputClass} />
              </div>
              <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                This name is shown publicly on your listing
              </p>
            </div>

            <div>
              <Label text="Agency / Business Name" required />
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  placeholder="Al-Noor Immigration Services" required className={inputClass} />
              </div>
            </div>

            <div>
              <Label text="Phone Number" required />
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+92 300 1234567" required className={inputClass} />
              </div>
            </div>

            <div>
              <Label text="City" required />
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  required
                  className="font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all appearance-none bg-white">
                  <option value="">Select your city</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label text="Office Address" required />
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  placeholder="Office 5, Blue Area, Islamabad" required className={inputClass} />
              </div>
            </div>

            <div>
              <Label text="Years of Experience" required />
              <div className="relative">
                <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" value={form.experience}
                  onChange={(e) => update('experience', e.target.value)}
                  placeholder="5" min="0" max="50" required className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="font-heading font-bold w-full bg-navy hover:bg-navy-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {loading ? 'Saving...' : <>Save & Continue <ArrowRight size={14} /></>}
            </button>
          </form>
        )}

        {/* ── STEP 2 — Verification ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-navy text-lg mb-1">
                License Verification
              </h2>
              <p className="font-body text-xs text-gray-500">
                Verified consultants get a green badge and 3x more client trust.
              </p>
            </div>

            {/* Skip banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-xs font-semibold text-amber-800 mb-0.5">
                  Don't have your documents ready?
                </p>
                <p className="font-body text-xs text-amber-600 leading-relaxed">
                  No problem — skip for now and complete verification later from your dashboard. Your profile will show as <strong>Unverified</strong> until then.
                </p>
              </div>
            </div>

            <form onSubmit={handleStep2} className="space-y-4">

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="font-body text-xs text-blue-800 font-semibold mb-1">
                  Why we verify
                </p>
                <p className="font-body text-xs text-blue-600 leading-relaxed">
                  OEP and SECP details ensure all listed consultants are legitimate and protect visa seekers from fraud.
                </p>
              </div>

              {/* OEP License Number */}
              <div>
                <Label text="OEP License Number" required />
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.oepLicenseNumber}
                    onChange={(e) => update('oepLicenseNumber', e.target.value.toUpperCase())}
                    placeholder="OEPL No. 3702/LHR"
                    required
                    className={`${inputClass} font-mono tracking-wide`}
                  />
                </div>
                <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                  Format: <span className="font-mono font-semibold text-navy">OEPL No. 3702/LHR</span>
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    ['ISB', 'Islamabad'], ['RWP', 'Rawalpindi'],
                    ['LHR', 'Lahore'], ['KHI', 'Karachi'],
                    ['SKT', 'Sialkot'], ['FSB', 'Faisalabad'],
                    ['MLT', 'Multan'], ['PEW', 'Peshawar'],
                  ].map(([code, city]) => (
                    <span key={code} className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {code} = {city}
                    </span>
                  ))}
                </div>
              </div>

              {/* OEP License Title */}
              <div>
                <Label text="OEP License Title" required />
                <div className="relative">
                  <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.oepLicenseTitle}
                    onChange={(e) => update('oepLicenseTitle', e.target.value)}
                    placeholder="Al-Ansar Manpower and Recruiting Agency"
                    required
                    className={inputClass}
                  />
                </div>
                <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                  As it appears on your OEP certificate
                </p>
              </div>

              {/* SECP Registration Date */}
              <div>
                <Label text="Date of SECP Registration" required />
                <div className="relative">
                  <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={form.secpDate}
                    onChange={(e) => update('secpDate', e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className={inputClass}
                  />
                </div>
                <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                  Date shown on your SECP registration certificate
                </p>
              </div>

              {/* Review summary */}
              {form.oepLicenseNumber && form.oepLicenseTitle && form.secpDate && (
                <div className="bg-navy-light border border-navy/20 rounded-xl p-4 space-y-2.5">
                  <p className="font-heading font-semibold text-navy text-xs mb-2">Review your details</p>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-xs text-gray-500">OEP Number</span>
                    <span className="font-mono font-bold text-navy text-xs bg-white px-2 py-0.5 rounded">
                      {form.oepLicenseNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-body text-xs text-gray-500 shrink-0">OEP Title</span>
                    <span className="font-body text-navy text-xs text-right">{form.oepLicenseTitle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-xs text-gray-500">SECP Date</span>
                    <span className="font-body font-semibold text-navy text-xs">
                      {new Date(form.secpDate).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setStep(0); setError('') }}
                  className="font-heading font-bold flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <button type="submit" disabled={loading}
                  className="font-heading font-bold flex-1 bg-gold hover:bg-gold-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                  {loading ? 'Submitting...' : <>Submit <ArrowRight size={14} /></>}
                </button>
              </div>
            </form>

            {/* Skip button */}
            <div className="text-center pt-1">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="font-body text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors disabled:opacity-50"
              >
                {loading ? 'Please wait...' : 'Skip for now — I\'ll verify later from my dashboard'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Success ── */}
        {step === 2 && (
          <div className="text-center py-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border-2 ${
              skipped
                ? 'bg-amber-50 border-amber-300'
                : 'bg-gold/10 border-gold/30'
            }`}>
              {skipped
                ? <Clock size={32} className="text-amber-500" />
                : <CheckCircle size={32} className="text-gold" />
              }
            </div>

            <h2 className="font-heading font-bold text-navy text-2xl mb-2">
              {skipped ? 'Profile Created!' : 'Profile Submitted!'}
            </h2>

            <p className="font-body text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              {skipped
                ? 'Your profile is live but marked as Unverified. Complete your OEP & SECP verification from your dashboard to get the green Verified badge.'
                : 'Your OEP and SECP details are under review. You\'ll receive an email within 24–48 hours once verified.'
              }
            </p>

            {skipped ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5 text-left space-y-3">
                <p className="font-heading font-semibold text-amber-800 text-xs mb-2">
                  Complete verification later to:
                </p>
                {[
                  'Get the green Verified badge on your profile',
                  'Appear higher in consultant search results',
                  'Build 3x more trust with visa seekers',
                  'Unlock full platform features',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-heading font-bold text-amber-700 text-xs">{i + 1}</span>
                    </div>
                    <p className="font-body text-xs text-amber-700">{text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-5 text-left space-y-3">
                <p className="font-heading font-semibold text-navy text-xs mb-2">What happens next?</p>
                {[
                  'Our team verifies your OEP license number',
                  'SECP registration date is cross-checked',
                  'You receive email confirmation within 48hrs',
                  'Your profile goes live on VisaGate.pk',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-navy-light rounded-full flex items-center justify-center shrink-0">
                      <span className="font-heading font-bold text-navy text-xs">{i + 1}</span>
                    </div>
                    <p className="font-body text-xs text-gray-500">{text}</p>
                  </div>
                ))}
              </div>
            )}

            <Link href="/dashboard/consultant"
              className="font-heading font-bold text-sm bg-navy hover:bg-navy-dark text-white px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}