'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  AlertTriangle, Shield, Phone, Mail,
  User, MapPin, DollarSign, Calendar,
  FileText, CheckCircle, ChevronRight,
  ArrowRight, Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const FRAUD_TYPES = [
  'Took money and disappeared',
  'Fake visa documents provided',
  'False success rate claims',
  'Impersonating a licensed consultant',
  'Asking for CNIC/Passport and misusing it',
  'Fake job offer abroad',
  'Overcharging / hidden fees',
  'No service delivered after payment',
  'Other',
]

const CITIES = [
  'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi',
  'Peshawar', 'Quetta', 'Multan', 'Faisalabad',
  'Sialkot', 'Gujranwala', 'Hyderabad', 'Other'
]

export default function ReportFraudPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reportId, setReportId] = useState('')
  const [error, setError] = useState('')

  // Form fields
  const [reporterName, setReporterName] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')
  const [fraudType, setFraudType] = useState('')
  const [consultantName, setConsultantName] = useState('')
  const [consultantPhone, setConsultantPhone] = useState('')
  const [consultantCity, setConsultantCity] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [amountLost, setAmountLost] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [description, setDescription] = useState('')
  const [evidenceDescription, setEvidenceDescription] = useState('')

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!reporterName || !reporterEmail || !reporterPhone) {
        setError('Please fill in all required fields')
        return
      }
    }
    if (step === 2) {
      if (!fraudType || !description) {
        setError('Please select fraud type and describe the incident')
        return
      }
    }
    setStep(step + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setError('')
    if (!reporterName || !reporterEmail || !fraudType || !description) {
      setError('Please fill all required fields')
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    const { data, error: insertError } = await supabase
      .from('fraud_reports')
      .insert({
        reporter_name: reporterName,
        reporter_email: reporterEmail,
        reporter_phone: reporterPhone,
        fraud_type: fraudType,
        consultant_name: consultantName,
        consultant_phone: consultantPhone,
        consultant_city: consultantCity,
        platform_profile_url: profileUrl,
        amount_lost: amountLost,
        incident_date: incidentDate || null,
        description,
        evidence_description: evidenceDescription,
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setReportId(data?.id?.slice(0, 8).toUpperCase() || 'VG-FRAUD')
    setSubmitted(true)
    setSubmitting(false)
  }

  const inputClass = "font-body w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
  const labelClass = "font-body text-xs font-medium text-gray-700 block mb-1.5"

  // ── Success State ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="bg-white rounded-3xl border border-gray-100 p-10">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-3">
              Report Submitted
            </h2>
            <p className="font-urdu text-gold text-lg mb-4">رپورٹ جمع ہو گئی</p>

            <div className="bg-navy-light rounded-2xl p-4 mb-6">
              <p className="font-body text-xs text-gray-500 mb-1">Your Report ID</p>
              <p className="font-heading font-bold text-navy text-2xl tracking-widest">
                VG-{reportId}
              </p>
              <p className="font-body text-xs text-gray-400 mt-1">Save this for reference</p>
            </div>

            <div className="space-y-3 text-left mb-8">
              {[
                { icon: Clock, text: 'Our team will review your report within 24–48 hours' },
                { icon: Mail, text: `A confirmation has been sent to ${reporterEmail}` },
                { icon: Shield, text: 'If verified, the consultant will be suspended immediately' },
                { icon: Phone, text: 'We may contact you for additional information' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon size={14} className="text-green-600" />
                  </div>
                  <p className="font-body text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <p className="font-heading font-bold text-amber-800 text-sm mb-1">
                ⚠️ If you are in immediate danger
              </p>
              <p className="font-body text-amber-700 text-xs leading-relaxed">
                Contact FIA Cyber Crime Wing: <strong>0800-999-38</strong> or visit your nearest police station.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/"
                className="flex-1 font-heading font-bold text-sm text-navy border border-navy py-3 rounded-xl hover:bg-navy hover:text-white transition-colors text-center">
                Go Home
              </Link>
              <Link href="/consultants"
                className="flex-1 font-heading font-bold text-sm text-white py-3 rounded-xl transition-colors text-center hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                Find Safe Consultants
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

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-400/30 bg-red-400/10 mb-5">
            <AlertTriangle size={13} className="text-red-300" />
            <span className="font-body text-xs font-semibold text-red-200 tracking-wide">
              Fraud Protection
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl mb-3">
            Report a Fraud or Scam
          </h1>
          <p className="font-urdu text-red-200 text-xl mb-4">فراڈ یا دھوکہ رپورٹ کریں</p>
          <p className="font-body text-red-100/70 text-sm max-w-xl mx-auto leading-relaxed">
            Help protect others from dishonest consultants. All reports are reviewed within 24 hours. Your identity is kept confidential.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10">

        {/* Warning banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-bold text-amber-800 text-sm mb-1">
              For Emergencies — Contact FIA Directly
            </p>
            <p className="font-body text-amber-700 text-xs leading-relaxed">
              If you have been scammed and need immediate help, contact the{' '}
              <strong>FIA Cyber Crime Wing: 0800-999-38</strong> or visit{' '}
              <strong>fia.gov.pk</strong>. This form is for platform-level action only.
            </p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { num: 1, label: 'Your Info' },
            { num: 2, label: 'Incident Details' },
            { num: 3, label: 'Review & Submit' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 flex-1`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-heading font-bold text-xs shrink-0 transition-all ${
                  step > s.num
                    ? 'bg-green-500 text-white'
                    : step === s.num
                    ? 'bg-navy text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > s.num ? <CheckCircle size={14} /> : s.num}
                </div>
                <span className={`font-body text-xs font-medium hidden sm:block ${
                  step === s.num ? 'text-navy' : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                  step > s.num ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">

          {/* Step header */}
          <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="font-heading font-bold text-navy text-lg">
              {step === 1 && '👤 Your Contact Information'}
              {step === 2 && '🚨 Incident Details'}
              {step === 3 && '✅ Review & Submit'}
            </h2>
            <p className="font-body text-gray-500 text-xs mt-1">
              {step === 1 && 'Your information is kept confidential and used only to follow up on this report.'}
              {step === 2 && 'Tell us what happened. The more detail you provide, the faster we can act.'}
              {step === 3 && 'Please review your report before submitting.'}
            </p>
          </div>

          <div className="p-8">

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl mb-6">
                <AlertTriangle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* ── Step 1: Reporter Info ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={reporterName}
                      onChange={e => setReporterName(e.target.value)}
                      placeholder="Muhammad Ali" required
                      className={`${inputClass} pl-10`} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Address *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={reporterEmail}
                      onChange={e => setReporterEmail(e.target.value)}
                      placeholder="you@example.com" required
                      className={`${inputClass} pl-10`} />
                  </div>
                  <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                    We will send you a confirmation and case updates
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" value={reporterPhone}
                      onChange={e => setReporterPhone(e.target.value)}
                      placeholder="+92 300 1234567" required
                      className={`${inputClass} pl-10`} />
                  </div>
                </div>

                <div className="bg-navy-light rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield size={16} className="text-navy shrink-0 mt-0.5" />
                    <div>
                      <p className="font-heading font-bold text-navy text-sm mb-1">Your Privacy is Protected</p>
                      <p className="font-body text-gray-600 text-xs leading-relaxed">
                        Your personal information will never be shared with the person you are reporting. It is used only for our internal investigation and to contact you for updates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Incident Details ── */}
            {step === 2 && (
              <div className="space-y-5">

                {/* Fraud Type */}
                <div>
                  <label className={labelClass}>Type of Fraud *</label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {FRAUD_TYPES.map(type => (
                      <button key={type} type="button"
                        onClick={() => setFraudType(type)}
                        className={`text-left px-4 py-3 rounded-xl border text-xs font-body transition-all ${
                          fraudType === type
                            ? 'border-red-400 bg-red-50 text-red-700 font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {fraudType === type && <span className="mr-1">✓</span>}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultant info */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <p className="font-heading font-bold text-navy text-sm">
                    Consultant / Person You Are Reporting
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Their Name</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={consultantName}
                          onChange={e => setConsultantName(e.target.value)}
                          placeholder="Consultant name"
                          className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Their Phone</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" value={consultantPhone}
                          onChange={e => setConsultantPhone(e.target.value)}
                          placeholder="+92 300 xxxxxxx"
                          className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Their City</label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select value={consultantCity}
                          onChange={e => setConsultantCity(e.target.value)}
                          className={`${inputClass} pl-10 appearance-none`}>
                          <option value="">Select city</option>
                          {CITIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>VisaGate Profile URL</label>
                      <input type="url" value={profileUrl}
                        onChange={e => setProfileUrl(e.target.value)}
                        placeholder="visagate.pk/consultants/..."
                        className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Money & Date */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Amount Lost (PKR)</label>
                    <div className="relative">
                      <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={amountLost}
                        onChange={e => setAmountLost(e.target.value)}
                        placeholder="e.g. 50,000"
                        className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Date of Incident</label>
                    <div className="relative">
                      <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="date" value={incidentDate}
                        onChange={e => setIncidentDate(e.target.value)}
                        className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Describe What Happened *</label>
                  <textarea value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5} required
                    placeholder="Please describe in detail what happened. Include dates, amounts, what was promised, and what actually happened..."
                    className={`${inputClass} resize-none`} />
                  <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                    {description.length}/1000 characters — more detail helps us act faster
                  </p>
                </div>

                {/* Evidence */}
                <div>
                  <label className={labelClass}>Evidence You Have</label>
                  <textarea value={evidenceDescription}
                    onChange={e => setEvidenceDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe any evidence you have: WhatsApp messages, receipts, screenshots, bank transfer records..."
                    className={`${inputClass} resize-none`} />
                  <p className="font-body text-xs text-gray-400 mt-1.5 ml-1">
                    ⚠️ Do NOT upload files here. Email evidence to: <strong>fraud@visagate.pk</strong>
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 3: Review & Submit ── */}
            {step === 3 && (
              <div className="space-y-5">
                <p className="font-body text-sm text-gray-600">
                  Please review your report. Once submitted, our team will investigate within 24–48 hours.
                </p>

                {/* Summary cards */}
                <div className="space-y-3">

                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="font-heading font-bold text-navy text-sm mb-3 flex items-center gap-2">
                      <User size={14} /> Your Information
                    </p>
                    <div className="space-y-2 text-sm font-body">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name</span>
                        <span className="text-navy font-medium">{reporterName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email</span>
                        <span className="text-navy font-medium">{reporterEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone</span>
                        <span className="text-navy font-medium">{reporterPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                    <p className="font-heading font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} /> Fraud Details
                    </p>
                    <div className="space-y-2 text-sm font-body">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type</span>
                        <span className="text-red-700 font-semibold">{fraudType}</span>
                      </div>
                      {consultantName && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Reported Person</span>
                          <span className="text-navy font-medium">{consultantName}</span>
                        </div>
                      )}
                      {consultantCity && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">City</span>
                          <span className="text-navy font-medium">{consultantCity}</span>
                        </div>
                      )}
                      {amountLost && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount Lost</span>
                          <span className="text-red-700 font-bold">PKR {amountLost}</span>
                        </div>
                      )}
                      {incidentDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date</span>
                          <span className="text-navy font-medium">{incidentDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="font-heading font-bold text-navy text-sm mb-3 flex items-center gap-2">
                      <FileText size={14} /> Description
                    </p>
                    <p className="font-body text-gray-600 text-sm leading-relaxed">{description}</p>
                    {evidenceDescription && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="font-body text-xs text-gray-400 mb-1">Evidence:</p>
                        <p className="font-body text-gray-600 text-sm">{evidenceDescription}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Declaration */}
                <div className="bg-navy-light border border-navy/20 rounded-2xl p-5">
                  <p className="font-heading font-bold text-navy text-sm mb-2">
                    📋 Declaration
                  </p>
                  <p className="font-body text-gray-600 text-xs leading-relaxed mb-3">
                    By submitting this report, I confirm that the information provided is truthful to the best of my knowledge. I understand that filing a false report may result in legal consequences under Pakistani law.
                  </p>
                  <p className="font-urdu text-gray-600 text-sm leading-loose" dir="rtl">
                    اس رپورٹ کو جمع کر کے، میں تصدیق کرتا/کرتی ہوں کہ فراہم کردہ معلومات میرے بہترین علم کے مطابق درست ہیں۔
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)}
                  className="font-heading font-semibold text-sm text-navy border border-gray-200 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
              )}

              {step < 3 ? (
                <button onClick={handleNext}
                  className="flex-1 font-heading font-bold text-sm text-white py-3.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)' }}>
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 font-heading font-bold text-sm text-white py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)' }}>
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={15} />
                      Submit Fraud Report
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Clock, title: '24–48 Hours', desc: 'Average review time for all reports' },
            { icon: Shield, title: 'Confidential', desc: 'Your identity is never revealed to the reported person' },
            { icon: AlertTriangle, title: 'Action Taken', desc: 'Verified frauds result in immediate account suspension' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <item.icon size={18} className="text-red-500" />
              </div>
              <p className="font-heading font-bold text-navy text-sm mb-1">{item.title}</p>
              <p className="font-body text-gray-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}