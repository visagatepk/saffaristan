'use client'
import type { Metadata } from 'next'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import emailjs from '@emailjs/browser'
import { createClient } from '@/lib/supabase/client'
import {
  User, Mail, Phone, MessageSquare,
  Send, CheckCircle, AlertCircle, Construction
} from 'lucide-react'

const WHATSAPP_NUMBER = '923149354655'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi VisaGate.pk, I need some help.')}`

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the VisaGate.pk team. Report an issue, ask a question or send us a message via our contact form or WhatsApp.',
  alternates: { canonical: 'https://visagate.pk/contact' },
  openGraph: {
    title: 'Contact VisaGate.pk',
    description: 'Get in touch with the VisaGate.pk team via contact form or WhatsApp.',
    url: 'https://visagate.pk/contact',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'Contact VisaGate.pk' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact VisaGate.pk',
    description: 'Get in touch with the VisaGate.pk team via contact form or WhatsApp.',
    images: ['https://visagate.pk/og-image.png'],
    creator: '@visagatepk',
  },
}
export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !message) {
      setError('Please fill in all required fields')
      return
    }
    if (message.length < 10) {
      setError('Message must be at least 10 characters')
      return
    }

    setSending(true)

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: name,
          from_email: email,
          whatsapp: mobile || 'Not provided',
          subject: 'New Contact Form Message',
          message,
          to_email: 'visagate.pk@gmail.com',
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      setSent(true)
    } catch {
      // Save to Supabase as fallback
      try {
        const supabase = createClient()
        await supabase.from('contact_messages').insert({
          name, email,
          whatsapp: mobile,
          subject: 'Contact Form',
          message,
        })
        setSent(true)
      } catch {
        setError('Failed to send. Please WhatsApp us directly.')
      }
    }
    setSending(false)
  }

  const inputClass = "font-body w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all bg-white"

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-20">
          <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-2">Message Sent!</h2>
            <p className="font-urdu text-gold text-lg mb-4">پیغام بھیج دیا گیا</p>
            <p className="font-body text-gray-500 text-sm leading-relaxed mb-8">
              Thank you <strong className="text-navy">{name}</strong>! We have received your message and will get back to you within <strong>24–48 hours</strong>.
            </p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-heading font-bold text-sm py-3.5 rounded-xl transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Need Faster Help? WhatsApp Us
            </a>
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
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-14 text-center">
          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl mb-3">
            Contact Us
          </h1>
          <p className="font-urdu text-gold/80 text-xl mb-3">ہم سے رابطہ کریں</p>
          <p className="font-body text-white/60 text-sm max-w-lg mx-auto">
            Have a question or need help? Fill the form below or reach us directly on WhatsApp.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-10">

        {/* 🚧 Under Construction Notice */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Construction size={20} className="text-amber-600" />
          </div>
          </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">

          <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="font-heading font-bold text-navy text-lg">Send Us a Message</h2>
            <p className="font-urdu text-gold text-sm mt-1">پیغام بھیجیں</p>
          </div>

          <div className="p-8">

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl mb-6">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Muhammad Ali" required
                    className={`${inputClass} pl-10`} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className={`${inputClass} pl-10`} />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                  Mobile Number
                  <span className="font-normal text-gray-400 ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                    placeholder="+92 300 1234567"
                    className={`${inputClass} pl-10`} />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                  Message <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MessageSquare size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    rows={5} required
                    placeholder="How can we help you? Tell us about your visa needs or any questions you have..."
                    className={`${inputClass} pl-10 resize-none`} />
                </div>
                <p className={`font-body text-xs mt-1.5 ml-1 ${message.length > 0 && message.length < 10 ? 'text-red-400' : 'text-gray-400'}`}>
                  {message.length} characters
                </p>
              </div>

              {/* Submit */}
              <button type="submit" disabled={sending}
                className="w-full font-heading font-bold text-sm text-white py-4 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' }}>
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Send Message
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="font-body text-xs text-gray-400">or reach us directly</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* WhatsApp Button */}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-heading font-bold text-sm py-4 rounded-xl transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Chat on WhatsApp — واٹس ایپ پر رابطہ کریں
            </a>

            <p className="font-body text-xs text-gray-400 text-center mt-4">
              WhatsApp replies are typically faster · عام طور پر تیز جواب
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}