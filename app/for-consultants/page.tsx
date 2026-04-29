'use client'
// FILE: app/for-consultants/page.tsx

import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  CheckCircle, Star, TrendingUp, Shield, Users, MessageSquare,
  Calendar, Award, ChevronRight, ArrowRight, BadgeCheck,
  Zap, Globe, Clock, DollarSign, BarChart2, Phone,
  Plus, Minus
} from 'lucide-react'
import { useState } from 'react'

// ── DATA ──────────────────────────────────────────────────────────

const STATS = [
  { value: '50,000+', label: 'Active Visa Seekers', icon: Users },
  { value: '4.8★', label: 'Average Consultant Rating', icon: Star },
  { value: '120+', label: 'Cities Covered', icon: Globe },
  { value: '95%', label: 'Client Satisfaction Rate', icon: TrendingUp },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Sign up in minutes. Add your OEP license, SECP registration, services, and expertise. Our team verifies your credentials within 24 hours.',
    icon: Shield,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    step: '02',
    title: 'Get Discovered',
    desc: 'Your verified profile appears in front of thousands of visa seekers searching for consultants in your city and specialization.',
    icon: Globe,
    color: 'bg-green-50 text-green-600',
  },
  {
    step: '03',
    title: 'Grow Your Business',
    desc: 'Receive appointment requests, chat with clients, collect reviews, and build a 5-star reputation on Pakistan\'s most trusted visa platform.',
    icon: TrendingUp,
    color: 'bg-purple-50 text-purple-600',
  },
]

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Verified Badge',
    desc: 'Get BEOE, OEP, SECP, and FBR verification badges that build instant trust with clients.',
    color: 'text-[#C9A227]',
    bg: 'bg-amber-50',
  },
  {
    icon: Calendar,
    title: 'Appointment System',
    desc: 'Clients can book appointments directly through your profile. Manage your schedule effortlessly.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Messaging',
    desc: 'Chat directly with potential clients. Answer queries instantly and convert leads faster.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Star,
    title: 'Review System',
    desc: 'Build your reputation with verified client reviews. 5-star consultants get featured placement.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: BarChart2,
    title: 'Analytics Dashboard',
    desc: 'Track profile views, inquiries, bookings, and revenue all in one powerful dashboard.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Phone,
    title: 'WhatsApp Integration',
    desc: 'Clients can reach you via WhatsApp directly from your profile. Never miss a lead.',
    color: 'text-[#1B3060]',
    bg: 'bg-blue-50',
  },
]

const TESTIMONIALS = [
  {
    name: 'Tariq Mahmood',
    title: 'OEP Licensed Consultant · Lahore',
    rating: 5,
    text: 'VisaGate completely transformed my business. I was struggling to find new clients, but within 2 months of joining I had a full appointment calendar. The verification badge made all the difference.',
    avatar: 'TM',
    clients: '47 clients via VisaGate',
  },
  {
    name: 'Sana Khalid',
    title: 'SECP Registered · Karachi',
    rating: 5,
    text: 'As a female consultant, the professional platform gave me credibility I needed. My profile gets 200+ views monthly and the messaging system makes client communication so easy.',
    avatar: 'SK',
    clients: '63 clients via VisaGate',
  },
  {
    name: 'Ahmed Raza',
    title: 'Immigration Specialist · Islamabad',
    rating: 5,
    text: 'The dashboard analytics help me understand which services are most in demand. I\'ve doubled my revenue since joining VisaGate 6 months ago. Highly recommended for serious consultants.',
    avatar: 'AR',
    clients: '89 clients via VisaGate',
  },
]

const BADGES = [
  { name: 'BEOE', label: 'Bureau of Emigration', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'OEP', label: 'Overseas Employment', color: 'bg-green-100 text-green-700 border-green-200' },
  { name: 'SECP', label: 'Company Registration', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'FBR', label: 'Tax Registration', color: 'bg-orange-100 text-orange-700 border-orange-200' },
]

