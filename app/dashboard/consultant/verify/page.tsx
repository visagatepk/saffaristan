'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  BadgeCheck, Clock, XCircle, FileText, Hash,
  Calendar, ArrowRight, Loader2, CheckCircle,
  AlertTriangle, ShieldCheck, ChevronLeft, Info
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
type VerificationStatus = 'unverified' | 'pending_verification' | 'verified' | 'rejected'

interface Profile {
  id: string
  full_name: string | null
  verification_status: VerificationStatus
  oep_license_number?: string | null
  oep_license_title?: string | null
  secp_registration_date?: string | null
  role: string | null
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
      {type === 'success'
        ? <CheckCircle size={17} className="flex-shrink-0" />
        : <AlertTriangle size={17} className="flex-shrink-0" />}
      {message}
    </div>
  )
}

// ── Status states ──────────────────────────────────────────────────────────
function PendingState({ name }: { name: string }) {
  return (
    <div className="text-center py-12 px-6 max-w-lg mx-auto">
      <div className="w-24 h-24 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center mx-auto mb-6">
        <Clock size={40} className="text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold text-[#1B3060] mb-3">Under Review</h2>
      <p className="text-gray-500 leading-relaxed mb-6">
        Thank you <span className="font-semibold text-[#1B3060]">{name || 'Consultant'}</span>! Your OEP license and SECP details have been submitted. Our team is verifying your credentials — this usually takes <span className="font-semibold">24–48 hours</span>.
      </p>
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-left space-y-3 mb-8">
        {[
          'You will be notified once verification is complete',
          'Your profile is live and visible to seekers during review',
          'The verified badge will appear automatically after approval',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <CheckCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-amber-800">{item}</span>
          </div>
        ))}
      </div>
      <Link
        href="/dashboard/consultant"
        className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#243d7a] transition-colors text-sm"
      >
        <ChevronLeft size={17} />
        Back to Dashboard
      </Link>
    </div>
  )
}

function VerifiedState({ name }: { name: string }) {
  return (
    <div className="text-center py-12 px-6 max-w-lg mx-auto">
      <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-6">
        <ShieldCheck size={40} className="text-green-500" />
      </div>
      <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-2 rounded-full mb-5">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Officially Verified
      </div>
      <h2 className="text-2xl font-bold text-[#1B3060] mb-3">
        You're Verified, {name?.split(' ')[0] || 'Consultant'}! 🎉
      </h2>
      <p className="text-gray-500 leading-relaxed mb-8">
        Your OEP license and SECP registration have been confirmed. The official <span className="font-semibold text-[#1B3060]">Verified badge</span> is now live on your public profile and all your service listings.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: <BadgeCheck size={20} className="text-[#C9A227]" />, label: 'Verified Badge Active' },
          { icon: <ShieldCheck size={20} className="text-green-500" />, label: 'OEP Confirmed' },
          { icon: <CheckCircle size={20} className="text-blue-500" />, label: 'SECP Confirmed' },
        ].map((item, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
            {item.icon}
            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/dashboard/consultant"
          className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#243d7a] transition-colors text-sm"
        >
          Go to Dashboard <ArrowRight size={17} />
        </Link>
        <Link
          href="/dashboard/consultant/settings"
          className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          Settings
        </Link>
      </div>
    </div>
  )
}

