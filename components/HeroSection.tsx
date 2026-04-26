'use client'

import Link from 'next/link'
import { Search, MapPin, ChevronDown } from 'lucide-react'

const QUICK_FILTERS = ['Student Visa', 'UK Visa', 'Fast Processing', 'Business Visa', 'Family Visa']

export default function HeroSection() {
  return (
    <section className="relative bg-navy overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-image.jpg')", backgroundColor: '#1B3060' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(27,48,96,0.92) 0%, rgba(15,30,61,0.85) 100%)' }} />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Glowing orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #4B78C8 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-24 lg:py-36 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
          style={{ background: 'rgba(201,162,39,0.1)', borderColor: 'rgba(201,162,39,0.3)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="font-body text-xs font-semibold text-gold tracking-wide">
            Pakistan's Trusted Visa Consultancy Platform
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-heading font-extrabold text-white text-4xl lg:text-6xl leading-[1.1] mb-4 tracking-tight">
          Find Trusted{' '}
          <span className="relative inline-block">
            <span style={{ color: '#C9A227' }}>Visa Consultants</span>
            <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
              <path d="M0 5 Q50 0 100 5 Q150 10 200 5" fill="none" stroke="#C9A227" strokeWidth="2" opacity="0.6"/>
            </svg>
          </span>
          <br />in Pakistan
        </h1>

        {/* Urdu tagline */}
        <p className="font-urdu text-gold/70 text-lg mb-3">
          پاکستان میں قابل اعتماد ویزا کنسلٹنٹ تلاش کریں
        </p>

        {/* Sub */}
        <p className="font-body text-white/60 text-base max-w-xl mx-auto mb-10 leading-relaxed">
          Find the Right Consultant. Get Expert Advice. Get Your Visa Faster.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {[
            { num: '5000+', label: 'Consultants' },
            { num: '10,000+', label: 'Applications' },
            { num: '4.8★', label: 'Average Rating' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-5">
              <div className="text-center">
                <span className="font-heading font-extrabold text-white text-lg">{s.num}</span>
                <span className="font-body text-white/50 text-xs ml-2">{s.label}</span>
              </div>
              {i < 2 && <div className="w-px h-4 bg-white/15" />}
            </div>
          ))}
        </div>

        {/* Search box */}
        <div className="bg-white rounded-2xl p-2 max-w-3xl mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)] mb-5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input type="text" placeholder="Search destination, country or consultant..."
                className="font-body w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
            </div>
            <div className="hidden sm:block w-px bg-gray-100 my-2" />
            <div className="flex items-center gap-2 px-4 py-3 sm:w-44">
              <MapPin size={15} className="text-gold shrink-0" />
              <select className="font-body w-full text-sm text-gray-600 outline-none bg-transparent appearance-none cursor-pointer">
                <option value="">All Visa Types</option>
                {['Student Visa', 'Work Permit', 'Visit Visa', 'Family Visa', 'Business Visa'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <ChevronDown size={13} className="text-gray-400 shrink-0" />
            </div>
            <Link href="/consultants"
              className="font-heading font-bold text-sm text-white px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
              <Search size={15} /> Search
            </Link>
          </div>
        </div>

        {/* Quick filter chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-body text-white/40 text-xs">Quick filters:</span>
          {QUICK_FILTERS.map(tag => (
            <Link key={tag} href={`/consultants?type=${encodeURIComponent(tag)}`}
              className="font-body text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70 hover:border-gold/50 hover:text-gold hover:bg-gold/10 transition-all duration-200">
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}