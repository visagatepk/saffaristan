'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, MapPin, ChevronDown } from 'lucide-react'

interface HeroClientProps {
  cities: string[]
}

export default function HeroClient({ cities }: HeroClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (city) params.set('city', city)
    router.push(`/consultants?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <section className="relative bg-navy overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/hero-image.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlays */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10, 15, 40, 0.75)' }} />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(27, 48, 96, 0.65)' }} />

      {/* Subtle decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full border border-white/5 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full border border-white/5 -translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-24 lg:py-36 text-center">

        {/* Top badge */}
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-xs font-body font-semibold px-4 py-2 rounded-full mb-8">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9A227">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Pakistan's Most Trusted Visa Consultant Directory
        </div>

        {/* Heading */}
        <h1 className="font-heading font-extrabold text-white text-4xl lg:text-6xl leading-tight mb-4">
          Find Trusted{' '}
          <span className="text-gold">Visa Consultants</span>
          {' '}in
          <br />Pakistan
        </h1>

        {/* Urdu tagline */}
        <p
          className="font-urdu text-lg mb-4"
          style={{ color: '#F5D76E' }}
        >
          پاکستان کا پہلا تصدیق شدہ ویزا کنسلٹنٹ پلیٹ فارم
        </p>

        {/* Subheading */}
        <p className="font-body text-white/60 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          Compare 5000+ authenticated immigration experts.
          Real reviews. Direct contact. Zero fraud.
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-2xl p-2 max-w-3xl mx-auto mb-12 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-2">

            {/* Search input */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search visa type, country, consultant..."
                className="font-body w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-gray-200 my-2" />

            {/* City dropdown — dynamic from DB */}
            <div className="flex items-center gap-2 px-4 py-3 sm:w-48">
              <MapPin size={16} className="text-gold shrink-0" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="font-body w-full text-sm text-gray-600 outline-none bg-transparent appearance-none cursor-pointer"
              >
                <option value="">All Cities</option>
                {cities.length > 0 ? (
                  // Dynamic cities from database
                  cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))
                ) : (
                  // Fallback cities if no consultants yet
                  <>
                    <option>Islamabad</option>
                    <option>Rawalpindi</option>
                    <option>Lahore</option>
                    <option>Karachi</option>
                    <option>Peshawar</option>
                    <option>Quetta</option>
                    <option>Multan</option>
                    <option>Faisalabad</option>
                    <option>Hyderabad</option>
                    <option>Sargodha</option>
                  </>
                )}
              </select>
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="font-heading font-bold text-sm bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search size={16} />
              Search
            </button>
          </div>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center gap-2 px-4 pt-2 pb-1">
            <span className="font-body text-xs text-gray-400">Popular:</span>
            {['Student Visa', 'Work Permit', 'Visit Visa', 'PR Canada', 'UK Visa', 'Schengen'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag)
                  router.push(`/consultants?q=${encodeURIComponent(tag)}`)
                }}
                className="font-body text-xs text-navy bg-navy-light hover:bg-navy hover:text-white px-3 py-1 rounded-full transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {[
            { number: '500+', label: 'Verified Consultants' },
            { number: '10,000+', label: 'Success Stories' },
            { number: '4.8★', label: 'Average Rating' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-8">
              <div className="text-center">
                <div className="font-heading font-extrabold text-white text-2xl lg:text-3xl">
                  {stat.number}
                </div>
                <div className="font-body text-white/50 text-xs mt-1">
                  {stat.label}
                </div>
              </div>
              {i < 2 && (
                <div className="hidden lg:block w-px h-8 bg-white/15" />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}