function RejectedState({ onResubmit }: { onResubmit: () => void }) {
  return (
    <div className="text-center py-12 px-6 max-w-lg mx-auto">
      <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mx-auto mb-6">
        <XCircle size={40} className="text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-[#1B3060] mb-3">Verification Not Approved</h2>
      <p className="text-gray-500 leading-relaxed mb-6">
        Unfortunately we could not verify your credentials with the details provided. This could be due to an incorrect license number, title mismatch, or registration date error.
      </p>
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-left mb-8">
        <p className="text-sm font-semibold text-red-700 mb-3">Common reasons for rejection:</p>
        <div className="space-y-2">
          {[
            'OEP license number entered incorrectly',
            'License title does not match OEP records',
            'SECP registration date is inaccurate',
            'License is expired or not currently active',
          ].map((reason, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              <span className="text-sm text-red-700">{reason}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onResubmit}
          className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#243d7a] transition-colors text-sm"
        >
          <FileText size={17} />
          Resubmit Credentials
        </button>
        <a
          href="mailto:visagate.pk@gmail.com"
          className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}

// ── Submission Form ────────────────────────────────────────────────────────
function VerificationForm({
  profileId,
  onSubmitted,
}: {
  profileId: string
  onSubmitted: () => void
}) {
  const supabase = createClient()

  const [oepNumber, setOepNumber] = useState('')
  const [oepTitle, setOepTitle] = useState('')
  const [secpDate, setSecpDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSubmit() {
    if (!oepNumber.trim()) { showToast('OEP License Number is required.', 'error'); return }
    if (!oepTitle.trim()) { showToast('OEP License Title is required.', 'error'); return }
    if (!secpDate) { showToast('SECP Registration Date is required.', 'error'); return }

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        oep_license_number: oepNumber.trim(),
        oep_license_title: oepTitle.trim(),
        secp_registration_date: secpDate,
        verification_status: 'pending_verification',
      })
      .eq('id', profileId)

    if (error) {
      showToast('Submission failed. Please try again.', 'error')
      setSaving(false)
      return
    }

    showToast('Credentials submitted successfully!', 'success')
    setTimeout(() => { onSubmitted() }, 1200)
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="max-w-2xl mx-auto">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3 mb-8">
          <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">How verification works</p>
            <p className="text-sm text-blue-700 leading-relaxed">
              Submit your OEP license details and SECP registration date. Our team manually cross-checks these with official records and adds your <span className="font-semibold">Verified badge</span> within 24–48 hours.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-7 py-6 border-b border-gray-100">
            <h2 className="font-bold text-[#1B3060] text-xl">Submit Your Credentials</h2>
            <p className="text-gray-400 text-sm mt-1">All fields are required for verification.</p>
          </div>

          <div className="px-7 py-7 space-y-6">

            {/* OEP License Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                OEP License Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Hash size={16} />
                </div>
                <input
                  type="text"
                  value={oepNumber}
                  onChange={e => setOepNumber(e.target.value)}
                  placeholder="e.g. OEP-12345"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B3060]/20 focus:border-[#1B3060] placeholder:text-gray-300 hover:border-gray-300 transition-all"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 ml-1">
                Your OEP (Overseas Employment Promoters) license number as issued by the Bureau of Emigration.
              </p>
            </div>

            {/* OEP License Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                OEP License Title <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <FileText size={16} />
                </div>
                <input
                  type="text"
                  value={oepTitle}
                  onChange={e => setOepTitle(e.target.value)}
                  placeholder="e.g. Immigration Consultant"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B3060]/20 focus:border-[#1B3060] placeholder:text-gray-300 hover:border-gray-300 transition-all"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 ml-1">
                The exact title shown on your OEP license certificate.
              </p>
            </div>

            {/* SECP Registration Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                SECP Registration Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  value={secpDate}
                  onChange={e => setSecpDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B3060]/20 focus:border-[#1B3060] hover:border-gray-300 transition-all"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 ml-1">
                The date your business was registered with the Securities &amp; Exchange Commission of Pakistan.
              </p>
            </div>

            {/* What you get */}
            <div className="bg-[#1B3060]/5 rounded-2xl p-5">
              <p className="text-sm font-semibold text-[#1B3060] mb-3">After verification you will get:</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {[
                  'Official Verified badge on your profile',
                  '3x higher client trust & conversion',
                  'Priority placement in search results',
                  'Access to premium platform features',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <BadgeCheck size={15} className="text-[#C9A227] flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By submitting, you confirm that all information provided is accurate and matches official government records. Providing false credentials may result in permanent account suspension.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#243d7a] transition-colors disabled:opacity-60 text-sm shadow-sm"
              >
                {saving
                  ? <><Loader2 size={17} className="animate-spin" /> Submitting…</>
                  : <><ShieldCheck size={17} /> Submit for Verification</>
                }
              </button>
              <Link
                href="/dashboard/consultant/settings"
                className="text-sm text-gray-400 hover:text-gray-600 font-medium px-4 py-3 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ConsultantVerifyPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  // Allow resubmission from rejected state
  const [forceShowForm, setForceShowForm] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, verification_status, oep_license_number, oep_license_title, secp_registration_date, role')
        .eq('id', user.id)
        .single()

      if (error || !data) { router.push('/login'); return }

      // Guard: only consultants
      if (data.role !== 'consultant') {
        router.push('/dashboard/seeker')
        return
      }

      setProfile(data as Profile)
      setLoading(false)
    }
    load()
  }, [])

  // After successful form submission — refresh profile state
  async function handleSubmitted() {
    if (!profile) return
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, verification_status, oep_license_number, oep_license_title, secp_registration_date, role')
      .eq('id', profile.id)
      .single()
    if (data) setProfile(data as Profile)
    setForceShowForm(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#1B3060]" size={36} />
            <p className="text-gray-400 text-sm">Loading verification status…</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const status = profile?.verification_status ?? 'unverified'
  const showForm = forceShowForm || status === 'unverified' || (status === 'rejected' && forceShowForm)

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">

        {/* ── Page header ── */}
        <div className="bg-[#1B3060] pt-16 pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Link
              href="/dashboard/consultant/settings"
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium mb-6 transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Settings
            </Link>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/20 border border-[#C9A227]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BadgeCheck size={24} className="text-[#C9A227]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Consultant Verification</h1>
                <p className="text-blue-200 text-sm">
                  Submit your OEP and SECP credentials to get your official Verified badge.
                </p>
              </div>
            </div>

            {/* Status pill */}
            <div className="mt-6">
              {status === 'unverified' && (
                <span className="inline-flex items-center gap-2 bg-gray-500/20 border border-gray-400/20 text-gray-300 text-xs font-semibold px-4 py-2 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Not Verified
                </span>
              )}
              {status === 'pending_verification' && (
                <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/20 text-amber-300 text-xs font-semibold px-4 py-2 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Pending Review
                </span>
              )}
              {status === 'verified' && (
                <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/20 text-green-300 text-xs font-semibold px-4 py-2 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Verified
                </span>
              )}
              {status === 'rejected' && (
                <span className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/20 text-red-300 text-xs font-semibold px-4 py-2 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Not Approved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10 pb-24">

          {/* Progress steps */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-0">
              {[
                { label: 'Submit Details', done: status !== 'unverified' },
                { label: 'Under Review', done: status === 'verified' || status === 'rejected' },
                { label: 'Verified', done: status === 'verified' },
              ].map((step, i, arr) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      step.done
                        ? 'bg-[#1B3060] text-white'
                        : status === 'rejected' && i === 2
                          ? 'bg-red-100 text-red-500 border-2 border-red-200'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.done ? <CheckCircle size={15} /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${step.done ? 'text-[#1B3060]' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 mb-5 rounded ${step.done ? 'bg-[#1B3060]' : 'bg-gray-100'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* State-based content */}
          {(status === 'unverified' || showForm) && (
            <VerificationForm profileId={profile!.id} onSubmitted={handleSubmitted} />
          )}
          {status === 'pending_verification' && !forceShowForm && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
              <PendingState name={profile?.full_name ?? ''} />
            </div>
          )}
          {status === 'verified' && !forceShowForm && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
              <VerifiedState name={profile?.full_name ?? ''} />
            </div>
          )}
          {status === 'rejected' && !forceShowForm && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
              <RejectedState onResubmit={() => setForceShowForm(true)} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}