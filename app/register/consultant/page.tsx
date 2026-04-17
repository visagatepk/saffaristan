'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Lock, Phone, Building2,
  MapPin, Briefcase, Upload, CheckCircle,
  AlertCircle, Eye, EyeOff, ArrowRight, ArrowLeft
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import GoogleAuthButton from '@/components/GoogleAuthButton'

const STEPS = ['Basic Info', 'Business Info', 'Upload Docs', 'Complete']

const CITIES = [
  'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi',
  'Peshawar', 'Quetta', 'Multan', 'Faisalabad',
  'Hyderabad', 'Sargodha'
]

export default function ConsultantRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    displayName: '',
    businessName: '',
    city: '',
    address: '',
    experience: '',
    beoeUrl: '',
    ntnUrl: '',
    cnicFrontUrl: '',
    cnicBackUrl: '',
  })

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // ─── Step 1 — Create auth account ───────────────────────────
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role: 'consultant',
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setUserId(data.user.id)
      await supabase
        .from('profiles')
        .update({
          role: 'consultant',
          full_name: form.fullName,
          phone: form.phone,
        })
        .eq('user_id', data.user.id)
    }

    setLoading(false)
    setStep(1)
  }

  // ─── Step 2 — Save business info ────────────────────────────
  const handleStep2 = async (e: React.FormEvent) => {
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
      })
      .eq('user_id', userId)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep(2)
  }

  // ─── File upload to Supabase Storage ────────────────────────
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    folder: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${folder}/${userId}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError
      update(field, path)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 3 — Save document URLs ────────────────────────────
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.beoeUrl || !form.ntnUrl || !form.cnicFrontUrl || !form.cnicBackUrl) {
      setError('Please upload all 4 required documents before submitting.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        beoe_certificate_url: form.beoeUrl,
        ntn_certificate_url: form.ntnUrl,
        cnic_front_url: form.cnicFrontUrl,
        cnic_back_url: form.cnicBackUrl,
        verification_status: 'pending_verification',
      })
      .eq('user_id', userId)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep(3)
  }

  // ─── Reusable components ─────────────────────────────────────
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold transition-all ${
              i < step
                ? 'bg-green-500 text-white'
                : i === step
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-10 sm:w-16 mx-1 transition-colors ${
                i < step ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`font-body text-xs ${
              i === step ? 'text-navy font-semibold' : 'text-gray-400'
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  )

  const InputField = ({
    label, icon: Icon, type = 'text', value, onChange,
    placeholder, required = false, ...rest
  }: any) => (
    <div>
      <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...rest}
          className="font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
        />
      </div>
    </div>
  )

  const FileField = ({ label, urdu, field, folder, uploaded }: any) => (
    <div>
      <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
        {label}{' '}
        <span className="text-red-400">*</span>
        <span className="font-urdu text-gold text-xs ml-2">{urdu}</span>
      </label>
      <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
        uploaded
          ? 'border-green-400 bg-green-50'
          : 'border-gray-200 hover:border-navy/40 bg-gray-50'
      }`}>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, field, folder)}
          className="hidden"
          disabled={loading}
        />
        {uploaded ? (
          <>
            <CheckCircle size={18} className="text-green-500 shrink-0" />
            <span className="font-body text-sm text-green-700 font-medium">
              Uploaded successfully
            </span>
          </>
        ) : (
          <>
            <Upload size={18} className="text-gray-400 shrink-0" />
            <div>
              <p className="font-body text-sm text-gray-600">
                {loading ? 'Uploading...' : 'Click to upload'}
              </p>
              <p className="font-body text-xs text-gray-400">
                PDF, JPG or PNG · Max 5MB
              </p>
            </div>
          </>
        )}
      </label>
    </div>
  )

  const ErrorBox = () => error ? (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-body px-4 py-3 rounded-xl mb-5">
      <AlertCircle size={14} className="shrink-0" />
      {error}
    </div>
  ) : null

  // ─── Page render ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">

      {/* Logo */}
      <Link href="/" className="mb-8">
        <Image
          src="/logo.png"
          alt="VisaGate.pk"
          width={150}
          height={38}
          className="h-9 w-auto"
        />
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-lg shadow-sm">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/register"
            className="font-body text-xs text-gray-400 hover:text-navy transition-colors"
          >
            ← Back
          </Link>
          <span className="font-body text-xs text-gray-300">|</span>
          <span className="font-body text-xs text-gray-400">
            Consultant Registration
          </span>
        </div>

        <ProgressBar />
        <ErrorBox />

        {/* ── STEP 1 — Basic Info ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-navy text-xl mb-0.5">
                Basic Information
              </h2>
              <p className="font-urdu text-gold text-sm">بنیادی معلومات</p>
            </div>

            {/* Google signup */}
            <GoogleAuthButton
              label="Sign up with Google"
              role="consultant"
            />

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="font-body text-xs text-gray-400">
                or fill manually
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Manual form */}
            <form onSubmit={handleStep1} className="space-y-4">

              <InputField
                label="Full Name"
                icon={User}
                value={form.fullName}
                onChange={(e: any) => update('fullName', e.target.value)}
                placeholder="Muhammad Ali"
                required
              />

              <InputField
                label="Email Address"
                icon={Mail}
                type="email"
                value={form.email}
                onChange={(e: any) => update('email', e.target.value)}
                placeholder="you@agency.com"
                required
              />

              <InputField
                label="Phone Number"
                icon={Phone}
                type="tel"
                value={form.phone}
                onChange={(e: any) => update('phone', e.target.value)}
                placeholder="+92 300 1234567"
                required
              />

              {/* Password with toggle */}
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="font-body w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="font-heading font-bold w-full bg-navy hover:bg-navy-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : (
                  <>Continue <ArrowRight size={14} /></>
                )}
              </button>

            </form>
          </div>
        )}

        {/* ── STEP 2 — Business Info ── */}
        {step === 1 && (
          <form onSubmit={handleStep2} className="space-y-4">

            <div>
              <h2 className="font-heading font-bold text-navy text-xl mb-0.5">
                Business Information
              </h2>
              <p className="font-urdu text-gold text-sm">کاروباری معلومات</p>
            </div>

            <InputField
              label="Display Name (shown publicly)"
              icon={User}
              value={form.displayName}
              onChange={(e: any) => update('displayName', e.target.value)}
              placeholder="Ahmed Hassan"
              required
            />

            <InputField
              label="Agency / Business Name"
              icon={Building2}
              value={form.businessName}
              onChange={(e: any) => update('businessName', e.target.value)}
              placeholder="Al-Noor Immigration Services"
              required
            />

            {/* City dropdown */}
            <div>
              <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                City
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  required
                  className="font-body w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all appearance-none bg-white"
                >
                  <option value="">Select your city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <InputField
              label="Office Address"
              icon={MapPin}
              value={form.address}
              onChange={(e: any) => update('address', e.target.value)}
              placeholder="Office 5, Blue Area, Islamabad"
              required
            />

            <InputField
              label="Years of Experience"
              icon={Briefcase}
              type="number"
              value={form.experience}
              onChange={(e: any) => update('experience', e.target.value)}
              placeholder="5"
              min="0"
              max="50"
              required
            />

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="font-heading font-bold flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="font-heading font-bold flex-1 bg-navy hover:bg-navy-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : (
                  <>Continue <ArrowRight size={14} /></>
                )}
              </button>
            </div>

          </form>
        )}

        {/* ── STEP 3 — Upload Documents ── */}
        {step === 2 && (
          <form onSubmit={handleStep3} className="space-y-5">

            <div>
              <h2 className="font-heading font-bold text-navy text-xl mb-0.5">
                Verification Documents
              </h2>
              <p className="font-urdu text-gold text-sm mb-1">
                تصدیقی دستاویزات
              </p>
            </div>

            {/* Security notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="font-body text-xs text-blue-700">
                🔒 All documents are encrypted and only visible to admins for verification.
              </p>
            </div>

            <FileField
              label="BEOE Certificate"
              urdu="بیوی سرٹیفکیٹ"
              field="beoeUrl"
              folder="beoe"
              uploaded={!!form.beoeUrl}
            />
            <FileField
              label="NTN Certificate"
              urdu="این ٹی این"
              field="ntnUrl"
              folder="ntn"
              uploaded={!!form.ntnUrl}
            />
            <FileField
              label="CNIC Front"
              urdu="شناختی کارڈ (سامنے)"
              field="cnicFrontUrl"
              folder="cnic"
              uploaded={!!form.cnicFrontUrl}
            />
            <FileField
              label="CNIC Back"
              urdu="شناختی کارڈ (پیچھے)"
              field="cnicBackUrl"
              folder="cnic"
              uploaded={!!form.cnicBackUrl}
            />

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-heading font-bold flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="font-heading font-bold flex-1 bg-gold hover:bg-gold-dark text-white py-3 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Uploading...' : (
                  <>Submit <ArrowRight size={14} /></>
                )}
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

            <h2 className="font-heading font-bold text-navy text-2xl mb-2">
              Application Submitted!
            </h2>
            <p className="font-urdu text-gold text-base mb-4">
              درخواست جمع ہو گئی
            </p>
            <p className="font-body text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              Your documents are under review. You'll receive an email within
              24–48 hours once your profile is verified.
            </p>

            {/* Status notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="font-body text-xs text-amber-700 font-semibold mb-1">
                ⏳ Pending Verification
              </p>
              <p className="font-body text-xs text-amber-600">
                Our team manually verifies BEOE & NTN certificates
                to ensure platform quality and protect visa seekers.
              </p>
            </div>

            <Link
              href="/login"
              className="font-heading font-bold text-sm bg-navy hover:bg-navy-dark text-white px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
            >
              Go to Login <ArrowRight size={14} />
            </Link>

          </div>
        )}

        {/* Sign in link */}
        {step < 3 && (
          <p className="font-body text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-navy hover:text-gold transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}

      </div>
    </div>
  )
}