'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar, Clock, User, Mail, Phone,
  MessageSquare, CheckCircle, AlertCircle,
  MapPin, BadgeCheck, ArrowLeft, Globe
} from 'lucide-react'

const VISA_TYPES = [
  'Student Visa', 'Work Permit', 'Visit Visa', 'Family Visa',
  'Business Visa', 'PR & Immigration', 'Umrah Visa', 'Other',
]

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
]

export default function BookAppointmentPage() {
  const router = useRouter()
  const params = useParams()
  const consultantId = params.consultantId as string

  const [consultant, setConsultant] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  // Form fields
  const [seekerName, setSeekerName] = useState('')
  const [seekerEmail, setSeekerEmail] = useState('')
  const [seekerPhone, setSeekerPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [visaType, setVisaType] = useState('')
  const [destination, setDestination] = useState('')
  const [message, setMessage] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/login?redirect=/book/${consultantId}`); return }
      setCurrentUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setSeekerName(profile.full_name || '')
        setSeekerEmail(user.email || '')
        setSeekerPhone(profile.phone || '')
      }

      const { data: cons } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', consultantId)
        .single()

      setConsultant(cons)
      setLoading(false)
    }
    load()
  }, [consultantId, router])

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!seekerName || !seekerEmail || !seekerPhone) {
        setError('Please fill in all required fields')
        return
      }
    }
    if (step === 2) {
      if (!subject || !visaType) {
        setError('Please fill in subject and visa type')
        return
      }
    }
    if (step === 3) {
      if (!preferredDate || !preferredTime) {
        setError('Please select a preferred date and time')
        return
      }
    }
    setStep(step + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('appointments')
      .insert({
        seeker_id: currentUser.id,
        consultant_id: consultantId,
        seeker_name: seekerName,
        seeker_email: seekerEmail,
        seeker_phone: seekerPhone,
        consultant_name: consultant?.display_name || consultant?.full_name,
        subject,
        visa_type: visaType,
        destination,
        message,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        status: 'pending',
      })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  // Get min date (tomorrow)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  const inputClass = "font-body w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
  const labelClass = "font-body text-xs font-medium text-gray-700 block mb-1.5"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-2">
              Appointment Requested!
            </h2>
            <p className="font-urdu text-gold text-lg mb-5">اپوائنٹمنٹ کی درخواست بھیج دی گئی</p>
            <p className="font-body text-gray-500 text-sm leading-relaxed mb-3">
              Your appointment request has been sent to{' '}
              <strong className="text-navy">{consultant?.display_name}</strong>.
            </p>
            <p className="font-body text-gray-400 text-xs leading-relaxed mb-8">
              The consultant will review your request and confirm within <strong>24–48 hours</strong>. You will be notified via email and in your dashboard.
            </p>
            <div className="bg-navy-light rounded-2xl p-4 mb-8 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-body text-gray-500">Consultant</span>
                <span className="font-heading font-bold text-navy">{consultant?.display_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-body text-gray-500">Subject</span>
                <span className="font-heading font-bold text-navy">{subject}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-body text-gray-500">Date</span>
                <span className="font-heading font-bold text-navy">
                  {new Date(preferredDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-body text-gray-500">Time</span>
                <span className="font-heading font-bold text-navy">{preferredTime}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/seeker/appointments"
                className="flex-1 font-heading font-bold text-sm text-white py-3 rounded-xl hover:opacity-90 transition-all text-center"
                style={{ background: 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' }}>
                View My Appointments
              </Link>
              <Link href="/consultants"
                className="flex-1 font-heading font-bold text-sm text-navy border border-navy py-3 rounded-xl hover:bg-navy hover:text-white transition-all text-center">
                Browse More
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-10 text-center">
          <h1 className="font-heading font-extrabold text-white text-2xl lg:text-3xl mb-2">
            Book a Consultation
          </h1>
          <p className="font-urdu text-gold/80 text-lg mb-3">مشاورت بک کریں</p>
          <p className="font-body text-white/60 text-sm">
            Schedule a discussion with {consultant?.display_name}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Consultant card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-xl bg-navy flex items-center justify-center text-white font-heading font-bold text-xl shrink-0">
                  {(consultant?.display_name || 'VC').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-navy text-base">
                    {consultant?.display_name}
                  </h3>
                  {consultant?.business_name && (
                    <p className="font-body text-gray-400 text-xs">{consultant.business_name}</p>
                  )}
                  {consultant?.is_verified && (
                    <div className="flex items-center gap-1 mt-1">
                      <BadgeCheck size={12} className="text-green-500" />
                      <span className="font-body text-green-600 text-xs">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {consultant?.city && (
                <div className="flex items-center gap-2 text-xs font-body text-gray-400 mb-3">
                  <MapPin size={12} className="text-gold" />
                  {consultant.city}
                </div>
              )}

              {consultant?.bio && (
                <p className="font-body text-gray-500 text-xs leading-relaxed mb-4 line-clamp-3">
                  {consultant.bio}
                </p>
              )}

              <div className="bg-navy-light rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-body text-gray-500">Duration</span>
                  <span className="font-heading font-bold text-navy">30 minutes</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-body text-gray-500">Type</span>
                  <span className="font-heading font-bold text-navy">Online / Phone</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-body text-gray-500">Cost</span>
                  <span className="font-heading font-bold text-green-600">Free to Request</span>
                </div>
              </div>

              <Link href={`/consultants/${consultantId}`}
                className="flex items-center gap-2 font-body text-xs text-gray-400 hover:text-navy transition-colors mt-4">
                <ArrowLeft size={12} /> Back to profile
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">

            {/* Progress */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { num: 1, label: 'Your Details' },
                { num: 2, label: 'Consultation Info' },
                { num: 3, label: 'Date & Time' },
                { num: 4, label: 'Review' },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-heading font-bold text-xs shrink-0 transition-all ${
                      step > s.num ? 'bg-green-500 text-white' :
                      step === s.num ? 'bg-navy text-white' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {step > s.num ? <CheckCircle size={13} /> : s.num}
                    </div>
                    <span className={`font-body text-xs hidden sm:block ${step === s.num ? 'text-navy font-medium' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-0.5 rounded-full mx-1 transition-all ${
                      step > s.num ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
                <h2 className="font-heading font-bold text-navy text-base">
                  {step === 1 && '👤 Your Contact Details'}
                  {step === 2 && '📋 Consultation Details'}
                  {step === 3 && '📅 Preferred Date & Time'}
                  {step === 4 && '✅ Review & Confirm'}
                </h2>
                <p className="font-body text-gray-400 text-xs mt-0.5">
                  {step === 1 && 'How the consultant can reach you'}
                  {step === 2 && 'Tell us what you need help with'}
                  {step === 3 && 'Select your preferred slot'}
                  {step === 4 && 'Check everything before sending'}
                </p>
              </div>

              <div className="p-8">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl mb-5">
                    <AlertCircle size={14} className="shrink-0" />{error}
                  </div>
                )}

                {/* ── Step 1 ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={seekerName} onChange={e => setSeekerName(e.target.value)}
                          placeholder="Muhammad Ali" required className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" value={seekerEmail} onChange={e => setSeekerEmail(e.target.value)}
                          placeholder="you@example.com" required className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Phone / WhatsApp Number *</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" value={seekerPhone} onChange={e => setSeekerPhone(e.target.value)}
                          placeholder="+92 300 1234567" required className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="font-body text-amber-700 text-xs leading-relaxed">
                        📞 The consultant will contact you on WhatsApp or phone to confirm. Make sure your number is active.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Step 2 ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Subject / Topic *</label>
                      <div className="relative">
                        <MessageSquare size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                          placeholder="e.g. UK Student Visa Guidance"
                          required className={`${inputClass} pl-10`} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Visa Type *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {VISA_TYPES.map(type => (
                          <button key={type} type="button"
                            onClick={() => setVisaType(type)}
                            className={`text-left px-3 py-2.5 rounded-xl border text-xs font-body transition-all ${
                              visaType === type
                                ? 'border-navy bg-navy-light text-navy font-semibold'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                            {visaType === type && '✓ '}{type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Destination Country</label>
                      <div className="relative">
                        <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                          placeholder="e.g. United Kingdom" className={`${inputClass} pl-10`} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Additional Message</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)}
                        rows={4} placeholder="Any specific questions or details you want to discuss..."
                        className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                )}

                {/* ── Step 3 ── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <label className={labelClass}>Preferred Date *</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="date" value={preferredDate}
                          onChange={e => setPreferredDate(e.target.value)}
                          min={minDateStr}
                          className={`${inputClass} pl-10`} />
                      </div>
                      <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                        Select a date at least 1 day ahead
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>Preferred Time *</label>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map(slot => (
                          <button key={slot} type="button"
                            onClick={() => setPreferredTime(slot)}
                            className={`py-2 rounded-xl border text-xs font-body transition-all ${
                              preferredTime === slot
                                ? 'border-navy bg-navy text-white font-semibold'
                                : 'border-gray-200 text-gray-600 hover:border-navy/40'
                            }`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-navy-light rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <Clock size={15} className="text-navy shrink-0 mt-0.5" />
                        <div>
                          <p className="font-heading font-bold text-navy text-sm mb-1">
                            About Your Appointment
                          </p>
                          <p className="font-body text-gray-600 text-xs leading-relaxed">
                            This is a <strong>30-minute discussion slot</strong>. The consultant will confirm the actual meeting time and method (WhatsApp call, phone, or video) after reviewing your request. Times are in Pakistan Standard Time (PKT).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 4: Review ── */}
                {step === 4 && (
                  <div className="space-y-4">
                    <p className="font-body text-sm text-gray-600">
                      Please review your appointment request before sending.
                    </p>

                    {[
                      {
                        title: '👤 Your Details',
                        items: [
                          { label: 'Name', value: seekerName },
                          { label: 'Email', value: seekerEmail },
                          { label: 'Phone', value: seekerPhone },
                        ]
                      },
                      {
                        title: '📋 Consultation Info',
                        items: [
                          { label: 'Subject', value: subject },
                          { label: 'Visa Type', value: visaType },
                          { label: 'Destination', value: destination || '—' },
                        ]
                      },
                      {
                        title: '📅 Date & Time',
                        items: [
                          {
                            label: 'Date',
                            value: new Date(preferredDate).toLocaleDateString('en-PK', {
                              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                            })
                          },
                          { label: 'Time', value: preferredTime },
                          { label: 'Duration', value: '30 minutes' },
                        ]
                      },
                    ].map(section => (
                      <div key={section.title} className="bg-gray-50 rounded-2xl p-5">
                        <p className="font-heading font-bold text-navy text-sm mb-3">{section.title}</p>
                        <div className="space-y-2">
                          {section.items.map(item => (
                            <div key={item.label} className="flex items-center justify-between">
                              <span className="font-body text-xs text-gray-400">{item.label}</span>
                              <span className="font-body text-sm text-navy font-medium text-right max-w-[60%]">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {message && (
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <p className="font-heading font-bold text-navy text-sm mb-2">💬 Your Message</p>
                        <p className="font-body text-gray-600 text-sm leading-relaxed">{message}</p>
                      </div>
                    )}

                    <div className="bg-navy-light border border-navy/20 rounded-2xl p-4">
                      <p className="font-body text-xs text-gray-600 leading-relaxed">
                        ℹ️ By submitting, you agree that this is a <strong>discussion request only</strong>. No payment is involved. The consultant will confirm or suggest an alternative time within 24–48 hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                  {step > 1 && (
                    <button onClick={() => setStep(step - 1)}
                      className="font-heading font-semibold text-sm text-navy border border-gray-200 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                      ← Back
                    </button>
                  )}
                  {step < 4 ? (
                    <button onClick={handleNext}
                      className="flex-1 font-heading font-bold text-sm text-white py-3.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' }}>
                      Continue →
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={submitting}
                      className="flex-1 font-heading font-bold text-sm text-white py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                      {submitting ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <><Calendar size={15} /> Confirm Appointment Request</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}