// app/how-it-works/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VideoLibrary from '@/components/how-it-works/VideoLibrary'
import {
  UserPlus, Search, CalendarCheck,
  PlayCircle, HelpCircle, ArrowRight,
  CheckCircle, BookOpen,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'How VisaGate Works — Video Guides & Resources',
  description: 'Step-by-step video guides for visa seekers and consultants. Learn how to find a consultant, book a session, and navigate the visa process with confidence.',
  alternates: { canonical: 'https://visagate.pk/how-it-works' },
  openGraph: {
    title: 'How VisaGate Works — VisaGate.pk',
    description: 'Step-by-step video guides for seekers and consultants — plus scholarship resources and country-specific visa guidance for Pakistanis.',
    url: 'https://visagate.pk/how-it-works',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'How VisaGate Works' }],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 3-step data
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up as a seeker or consultant in under 5 minutes. No documents required to get started.',
    cta: 'Sign Up Free',
    href: '/register',
  },
  {
    num: '02',
    icon: Search,
    title: 'Find the Right Consultant',
    description: 'Browse verified consultants by city, visa type, price, and rating. Message directly before booking.',
    cta: 'Browse Consultants',
    href: '/consultants',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Book & Get Guided',
    description: 'Book an appointment, receive expert guidance, and get your visa application submitted with confidence.',
    cta: 'See How It Works',
    href: '#video-library',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Navbar />

      {/* ════════════════════════════════════════════════════════════════════
          HERO — navy + white grid lines + gold glow (site standard)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-navy relative overflow-hidden pt-[calc(64px+2.5rem)] pb-12 px-6">

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Gold glow — top-right */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-5">
            <PlayCircle size={13} className="text-gold" />
            <span className="font-body text-xs font-semibold text-gold tracking-wide">
              Video Guides & Resources
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-heading font-extrabold text-white text-4xl lg:text-5xl leading-tight mb-4">
            How VisaGate <span className="text-gold">Works</span>
          </h1>

          <p className="font-body text-white/60 text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Step-by-step video guides for seekers and consultants — plus scholarship resources
            and country-specific visa guidance for Pakistanis.
          </p>

          {/* Tab pills — decorative navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Platform Intro', 'For Seekers', 'For Consultants', 'Scholarships'].map(tab => (
              <a
                key={tab}
                href="#video-library"
                className="font-body text-xs font-medium px-4 py-2 rounded-full border border-white/20 text-white/70 hover:border-gold/50 hover:text-gold transition-all"
              >
                {tab}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          3-STEP PROCESS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(step => (
            <div
              key={step.num}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 relative overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Large background step number */}
              <span className="absolute top-4 right-5 font-heading font-extrabold text-7xl text-gray-100 leading-none select-none pointer-events-none">
                {step.num}
              </span>

              {/* Icon */}
              <div className="w-12 h-12 bg-navy/5 rounded-2xl flex items-center justify-center mb-5 relative z-10">
                <step.icon size={22} className="text-navy" />
              </div>

              <h3 className="font-heading font-bold text-navy text-lg mb-3 relative z-10">
                {step.title}
              </h3>
              <p className="font-body text-gray-500 text-sm leading-relaxed mb-5 relative z-10">
                {step.description}
              </p>
              <Link
                href={step.href}
                className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-gold hover:text-gold/80 transition-colors relative z-10"
              >
                {step.cta} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          VIDEO LIBRARY
      ════════════════════════════════════════════════════════════════════ */}
      <div id="video-library" className="bg-white py-16 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-4">
              <BookOpen size={12} className="text-gold" />
              <span className="font-body text-xs font-semibold text-gold tracking-wide uppercase">Video Library</span>
            </div>
            <h2 className="font-heading font-extrabold text-navy text-3xl lg:text-4xl mb-3">
              Watch & <span className="text-gold">Learn</span>
            </h2>
            <p className="font-body text-gray-500 text-base max-w-xl mx-auto">
              All our guides in one place — from platform basics to scholarship walkthroughs.
            </p>
          </div>

          <VideoLibrary />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          DUAL CTA
      ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Seeker CTA */}
          <div className="bg-navy rounded-3xl p-8 relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}
            />
            <div className="relative">
              <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                <Search size={20} className="text-gold" />
              </div>
              <h3 className="font-heading font-bold text-white text-xl mb-4">
                I'm Looking for a Consultant
              </h3>
              <ul className="space-y-2.5 mb-6">
                {[
                  'Browse hundreds of verified consultants across Pakistan',
                  'Filter by city, visa type, price, and ratings',
                  'Message before you book',
                  'Read real client reviews',
                ].map(point => (
                  <li key={point} className="flex items-start gap-2.5 text-white/70 text-sm font-body">
                    <CheckCircle size={14} className="text-gold shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/consultants"
                className="inline-flex items-center gap-2 bg-gold text-white font-heading font-bold text-sm px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors"
              >
                Find a Consultant <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Consultant CTA */}
          <div className="bg-navy rounded-3xl p-8 relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }}
            />
            <div className="relative">
              <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                <UserPlus size={20} className="text-gold" />
              </div>
              <h3 className="font-heading font-bold text-white text-xl mb-4">
                I'm a Visa Consultant
              </h3>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Free to join, no commission",
                  'Official SECP/BEOE verification badge',
                  'Real-time messaging & appointments',
                  'Get listed in front of thousands of seekers',
                ].map(point => (
                  <li key={point} className="flex items-start gap-2.5 text-white/70 text-sm font-body">
                    <CheckCircle size={14} className="text-gold shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/for-consultants"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white font-heading font-bold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Join as Consultant <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          FAQ CTA BANNER
      ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-16">
        <div className="bg-navy rounded-3xl p-10 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
                'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={22} className="text-gold" />
            </div>
            <h3 className="font-heading font-bold text-white text-2xl mb-2">
              Have More Questions?
            </h3>
            <p className="font-body text-white/60 text-sm mb-6 max-w-md mx-auto">
              Check our FAQs page for answers, or get in touch — our team typically responds within a few hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/faqs"
                className="inline-flex items-center gap-2 bg-gold text-white font-heading font-bold text-sm px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors"
              >
                Read FAQs <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white font-heading font-bold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}