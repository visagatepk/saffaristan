'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Play, UserPlus, Search, BookOpen, GraduationCap,
  Globe, ChevronRight, ExternalLink, Users, Briefcase,
  CheckCircle, ArrowRight, BookMarked, Landmark, Award
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface VideoCard {
  id: string
  title: string
  description: string
  youtubeId: string        // ← replace with real YouTube video IDs
  duration: string
  category: 'platform' | 'seeker' | 'consultant' | 'scholarship'
}

interface GuideCard {
  icon: React.ReactNode
  title: string
  country: string
  flag: string
  tag: string
  link: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Data — swap youtubeId values with your real video IDs when uploaded
// ─────────────────────────────────────────────────────────────────────────────
const VIDEOS: VideoCard[] = [
  {
    id: 'v1',
    title: 'Welcome to VisaGate.pk',
    description: "A full introduction to Pakistan's first verified visa consultant platform — what it is, how it works, and who it is for.",
    youtubeId: 'REPLACE_WITH_YOUTUBE_ID',
    duration: '3:20',
    category: 'platform',
  },
  {
    id: 'v2',
    title: 'How to Sign Up as a Seeker',
    description: 'Step-by-step walkthrough of creating your seeker account, setting up your profile, and finding the right visa consultant.',
    youtubeId: 'REPLACE_WITH_YOUTUBE_ID',
    duration: '4:15',
    category: 'seeker',
  },
  {
    id: 'v3',
    title: 'How to Find & Book a Consultant',
    description: 'Learn how to search, filter, read profiles, and book an appointment with a verified consultant in minutes.',
    youtubeId: 'REPLACE_WITH_YOUTUBE_ID',
    duration: '5:00',
    category: 'seeker',
  },
  {
    id: 'v4',
    title: 'How to Register as a Consultant',
    description: 'Complete guide for visa consultants — create your profile, list your services, and get your verification badge.',
    youtubeId: 'REPLACE_WITH_YOUTUBE_ID',
    duration: '6:30',
    category: 'consultant',
  },
  {
    id: 'v5',
    title: 'Managing Your Consultant Dashboard',
    description: 'Tour of the consultant dashboard — appointments, messaging, analytics, and managing your service listings.',
    youtubeId: 'REPLACE_WITH_YOUTUBE_ID',
    duration: '7:00',
    category: 'consultant',
  },
  {
    id: 'v6',
    title: 'UK Scholarships for Pakistanis 2025',
    description: 'Complete guide to Chevening, Commonwealth, and UK university scholarships available for Pakistani students.',
    youtubeId: 'REPLACE_WITH_YOUTUBE_ID',
    duration: '8:45',
    category: 'scholarship',
  },
  {
    id: 'v7',
    title: 'Canada Study Permit & Scholarships',
    description: 'How to apply for a Canadian study permit and a breakdown of scholarships available for Pakistani students.',
    youtubeId: 'REPLACE_WITH_YOUTUBE_ID',
    duration: '9:10',
    category: 'scholarship',
  },
  {
    id: 'v8',
    title: 'Australia & New Zealand Scholarships',
    description: 'Australia Awards and New Zealand ASEAN scholarships — eligibility, how to apply, and tips for Pakistani applicants.',
    youtubeId: 'REPLACE_WITH_YOUTUBE_ID',
    duration: '7:55',
    category: 'scholarship',
  },
]

const GUIDES: GuideCard[] = [
  { icon: <GraduationCap size={20} />, title: 'Chevening Scholarship', country: 'United Kingdom', flag: '🇬🇧', tag: 'Fully Funded', link: 'https://www.chevening.org' },
  { icon: <Award size={20} />, title: 'Commonwealth Scholarship', country: 'United Kingdom', flag: '🇬🇧', tag: 'Postgraduate', link: 'https://cscuk.fcdo.gov.uk' },
  { icon: <GraduationCap size={20} />, title: 'Canada Study Permit', country: 'Canada', flag: '🇨🇦', tag: 'Student Visa', link: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html' },
  { icon: <Award size={20} />, title: 'Australia Awards', country: 'Australia', flag: '🇦🇺', tag: 'Fully Funded', link: 'https://www.australiaawards.gov.au' },
  { icon: <Landmark size={20} />, title: 'DAAD Scholarship', country: 'Germany', flag: '🇩🇪', tag: 'Research / Masters', link: 'https://www.daad.de/en' },
  { icon: <GraduationCap size={20} />, title: 'Fulbright Scholarship', country: 'USA', flag: '🇺🇸', tag: 'Fully Funded', link: 'https://www.usefpakistan.org' },
  { icon: <Award size={20} />, title: 'Holland Scholarship', country: 'Netherlands', flag: '🇳🇱', tag: 'Undergraduate', link: 'https://www.studyinholland.nl/scholarships/holland-scholarship' },
  { icon: <BookMarked size={20} />, title: 'NZ ASEAN Scholarship', country: 'New Zealand', flag: '🇳🇿', tag: 'Fully Funded', link: 'https://www.universitiesnz.ac.nz/scholarships' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Tab config
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',         label: 'All Videos',       icon: <Play size={15} /> },
  { key: 'platform',   label: 'Platform Intro',    icon: <Globe size={15} /> },
  { key: 'seeker',     label: 'For Seekers',        icon: <Search size={15} /> },
  { key: 'consultant', label: 'For Consultants',   icon: <Briefcase size={15} /> },
  { key: 'scholarship',label: 'Scholarships',      icon: <GraduationCap size={15} /> },
] as const

type TabKey = (typeof TABS)[number]['key']

// ─────────────────────────────────────────────────────────────────────────────
// YouTube embed component
// ─────────────────────────────────────────────────────────────────────────────
function YouTubeCard({ video }: { video: VideoCard }) {
  const [loaded, setLoaded] = useState(false)

  const categoryColor: Record<VideoCard['category'], string> = {
    platform:    'bg-[#1B3060]/10 text-[#1B3060]',
    seeker:      'bg-blue-50 text-blue-700',
    consultant:  'bg-[#C9A227]/15 text-[#9a7a1c]',
    scholarship: 'bg-green-50 text-green-700',
  }
  const categoryLabel: Record<VideoCard['category'], string> = {
    platform:    'Platform',
    seeker:      'For Seekers',
    consultant:  'For Consultants',
    scholarship: 'Scholarship',
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Embed */}
      <div className="relative aspect-video bg-[#0f1f45] overflow-hidden">
        {video.youtubeId === 'REPLACE_WITH_YOUTUBE_ID' ? (
          /* Placeholder until real ID is added */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#C9A227]/20 border-2 border-[#C9A227]/40 flex items-center justify-center">
              <Play size={24} className="text-[#C9A227] ml-1" />
            </div>
            <p className="text-blue-200 text-xs font-medium">Video coming soon</p>
          </div>
        ) : !loaded ? (
          /* Thumbnail click-to-load */
          <button
            onClick={() => setLoaded(true)}
            className="absolute inset-0 w-full h-full group"
          >
            <img
              src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="w-16 h-16 rounded-full bg-[#C9A227] flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                <Play size={28} className="text-white ml-1" />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded">
              {video.duration}
            </span>
          </button>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor[video.category]}`}>
            {categoryLabel[video.category]}
          </span>
          <span className="text-xs text-gray-400">{video.duration}</span>
        </div>
        <h3 className="font-bold text-[#1B3060] text-base leading-snug mb-2">{video.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed flex-1">{video.description}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const filtered = activeTab === 'all'
    ? VIDEOS
    : VIDEOS.filter(v => v.category === activeTab)

  return (
    <main className="bg-white">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0f1f45] pt-24 pb-28 overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A227 1px, transparent 0)', backgroundSize: '44px 44px' }}
        />
        {/* Gold glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/30 text-[#C9A227] text-sm font-semibold px-4 py-2 rounded-full mb-7">
            <Play size={14} />
            Video Guides & Resources
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
            How VisaGate<span className="text-[#C9A227]"> Works</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Step-by-step video guides for seekers and consultants — plus scholarship resources and country-specific visa guidance for Pakistanis.
          </p>

          {/* Quick links */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: 'Platform Intro', tab: 'platform' as TabKey },
              { label: 'For Seekers', tab: 'seeker' as TabKey },
              { label: 'For Consultants', tab: 'consultant' as TabKey },
              { label: 'Scholarships', tab: 'scholarship' as TabKey },
            ].map(item => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STEPS OVERVIEW ────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: <UserPlus size={26} className="text-white" />,
                title: 'Create Your Account',
                desc: 'Sign up as a seeker or consultant in under 5 minutes. No documents needed to get started.',
                cta: 'Sign Up Free',
                href: '/register',
                color: 'from-[#1B3060] to-[#2d4a8a]',
              },
              {
                step: '02',
                icon: <Search size={26} className="text-white" />,
                title: 'Find the Right Consultant',
                desc: 'Browse verified consultants by city, visa type, price, and rating. Message directly before booking.',
                cta: 'Browse Consultants',
                href: '/consultants',
                color: 'from-[#1B3060] to-[#2d4a8a]',
              },
              {
                step: '03',
                icon: <CheckCircle size={26} className="text-white" />,
                title: 'Book & Get Guided',
                desc: 'Book an appointment, receive expert guidance, and get your visa application sorted with confidence.',
                cta: 'See How It Works',
                href: '#videos',
                color: 'from-[#C9A227] to-[#b8911f]',
              },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-7 overflow-hidden group">
                <div className="absolute top-4 right-5 text-5xl font-black text-gray-50 select-none leading-none">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-sm`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#1B3060] text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{item.desc}</p>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A227] hover:text-[#b8911f] transition-colors"
                >
                  {item.cta} <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO LIBRARY ─────────────────────────────────────────────────── */}
      <section id="videos" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center mb-10">
            <div className="inline-block bg-[#1B3060]/10 text-[#1B3060] text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Video Library
            </div>
            <h2 className="text-4xl font-bold text-[#1B3060] mb-3">
              Watch & <span className="text-[#C9A227]">Learn</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              All our guides in one place — from platform basics to scholarship walkthroughs.
            </p>
          </div>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#1B3060] text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-[#1B3060]'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {tab.key === 'all' ? VIDEOS.length : VIDEOS.filter(v => v.category === tab.key).length}
                </span>
              </button>
            ))}
          </div>