const FAQS = [
  {
    q: 'Is it free to join VisaGate?',
    a: 'Yes! Creating your consultant profile and getting listed is completely free. We believe in growing together with Pakistan\'s visa consultants.',
  },
  {
    q: 'How does the verification process work?',
    a: 'After you submit your OEP license number, SECP registration date, and other credentials, our admin team reviews and verifies them within 24 hours. Verified consultants get special badges on their profile.',
  },
  {
    q: 'What cities are covered?',
    a: 'VisaGate currently covers all major cities across Pakistan including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and 100+ more.',
  },
  {
    q: 'Can I list multiple services?',
    a: 'Absolutely! You can add unlimited services to your profile — each with its own description, pricing, and thumbnail image. Show clients exactly what you specialize in.',
  },
  {
    q: 'How do clients find me?',
    a: 'Clients search by city, visa type, destination country, and verification status. Having a complete profile with all verifications significantly increases your visibility.',
  },
  {
    q: 'What happens after a client books an appointment?',
    a: 'You receive a notification and the appointment appears in your dashboard. You can confirm, reschedule, or decline. Real-time messaging lets you communicate with the client instantly.',
  },
]

// ── COMPONENTS ────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-2xl transition-all duration-200 ${open ? 'border-[#C9A227] bg-amber-50/50' : 'border-gray-200 bg-white'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left gap-4"
      >
        <span className={`font-semibold text-sm md:text-base transition-colors ${open ? 'text-[#1B3060]' : 'text-gray-800'}`}>{q}</span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? 'bg-[#C9A227] text-white' : 'bg-gray-100 text-gray-500'}`}>
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────

export default function ForConsultantsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative bg-[#1B3060] overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(201,162,39,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)'
        }} />

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 text-[#C9A227] text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-[#C9A227]/20">
                <Zap size={14} />
                Pakistan's #1 Visa Consultant Platform
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-['Plus_Jakarta_Sans'] leading-tight mb-6">
                Grow Your Visa<br />
                <span className="text-[#C9A227]">Consultancy Business</span><br />
                Online
              </h1>

              <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                Join 5,000+ verified visa consultants on VisaGate.pk. Get discovered by seekers, manage appointments, and build your 5-star reputation — all for free.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/register/consultant"
                  className="flex items-center gap-2 bg-[#C9A227] text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-[#b8911f] transition-all shadow-lg shadow-[#C9A227]/25 group"
                >
                  Join Free Today
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/consultants"
                  className="flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/10 transition-all"
                >
                  See Live Profiles
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                <div className="flex items-center gap-1.5 text-white/60 text-sm">
                  <CheckCircle size={14} className="text-green-400" />
                  Free to join
                </div>
                <div className="flex items-center gap-1.5 text-white/60 text-sm">
                  <CheckCircle size={14} className="text-green-400" />
                  Verified in 24hrs
                </div>
                <div className="flex items-center gap-1.5 text-white/60 text-sm">
                  <CheckCircle size={14} className="text-green-400" />
                  No commission
                </div>
              </div>
            </div>

            {/* Right — Mock Profile Card */}
            <div className="flex-shrink-0 w-full max-w-sm">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Card Header */}
                <div className="h-24 bg-gradient-to-r from-[#1B3060] to-[#2a4a8a] relative">
                  <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#C9A227] flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white">
                      AK
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>
                  </div>
                </div>

                <div className="pt-10 px-6 pb-6">
                  <h3 className="font-bold text-[#1B3060] text-lg font-['Plus_Jakarta_Sans']">Ahmad Khan</h3>
                  <p className="text-gray-500 text-sm mb-3">Immigration Consultant · Lahore</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {BADGES.map(b => (
                      <span key={b.name} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${b.color}`}>
                        {b.name}
                      </span>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-2xl p-3">
                    {[
                      { val: '4.9', label: 'Rating' },
                      { val: '127', label: 'Clients' },
                      { val: '8yr', label: 'Experience' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <div className="font-bold text-[#1B3060] text-base">{s.val}</div>
                        <div className="text-xs text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#1B3060] text-white text-sm font-semibold py-2.5 rounded-xl">
                      Book Appointment
                    </button>
                    <button className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl">
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-white/50 text-xs mt-3">← Your profile will look like this</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#C9A227] font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mt-2 mb-4">
              Start Getting Clients in 3 Steps
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Join Pakistan's fastest growing visa consultant network in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="relative bg-white rounded-3xl p-7 shadow-sm border border-gray-100 group hover:shadow-md hover:border-[#C9A227]/30 transition-all">
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                    <item.icon size={22} />
                  </div>
                  <span className="text-5xl font-black text-gray-100 font-['Plus_Jakarta_Sans'] group-hover:text-[#C9A227]/20 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#C9A227] rounded-full flex items-center justify-center z-10">
                    <ChevronRight size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VERIFICATION BADGES ── */}
      <section className="py-20 bg-[#1B3060]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <span className="text-[#C9A227] font-semibold text-sm uppercase tracking-wider">Trust & Credibility</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-['Plus_Jakarta_Sans'] mt-2 mb-4">
                Your Credentials,<br />Displayed Proudly
              </h2>
              <p className="text-white/70 leading-relaxed mb-8 max-w-lg">
                Verified badges tell clients you're the real deal. Consultants with verification badges receive 3x more inquiries than unverified profiles.
              </p>
              <Link href="/register/consultant" className="inline-flex items-center gap-2 bg-[#C9A227] text-white px-7 py-3.5 rounded-xl font-bold hover:bg-[#b8911f] transition-colors">
                Get Verified Today <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-md">
              {BADGES.map(badge => (
                <div key={badge.name} className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full border mb-3 ${badge.color}`}>
                    <BadgeCheck size={14} />
                    {badge.name}
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">{badge.label} verified — builds maximum client trust</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#C9A227] font-semibold text-sm uppercase tracking-wider">Everything You Need</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mt-2 mb-4">
              Powerful Tools for Your Practice
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything you need to manage, grow, and scale your visa consultancy business in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-gray-100 hover:border-[#C9A227]/30 hover:shadow-md transition-all bg-white">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.bg} group-hover:scale-110 transition-transform`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="font-bold text-[#1B3060] mb-2 font-['Plus_Jakarta_Sans']">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-[#C9A227] font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mt-2 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-500 mb-10">No hidden fees. No commissions. Grow your business freely.</p>

          <div className="bg-white rounded-3xl shadow-xl border-2 border-[#C9A227] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#C9A227] text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">
              MOST POPULAR
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-6xl font-black text-[#1B3060] font-['Plus_Jakarta_Sans']">FREE</span>
            </div>
            <p className="text-gray-500 mb-8">Forever free for consultants. We grow when you grow.</p>

            <div className="grid md:grid-cols-2 gap-3 mb-8 text-left">
              {[
                'Verified consultant profile',
                'Unlimited service listings',
                'Appointment booking system',
                'Real-time client messaging',
                'WhatsApp & call integration',
                'Client reviews & ratings',
                'Analytics dashboard',
                'BEOE / OEP / SECP / FBR badges',
                'Featured placement (top rated)',
                'No commission on bookings',
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2.5">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register/consultant"
              className="inline-flex items-center gap-2 bg-[#1B3060] text-white px-10 py-4 rounded-xl font-bold text-base hover:bg-[#243d7a] transition-colors shadow-lg group"
            >
              Create Free Profile Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#C9A227] font-semibold text-sm uppercase tracking-wider">Success Stories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mt-2">
              Consultants Love VisaGate
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-[#C9A227] fill-[#C9A227]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-[#1B3060] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1B3060] text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.title}</div>
                  </div>
                </div>
                <div className="mt-3 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1 self-start">
                  <TrendingUp size={11} /> {t.clients}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#C9A227] font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 bg-[#1B3060] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-[#C9A227] rounded-full blur-3xl -translate-x-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white font-['Plus_Jakarta_Sans'] mb-4 leading-tight">
            Ready to Grow Your<br />
            <span className="text-[#C9A227]">Visa Consultancy?</span>
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of verified consultants already growing their business on Pakistan's most trusted visa platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/register/consultant"
              className="flex items-center gap-2 bg-[#C9A227] text-white px-10 py-4 rounded-xl font-bold text-base hover:bg-[#b8911f] transition-all shadow-lg shadow-[#C9A227]/30 group"
            >
              Create Free Profile
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-white/10 transition-all"
            >
              Talk to Our Team
            </Link>
          </div>
          <p className="text-white/40 text-sm mt-6">
            No credit card required · Free forever · Get verified in 24 hours
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}