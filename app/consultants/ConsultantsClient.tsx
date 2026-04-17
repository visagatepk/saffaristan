'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, MapPin, Star, Phone, BadgeCheck,
  ChevronDown, SlidersHorizontal, X, Briefcase, Heart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const VISA_TYPES = [
  'Student Visa', 'Work Permit', 'Visit Visa', 'Family Visa',
  'Business Visa', 'Tourist Visa', 'PR Canada', 'UK Visa',
  'Schengen', 'Umrah Visa',
]
const DESTINATIONS = [
  'Canada', 'United Kingdom', 'United States', 'Australia',
  'UAE', 'Saudi Arabia', 'Germany', 'Turkey', 'Malaysia',
]
const FALLBACK_CITIES = [
  'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi',
  'Peshawar', 'Quetta', 'Multan',
]
const GRADIENTS = [
  'from-blue-900 to-blue-700',
  'from-[#1B3060] to-blue-800',
  'from-slate-800 to-blue-900',
  'from-indigo-900 to-blue-800',
  'from-[#1B3060] to-indigo-800',
  'from-blue-950 to-slate-700',
]

export default function ConsultantsClient({ searchParams }: { searchParams: any }) {
  const [consultants, setConsultants] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [dbCities, setDbCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.q || '')
  const [selectedCity, setSelectedCity] = useState(searchParams.city || '')
  const [selectedType, setSelectedType] = useState(searchParams.type || '')
  const [selectedDest, setSelectedDest] = useState(searchParams.destination || '')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [cRes, sRes, rRes] = await Promise.all([
        supabase.from('profiles')
          .select('id, display_name, business_name, city, avatar_url, years_experience, bio, whatsapp_number, phone, is_verified, verification_status, oep_license_number, created_at, is_beoe_verified, is_oep_verified, is_secp_verified, is_fbr_verified')
          .eq('role', 'consultant').eq('verification_status', 'active')
          .order('created_at', { ascending: false }),
        supabase.from('services')
          .select('consultant_id, title, visa_type, destination_country, price_min')
          .eq('is_active', true),
        supabase.from('reviews')
          .select('consultant_id, rating').eq('is_approved', true),
      ])
      setConsultants(cRes.data || [])
      setServices(sRes.data || [])
      setReviews(rRes.data || [])
      setDbCities([...new Set((cRes.data || []).map((p: any) => p.city).filter(Boolean))] as string[])
      setLoading(false)
    }
    load()
  }, [])

  const cityList = dbCities.length > 0 ? dbCities : FALLBACK_CITIES

  const enriched = useMemo(() => {
    return consultants.map((c, i) => {
      const cs = services.filter((s) => s.consultant_id === c.id)
      const cr = reviews.filter((r) => r.consultant_id === c.id)
      const avg = cr.length > 0 ? cr.reduce((s: number, r: any) => s + r.rating, 0) / cr.length : 0
      const prices = cs.map((s: any) => s.price_min || 0).filter((p: number) => p > 0)
      return {
        ...c,
        reviewCount: cr.length,
        avgRating: Math.round(avg * 10) / 10,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        visaTypes: [...new Set(cs.map((s: any) => s.visa_type).filter(Boolean))],
        destinations: [...new Set(cs.map((s: any) => s.destination_country).filter(Boolean))],
        gradient: GRADIENTS[i % GRADIENTS.length],
      }
    })
  }, [consultants, services, reviews])

  const filtered = useMemo(() => {
    let r = [...enriched]
    if (query) {
      const q = query.toLowerCase()
      r = r.filter((c) =>
        c.display_name?.toLowerCase().includes(q) ||
        c.business_name?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.visaTypes.some((t: any) => String(t).toLowerCase().includes(q)) ||
        c.destinations.some((d: any) => String(d).toLowerCase().includes(q))
      )
    }
    if (selectedCity) r = r.filter((c) => c.city === selectedCity)
    if (selectedType) r = r.filter((c) => c.visaTypes.some((t: any) => String(t).toLowerCase().includes(selectedType.toLowerCase())))
    if (selectedDest) r = r.filter((c) => c.destinations.some((d: any) => String(d).toLowerCase().includes(selectedDest.toLowerCase())))
    if (sortBy === 'rating') r.sort((a, b) => b.avgRating - a.avgRating)
    else if (sortBy === 'reviews') r.sort((a, b) => b.reviewCount - a.reviewCount)
    else if (sortBy === 'experience') r.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0))
    return r
  }, [enriched, query, selectedCity, selectedType, selectedDest, sortBy])

  const activeCount = [selectedCity, selectedType, selectedDest].filter(Boolean).length
  const clearAll = () => { setSelectedCity(''); setSelectedType(''); setSelectedDest(''); setQuery('') }
  const toggleSave = (id: string) => setSavedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])
  const getInitials = (n: string | null) => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'VC'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-navy py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h1 className="font-heading font-bold text-white text-3xl lg:text-4xl mb-2">Find Visa Consultants</h1>
          <p className="font-body text-white/60 text-base mb-8">
            {loading ? 'Loading...' : `${filtered.length} verified consultants across Pakistan`}
          </p>
          <div className="bg-white rounded-2xl p-2 max-w-3xl shadow-lg">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-2.5">
                <Search size={17} className="text-gray-400 shrink-0" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, visa type, destination..."
                  className="font-body w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
                {query && <button onClick={() => setQuery('')}><X size={14} className="text-gray-400" /></button>}
              </div>
              <div className="hidden sm:block w-px bg-gray-200 my-2" />
              <div className="flex items-center gap-2 px-4 py-2.5 sm:w-44">
                <MapPin size={15} className="text-gold shrink-0" />
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                  className="font-body w-full text-sm text-gray-600 outline-none bg-transparent appearance-none cursor-pointer">
                  <option value="">All Cities</option>
                  {cityList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} className="text-gray-400 shrink-0" />
              </div>
              <button className="font-heading font-bold text-sm bg-gold hover:bg-gold-dark text-white px-7 py-3 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap">
                <Search size={15} /> Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <button onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-navy" />
                <span className="font-heading font-semibold text-navy text-sm">Filters</span>
                {activeCount > 0 && <span className="bg-gold text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {activeCount > 0 && (
                <div className="bg-gold-light border border-gold/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading font-semibold text-navy text-xs">Active ({activeCount})</span>
                    <button onClick={clearAll} className="font-body text-xs text-gold">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { val: selectedCity, clear: () => setSelectedCity('') },
                      { val: selectedType, clear: () => setSelectedType('') },
                      { val: selectedDest, clear: () => setSelectedDest('') },
                    ].filter(f => f.val).map(f => (
                      <span key={f.val} className="flex items-center gap-1 bg-white text-navy text-xs font-medium px-2.5 py-1 rounded-full border border-navy/20">
                        {f.val} <button onClick={f.clear}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {[
                { title: 'City', items: cityList, selected: selectedCity, onSelect: setSelectedCity },
                { title: 'Visa Type', items: VISA_TYPES, selected: selectedType, onSelect: setSelectedType },
                { title: 'Destination', items: DESTINATIONS, selected: selectedDest, onSelect: setSelectedDest },
              ].map(g => (
                <div key={g.title} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-heading font-bold text-navy text-sm mb-4">{g.title}</h3>
                  <div className="space-y-2.5">
                    {g.items.map(item => (
                      <div key={item} className="flex items-center gap-3 cursor-pointer" onClick={() => g.onSelect(g.selected === item ? '' : item)}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${g.selected === item ? 'bg-navy border-navy' : 'border-gray-300 hover:border-navy'}`}>
                          {g.selected === item && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span className="font-body text-sm text-gray-600 hover:text-navy transition-colors">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="font-body text-sm text-gray-500">
                <span className="font-semibold text-navy">{filtered.length}</span> consultants found
                {selectedCity && <> in <span className="font-semibold text-navy">{selectedCity}</span></>}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-gray-400">Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="font-body text-sm text-navy border border-gray-200 rounded-lg px-3 py-1.5 outline-none bg-white">
                  <option value="newest">Newest</option>
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin mx-auto mb-4" />
                <p className="font-body text-gray-500 text-sm">Loading consultants...</p>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gold/40 hover:shadow-md transition-all">
                    {/* Banner */}
                    <div className={`relative h-44 bg-gradient-to-br ${c.gradient} overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-2 border-white" />
                        <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border border-white" />
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <div className="mb-1">
                          {c.visaTypes.slice(0, 2).map((t: any) => (
                            <span key={String(t)} className="inline-block mr-1.5 mb-1 bg-white/20 backdrop-blur-sm text-white text-xs font-body font-medium px-2.5 py-0.5 rounded-full border border-white/30">{String(t)}</span>
                          ))}
                        </div>
                        <h3 className="font-heading font-bold text-white text-base leading-tight">{c.business_name || c.display_name}</h3>
                      </div>
                      <button onClick={() => toggleSave(c.id)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${savedIds.includes(c.id) ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/40'}`}>
                        <Heart size={14} className={savedIds.includes(c.id) ? 'fill-white' : ''} />
                      </button>
                      {c.is_verified && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          <BadgeCheck size={11} /> Verified
                        </div>
                      )}
                      {c.oep_license_number && (
                        <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm text-white/80 text-xs font-mono px-2 py-0.5 rounded">{c.oep_license_number}</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center text-white font-heading font-bold text-sm shrink-0 border-2 border-white shadow-sm -mt-7 relative z-10">
                          {getInitials(c.display_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading font-bold text-navy text-sm leading-tight truncate">{c.display_name || 'Visa Consultant'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {c.city && <span className="flex items-center gap-1 text-gray-400 text-xs"><MapPin size={11} className="text-gold" />{c.city}</span>}
                            {c.years_experience > 0 && <span className="flex items-center gap-1 text-gray-400 text-xs"><Briefcase size={11} />{c.years_experience} yrs</span>}
                          </div>
                        </div>
                      </div>

                      {c.bio && <p className="font-body text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{c.bio}</p>}

                      {/* Verification Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {c.is_beoe_verified && (
                          <span className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            <BadgeCheck size={10} /> BEOE
                          </span>
                        )}
                        {c.is_oep_verified && (
                          <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            <BadgeCheck size={10} /> OEP
                          </span>
                        )}
                        {c.is_secp_verified && (
                          <span className="flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            <BadgeCheck size={10} /> SECP
                          </span>
                        )}
                        {c.is_fbr_verified && (
                          <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            <BadgeCheck size={10} /> FBR
                          </span>
                        )}
                      </div>

                      {c.destinations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {c.destinations.slice(0, 3).map((d: any) => (
                            <span key={String(d)} className="font-body text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">{String(d)}</span>
                          ))}
                        </div>
                      )}

                      <div className="h-px bg-gray-100 my-3" />

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          {c.avgRating > 0 ? (
                            <>
                              <Star size={13} className="text-gold fill-gold" />
                              <span className="font-heading font-bold text-navy text-sm">{c.avgRating}</span>
                              <span className="font-body text-gray-400 text-xs">({c.reviewCount})</span>
                            </>
                          ) : (
                            <span className="font-body text-xs text-gray-400">New consultant</span>
                          )}
                        </div>
                        <div className="text-right">
                          {c.minPrice > 0 ? (
                            <>
                              <span className="font-body text-xs text-gray-400">From </span>
                              <span className="font-heading font-bold text-navy text-base">PKR {c.minPrice.toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="font-body text-xs text-gold font-semibold">Free consultation</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/consultants/${c.id}`}
                          className="flex-1 text-center font-heading text-xs font-bold bg-navy hover:bg-navy-dark text-white py-2.5 rounded-xl transition-colors">
                          View Profile
                        </Link>
                        {(c.whatsapp_number || c.phone) && (
                          <a href={`https://wa.me/${(c.whatsapp_number || c.phone || '').replace(/\D/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                            <Phone size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="font-heading font-bold text-navy text-xl mb-2">No consultants found</h3>
                <p className="font-body text-gray-500 text-sm mb-6 max-w-xs mx-auto">Try adjusting your filters or search differently</p>
                <button onClick={clearAll}
                  className="font-heading font-semibold text-sm text-navy border border-navy px-6 py-2.5 rounded-xl hover:bg-navy hover:text-white transition-colors">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}