          {/* Video grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(video => (
              <YouTubeCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHOLARSHIP RESOURCES ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-50 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Scholarship Resources
            </div>
            <h2 className="text-4xl font-bold text-[#1B3060] mb-3">
              Scholarships for <span className="text-[#C9A227]">Pakistanis</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Explore fully funded and partial scholarships from top countries. Our verified consultants can guide you through the application process.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GUIDES.map((guide, i) => (
              <a
                key={i}
                href={guide.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#C9A227]/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B3060]/10 flex items-center justify-center text-[#1B3060]">
                    {guide.icon}
                  </div>
                  <span className="text-2xl">{guide.flag}</span>
                </div>
                <h3 className="font-bold text-[#1B3060] text-sm mb-1 leading-snug">{guide.title}</h3>
                <p className="text-gray-400 text-xs mb-3">{guide.country}</p>
                <div className="flex items-center justify-between">
                  <span className="bg-[#C9A227]/15 text-[#9a7a1c] text-xs font-semibold px-2.5 py-1 rounded-full">
                    {guide.tag}
                  </span>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-[#C9A227] transition-colors" />
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-400 text-sm mb-4">
              Need help applying for a scholarship? Talk to a verified consultant.
            </p>
            <Link
              href="/consultants"
              className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#243d7a] transition-colors text-sm"
            >
              <Users size={17} />
              Find a Consultant
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Seekers */}
            <div className="bg-gradient-to-br from-[#1B3060] to-[#243d7a] rounded-3xl p-8 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                <Search size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">I'm Looking for a Consultant</h3>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                Browse hundreds of verified visa consultants across Pakistan. Filter by city, visa type, price, and ratings.
              </p>
              <div className="space-y-2 mb-6">
                {['Free to browse and compare', 'Message before you book', 'Read real client reviews'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-[#C9A227] flex-shrink-0" />
                    <span className="text-sm text-blue-100">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/consultants"
                className="inline-flex items-center gap-2 bg-[#C9A227] text-[#1B3060] font-bold px-6 py-3 rounded-xl hover:bg-[#b8911f] transition-colors text-sm shadow-lg shadow-[#C9A227]/20"
              >
                Find a Consultant <ArrowRight size={17} />
              </Link>
            </div>

            {/* Consultants */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/15 flex items-center justify-center mb-5">
                <Briefcase size={24} className="text-[#C9A227]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1B3060] mb-3">I'm a Visa Consultant</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                List your services on Pakistan's most trusted platform. Get verified, reach new clients, and grow your business — free forever.
              </p>
              <div className="space-y-2 mb-6">
                {['Free to join, no commission', 'Official OEP/SECP verification', 'Real-time messaging & appointments'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-[#C9A227] flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/for-consultants"
                className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#243d7a] transition-colors text-sm"
              >
                Join as Consultant <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-[#1B3060] to-[#2d4a8a] rounded-3xl px-8 py-14 relative overflow-hidden shadow-xl shadow-[#1B3060]/20">
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A227 1px, transparent 0)', backgroundSize: '28px 28px' }}
            />
            <div className="relative">
              <BookOpen size={44} className="text-[#C9A227] mx-auto mb-5" />
              <h2 className="text-3xl font-bold text-white mb-3">
                Have More Questions?
              </h2>
              <p className="text-blue-200 mb-8 max-w-md mx-auto">
                Check our FAQs page for answers, or get in touch — our team typically responds within a few hours.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/faqs"
                  className="inline-flex items-center gap-2 bg-[#C9A227] text-[#1B3060] font-bold px-7 py-3.5 rounded-xl hover:bg-[#b8911f] transition-colors text-sm shadow-lg shadow-[#C9A227]/30"
                >
                  Read FAQs <ArrowRight size={17} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/20 border border-white/20 transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}