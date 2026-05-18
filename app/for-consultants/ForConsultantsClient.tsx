'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  CheckCircle, Star, TrendingUp, Shield, Users, MessageSquare,
  Calendar, Award, ChevronDown, ArrowRight, Briefcase, Globe,
  BarChart2, Zap, Clock, BadgeCheck
} from 'lucide-react'

// ── Animated counter ──────────────────────────────────────────────────────
function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const animate = (now: number) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(animate)
          else setCount(end)
        }
        requestAnimationFrame(animate)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── FAQ Item ──────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-[#1B3060] pr-4">{q}</span>
        <ChevronDown
          size={20}
          className={`text-[#C9A227] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function ForConsultantsClient() {
  return (
    <main className="bg-white">

      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0f1f45]">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #C9A227 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/30 text-[#C9A227] text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <Zap size={14} />
              Pakistan's #1 Visa Consultant Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Grow Your Visa <br />
              <span className="text-[#C9A227]">Consultancy</span> <br />
              Business Online
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed mb-10 max-w-lg">
              Join thousands of verified visa consultants on VisaGate.pk — Pakistan's first trusted platform connecting you with genuine clients actively seeking visa guidance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register/consultant"
                className="inline-flex items-center gap-2 bg-[#C9A227] text-[#0f1f45] font-bold px-8 py-4 rounded-2xl hover:bg-[#b8911f] transition-all duration-200 shadow-lg shadow-[#C9A227]/30 text-lg"
              >
                Join Free Today
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/consultants"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200 border border-white/20 text-lg"
              >
                See Live Profiles
              </Link>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              ✓ Free to join &nbsp;&nbsp; ✓ No commission taken &nbsp;&nbsp; ✓ Verified badge included
            </p>
          </div>

          {/* Right — Profile card mockup */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-6 w-80">
                <div className="h-24 rounded-2xl mb-12 relative" style={{ background: 'linear-gradient(135deg, #1B3060, #2d4a8a)' }}>
                  <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl bg-[#C9A227] flex items-center justify-center shadow-lg">
                    <Briefcase size={28} className="text-white" />
                  </div>
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Verified
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-bold text-[#1B3060] text-lg">Ahmed Consultant</h3>
                  <p className="text-gray-500 text-sm">Immigration Specialist · Lahore</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-[#C9A227] text-[#C9A227]" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">4.9 (47 reviews)</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {['UK Visa', 'Canada', 'Schengen'].map(tag => (
                    <span key={tag} className="bg-blue-50 text-[#1B3060] text-xs font-medium px-2 py-1 rounded-lg text-center">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 grid grid-cols-3 text-center gap-2">
                  <div>
                    <div className="font-bold text-[#1B3060] text-lg">142</div>
                    <div className="text-gray-400 text-xs">Clients</div>
                  </div>
                  <div>
                    <div className="font-bold text-[#1B3060] text-lg">8yr</div>
                    <div className="text-gray-400 text-xs">Experience</div>
                  </div>
                  <div>
                    <div className="font-bold text-[#1B3060] text-lg">98%</div>
                    <div className="text-gray-400 text-xs">Success</div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-14 top-16 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Users size={15} className="text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">New inquiry</div>
                  <div className="text-sm font-bold text-[#1B3060]">Just now</div>
                </div>
              </div>
              <div className="absolute -right-10 bottom-24 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A227]/20 flex items-center justify-center">
                  <TrendingUp size={15} className="text-[#C9A227]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Profile views</div>
                  <div className="text-sm font-bold text-[#1B3060]">+340 this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 200000, suffix: '+', label: 'Active Seekers' },
              { value: 300, suffix: '+', label: 'Verified Consultants' },
              { value: 20, suffix: '+', label: 'Visa Categories' },
              { value: 98, suffix: '%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-[#1B3060] mb-1">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY VISAGATE ──────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#1B3060]/10 text-[#1B3060] text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Why VisaGate?
            </div>
            <h2 className="text-4xl font-bold text-[#1B3060] mb-4">
              Everything You Need to <span className="text-[#C9A227]">Succeed</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We built VisaGate specifically for Pakistani visa consultants — with tools, visibility, and trust-building features you won't find anywhere else.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <BadgeCheck size={24} />, title: 'Official Verification Badge', desc: 'Get verified with your OEP license and SECP registration. Clients trust verified consultants 3x more.', color: 'blue' },
              { icon: <Globe size={24} />, title: 'Pakistan-Wide Visibility', desc: 'Your profile is visible to thousands of visa seekers searching from Karachi to Peshawar and everywhere in between.', color: 'gold' },
              { icon: <MessageSquare size={24} />, title: 'Real-Time Messaging', desc: 'Communicate directly with clients through our built-in messaging system. No third-party apps needed.', color: 'blue' },
              { icon: <Calendar size={24} />, title: 'Appointment Management', desc: 'Accept or decline appointment requests from your dashboard. Full control over your schedule.', color: 'gold' },
              { icon: <BarChart2 size={24} />, title: 'Profile Analytics', desc: 'See how many people viewed your profile, which services are most popular, and track your growth.', color: 'blue' },
              { icon: <Shield size={24} />, title: 'Zero Commission', desc: 'We never take a cut from your earnings. Payments go directly between you and your client — always.', color: 'gold' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feature.color === 'gold' ? 'bg-[#C9A227]/15 text-[#C9A227]' : 'bg-[#1B3060]/10 text-[#1B3060]'}`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-[#1B3060] text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#C9A227]/15 text-[#C9A227] text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Simple Process
            </div>
            <h2 className="text-4xl font-bold text-[#1B3060] mb-4">
              Get Listed in <span className="text-[#C9A227]">3 Easy Steps</span>
            </h2>
            <p className="text-gray-500">From signup to your first client inquiry — it's faster than you think.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-[#1B3060] via-[#C9A227] to-[#1B3060] opacity-20" />
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { step: '01', icon: <Briefcase size={28} />, title: 'Create Your Profile', desc: 'Sign up and complete your consultant profile with your specializations, experience, and services.', time: '5 minutes' },
                { step: '02', icon: <BadgeCheck size={28} />, title: 'Get Verified', desc: 'Submit your OEP license number and SECP registration. Our team verifies and adds your official badge.', time: '24-48 hours' },
                { step: '03', icon: <Users size={28} />, title: 'Start Getting Clients', desc: 'Your profile goes live and clients start finding you. Respond to inquiries and grow your business.', time: 'Immediately' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="w-32 h-32 rounded-3xl bg-[#1B3060] flex items-center justify-center text-white shadow-xl shadow-[#1B3060]/20">
                      {step.icon}
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#C9A227] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-bold text-[#1B3060] text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{step.desc}</p>
                  <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Clock size={12} />
                    {step.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES SHOWCASE ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-[#1B3060]/10 text-[#1B3060] text-sm font-semibold px-4 py-2 rounded-full mb-6">
                Service Listings
              </div>
              <h2 className="text-4xl font-bold text-[#1B3060] mb-6">
                Showcase Your <span className="text-[#C9A227]">Services</span> Like a Pro
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Create beautiful service listings for each visa type you offer. Add pricing, turnaround time, and what's included — just like Fiverr, but built specifically for Pakistani visa consultants.
              </p>
              <div className="space-y-4">
                {[
                  'List multiple services with custom pricing',
                  'Add service images and detailed descriptions',
                  'Show your processing time and success rate',
                  'Clients can directly book an appointment',
                  'Manage all bookings from one dashboard',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-[#C9A227] flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register/consultant"
                className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-[#243d7a] transition-colors mt-8">
                Create Your Profile <ArrowRight size={18} />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { title: 'UK Student Visa Consultation', price: 'PKR 8,000', tag: 'Most Popular', days: '7-10 days' },
                { title: 'Canada PR Assessment', price: 'PKR 15,000', tag: 'Premium', days: '14-21 days' },
                { title: 'Schengen Tourist Visa', price: 'PKR 5,500', tag: 'Quick Process', days: '5-7 days' },
              ].map((service, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1B3060]/10 flex items-center justify-center">
                      <Globe size={20} className="text-[#1B3060]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1B3060] text-sm mb-1">{service.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#C9A227]/15 text-[#C9A227] text-xs font-medium px-2 py-0.5 rounded-full">{service.tag}</span>
                        <span className="text-gray-400 text-xs flex items-center gap-1"><Clock size={11} /> {service.days}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1B3060]">{service.price}</div>
                    <div className="text-xs text-gray-400">per consultation</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-24 bg-[#1B3060]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#C9A227]/20 text-[#C9A227] text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Consultant Stories
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">What Our Consultants Say</h2>
            <p className="text-blue-200">Real results from real consultants across Pakistan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Tariq Mahmood', city: 'Lahore', specialty: 'UK & Canada Visas', review: 'VisaGate completely transformed my consultancy. I went from 5 clients a month to over 30 within 3 months of joining. The verification badge gives clients instant trust.', rating: 5, clients: 142 },
              { name: 'Nadia Ansari', city: 'Karachi', specialty: 'Schengen & Europe', review: 'The platform is incredibly easy to use. I set up my profile in 30 minutes and received my first inquiry the same evening. No commission taken — I keep everything I earn.', rating: 5, clients: 89 },
              { name: 'Bilal Khan', city: 'Islamabad', specialty: 'Australia & New Zealand', review: 'As a newly registered consultant, getting clients was my biggest challenge. VisaGate solved that immediately. The messaging system makes communication professional and easy.', rating: 5, clients: 56 },
            ].map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-3xl p-7 border border-white/10">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={15} className="fill-[#C9A227] text-[#C9A227]" />
                  ))}
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-6 italic">"{t.review}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C9A227] flex items-center justify-center text-[#1B3060] font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{t.name}</div>
                      <div className="text-blue-300 text-xs">{t.specialty} · {t.city}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#C9A227] font-bold">{t.clients}+</div>
                    <div className="text-blue-300 text-xs">clients served</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-block bg-green-50 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            Transparent Pricing
          </div>
          <h2 className="text-4xl font-bold text-[#1B3060] mb-4">
            Always <span className="text-[#C9A227]">Free</span> to Join
          </h2>
          <p className="text-gray-500 mb-12">
            No signup fees, no monthly charges, no commission. VisaGate is completely free for consultants — now and always.
          </p>
          <div className="bg-gradient-to-br from-[#1B3060] to-[#243d7a] rounded-3xl p-10 text-white shadow-2xl shadow-[#1B3060]/30">
            <div className="text-6xl font-bold text-[#C9A227] mb-2">PKR 0</div>
            <div className="text-blue-200 mb-8">Forever free for consultants</div>
            <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
              {[
                'Verified consultant profile', 'Unlimited service listings',
                'Real-time client messaging', 'Appointment management',
                'Profile analytics dashboard', 'Official verification badge',
                'Pakistan-wide visibility', '0% commission on earnings',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle size={16} className="text-[#C9A227] flex-shrink-0" />
                  <span className="text-blue-100 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/register/consultant"
              className="inline-flex items-center gap-2 bg-[#C9A227] text-[#1B3060] font-bold px-10 py-4 rounded-2xl hover:bg-[#b8911f] transition-colors text-lg shadow-lg shadow-[#C9A227]/30">
              Get Started Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1B3060] mb-4">
              Frequently Asked <span className="text-[#C9A227]">Questions</span>
            </h2>
            <p className="text-gray-500">Everything you need to know before joining.</p>
          </div>
          <div className="space-y-3">
            {[
              { q: 'Is VisaGate really free for consultants?', a: 'Yes, 100% free. There are no signup fees, no monthly subscriptions, and no commission on your earnings. Payments are handled directly between you and your client — we are not involved.' },
              { q: 'How does the verification process work?', a: 'During registration, you provide your OEP license number, OEP license title, and SECP registration date. Our team manually verifies this information and adds the official verification badge to your profile within 24-48 hours.' },
              { q: 'Can I list multiple visa services?', a: 'Absolutely. You can create as many service listings as you offer — UK visas, Canada PR, Schengen, Australia, and more. Each service can have its own pricing, description, and turnaround time.' },
              { q: 'How do clients contact me?', a: 'Clients can message you directly through the VisaGate messaging system, call you via your listed number, WhatsApp you, or book a formal appointment through the platform.' },
              { q: 'What happens after I register?', a: 'After completing your profile, your listing goes live immediately. The verification badge is added within 24-48 hours after we verify your credentials.' },
              { q: 'Can I update my profile and services anytime?', a: 'Yes, your consultant dashboard gives you full control to update your profile, add or remove services, set your availability, and manage appointments — all in real time.' },
            ].map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-[#1B3060] to-[#2d4a8a] rounded-3xl px-8 py-16 relative overflow-hidden shadow-2xl shadow-[#1B3060]/20">
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #C9A227 1px, transparent 0)`, backgroundSize: '32px 32px' }}
            />
            <div className="relative">
              <Award size={48} className="text-[#C9A227] mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Grow Your Business?</h2>
              <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
                Join Pakistan's most trusted visa consultant platform today. Free forever. No credit card required.
              </p>
              <Link href="/register/consultant"
                className="inline-flex items-center gap-2 bg-[#C9A227] text-[#1B3060] font-bold px-10 py-4 rounded-2xl hover:bg-[#b8911f] transition-all duration-200 text-lg shadow-lg shadow-[#C9A227]/30">
                Create Your Free Profile <ArrowRight size={20} />
              </Link>
              <p className="text-blue-300 text-sm mt-4">
                Already a member?{' '}
                <Link href="/login" className="text-[#C9A227] hover:underline">Log in here</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
<Footer />
    </main>
  )
}