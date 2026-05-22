// app/scholarships/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VideoLibrary from '@/components/how-it-works/VideoLibrary'
import { ExternalLink, GraduationCap, ArrowRight, BookOpen } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Scholarship type + data — inline so no external data/ dependency needed.
// To refactor later: move to data/scholarships.ts and import from there.
// ─────────────────────────────────────────────────────────────────────────────
interface Scholarship {
  id: string
  flag: string
  countryCode: string
  name: string
  country: string
  type: string
  externalUrl: string
}

const SCHOLARSHIPS: Scholarship[] = [
  { id: 's1', flag: '🇬🇧', countryCode: 'GB', name: 'Chevening Scholarship',    country: 'United Kingdom', type: 'Fully Funded',       externalUrl: 'https://www.chevening.org/' },
  { id: 's2', flag: '🇬🇧', countryCode: 'GB', name: 'Commonwealth Scholarship', country: 'United Kingdom', type: 'Postgraduate',        externalUrl: 'https://cscuk.fcdo.gov.uk/' },
  { id: 's3', flag: '🇨🇦', countryCode: 'CA', name: 'Canada Study Permit',      country: 'Canada',         type: 'Student Visa',        externalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html' },
  { id: 's4', flag: '🇦🇺', countryCode: 'AU', name: 'Australia Awards',          country: 'Australia',      type: 'Fully Funded',       externalUrl: 'https://www.australiaawards.gov.au/' },
  { id: 's5', flag: '🇩🇪', countryCode: 'DE', name: 'DAAD Scholarship',          country: 'Germany',        type: 'Research / Masters', externalUrl: 'https://www.daad.de/en/' },
  { id: 's6', flag: '🇺🇸', countryCode: 'US', name: 'Fulbright Scholarship',     country: 'USA',            type: 'Fully Funded',       externalUrl: 'https://www.fulbright.edu.pk/' },
  { id: 's7', flag: '🇳🇱', countryCode: 'NL', name: 'Holland Scholarship',       country: 'Netherlands',    type: 'Undergraduate',      externalUrl: 'https://www.studyinholland.nl/finances/holland-scholarship' },
  { id: 's8', flag: '🇳🇿', countryCode: 'NZ', name: 'NZ ASEAN Scholarship',      country: 'New Zealand',    type: 'Fully Funded',       externalUrl: 'https://www.mfat.govt.nz/en/aid-and-development/new-zealand-scholarships/' },
]

// Badge color per scholarship type
const TYPE_STYLES: Record<string, string> = {
  'Fully Funded':       'bg-green-100 text-green-700 border-green-200',
  'Postgraduate':       'bg-purple-100 text-purple-700 border-purple-200',
  'Student Visa':       'bg-blue-100 text-blue-700 border-blue-200',
  'Research / Masters': 'bg-orange-100 text-orange-700 border-orange-200',
  'Undergraduate':      'bg-pink-100 text-pink-700 border-pink-200',
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Scholarships for Pakistanis 2026 — Fully Funded & Partial',
  description: 'Explore Chevening, Commonwealth, Fulbright, DAAD and more scholarships for Pakistani students. Our verified consultants guide you through every application.',
  alternates: { canonical: 'https://visagate.pk/scholarships' },
  openGraph: {
    title: 'Scholarships for Pakistanis 2026 — VisaGate.pk',
    description: 'Fully funded and partial scholarships from UK, Canada, Australia, Germany, USA and more. Verified consultant guidance available.',
    url: 'https://visagate.pk/scholarships',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'Scholarships for Pakistanis' }],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ScholarshipsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Navbar />

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-navy relative overflow-hidden pt-[calc(64px+2.5rem)] pb-12 px-6">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-5">
            <GraduationCap size={13} className="text-gold" />
            <span className="font-body text-xs font-semibold text-gold tracking-wide">
              Scholarship Resources
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-white text-4xl lg:text-5xl leading-tight mb-4">
            Scholarships for <span className="text-gold">Pakistanis</span>
          </h1>

          <p className="font-body text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Explore fully funded and partial scholarships from top countries. Our verified
            consultants can guide you through the application process.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SCHOLARSHIP CARDS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
          {SCHOLARSHIPS.map((s: Scholarship) => (
            <a
              key={s.id}
              href={s.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col relative"
            >
              {/* External link icon */}
              <div className="absolute top-4 right-4 w-7 h-7 bg-gray-100 group-hover:bg-navy rounded-lg flex items-center justify-center transition-colors">
                <ExternalLink size={12} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>

              {/* Flag + country code */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{s.flag}</span>
                <span className="font-heading font-bold text-gray-400 text-xs tracking-widest">{s.countryCode}</span>
              </div>

              {/* Icon */}
              <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap size={18} className="text-navy" />
              </div>

              {/* Name + country */}
              <h3 className="font-heading font-bold text-navy text-sm leading-snug mb-1">
                {s.name}
              </h3>
              <p className="font-body text-gray-400 text-xs mb-4">{s.country}</p>

              {/* Type badge */}
              <div className="mt-auto">
                <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  TYPE_STYLES[s.type] || 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {s.type}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-navy rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
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
            <p className="font-body text-white/70 text-base mb-4">
              Need help applying for a scholarship? Talk to a verified consultant.
            </p>
            <Link
              href="/consultants"
              className="inline-flex items-center gap-2 bg-gold text-white font-heading font-bold text-sm px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors"
            >
              Find a Consultant <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SCHOLARSHIP VIDEO GUIDES
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-4">
              <BookOpen size={12} className="text-gold" />
              <span className="font-body text-xs font-semibold text-gold tracking-wide uppercase">
                Video Guides
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-navy text-3xl lg:text-4xl mb-3">
              Scholarship <span className="text-gold">Guides</span>
            </h2>
            <p className="font-body text-gray-500 text-base max-w-xl mx-auto">
              Watch our step-by-step video guides for scholarship applications.
            </p>
          </div>

          <VideoLibrary initialCategory="Scholarship" hideFilters />
        </div>
      </div>

      <Footer />
    </div>
  )
}