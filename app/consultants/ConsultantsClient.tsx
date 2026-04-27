'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, BadgeCheck, Heart, X, Clock, Filter, ArrowRight, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

// ─── Constants ───────────────────────────────────────────────────────────────

const VISA_TYPES = ['Student Visa','Work Permit','Visit Visa','Family Visa','Business Visa','PR & Immigration','Umrah Visa','Spouse Visa']

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_low',  label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'fastest',    label: 'Fastest Processing' },
]

const VISA_BADGE_COLORS: Record<string, string> = {
  'Student Visa':     '#4F46E5',
  'Work Permit':      '#7C3AED',
  'Visit Visa':       '#0891B2',
  'Family Visa':      '#D97706',
  'Business Visa':    '#DC2626',
  'PR & Immigration': '#059669',
  'Umrah Visa':       '#65A30D',
  'Spouse Visa':      '#DB2777',
  'Study Visa':       '#4F46E5',
  'Tourist Visa':     '#0891B2',
  'Work Visa':        '#7C3AED',
}

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #0f1e4a 0%, #1a3a7c 100%)',
  'linear-gradient(135deg, #0d2137 0%, #0e4d6e 100%)',
  'linear-gradient(135deg, #1a0533 0%, #3b0f6e 100%)',
  'linear-gradient(135deg, #0a2342 0%, #126396 100%)',
  'linear-gradient(135deg, #0d3349 0%, #0d6e6e 100%)',
  'linear-gradient(135deg, #1B3060 0%, #2d5bb5 100%)',
]

interface Service {
  id: string
  consultant_id: string
  title: string
  description: string
  visa_type: string
  destination_country: string
  price_min: number
  price_max: number
  processing_days: number
  image_url: string | null
  is_active: boolean
  created_at: string
  consultant?: {
    display_name: string
    full_name: string
    city: string
    is_verified: boolean
    avatar_url: string | null
    years_experience: number
    is_beoe_verified: boolean
    is_oep_verified: boolean
    is_secp_verified?: boolean
    is_fbr_verified?: boolean
  }
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="h-48 bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-32 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 w-48 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="h-4 w-full bg-gray-100 rounded-full animate-pulse" />
        <div className="h-3.5 w-3/4 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-3 w-1/2 bg-gray-100 rounded-full animate-pulse" />
        <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-2.5 w-16 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ConsultantsClient() {
  const [services, setServices]       = useState<Service[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [query, setQuery]             = useState('')
  const [visaType, setVisaType]       = useState('All')
  const [destination, setDestination] = useState('')
  const [sortBy, setSortBy]           = useState('newest')
  const [saved, setSaved]             = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [verifyFilter, setVerifyFilter] = useState({ secp: false, beoe: false, fbr: false })
  const [maxBudget, setMaxBudget]     = useState(200000)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('services')
          .select(`
            id, consultant_id, title, description, visa_type,
            destination_country, price_min, price_max, processing_days,
            image_url, is_active, created_at,
            consultant:consultant_id (
              display_name, full_name, city, is_verified,
              avatar_url, years_experience,
              is_beoe_verified, is_oep_verified, is_secp_verified, is_fbr_verified
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(60)

        if (error) setError(error.message)
       else setServices((data || []) as unknown as Service[])
      } catch { setError('Failed to load services') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return services
      .filter(s => {
        const q = query.toLowerCase()
        const matchQ   = !query || s.title?.toLowerCase().includes(q) || s.destination_country?.toLowerCase().includes(q) || s.consultant?.display_name?.toLowerCase().includes(q)
        const matchVisa = visaType === 'All' || s.visa_type === visaType
        const matchDest = !destination || s.destination_country?.toLowerCase().includes(destination.toLowerCase())
        const matchBudget = !s.price_min || s.price_min <= maxBudget
        const matchSecp = !verifyFilter.secp || s.consultant?.is_secp_verified
        const matchBeoe = !verifyFilter.beoe || s.consultant?.is_beoe_verified
        const matchFbr  = !verifyFilter.fbr  || s.consultant?.is_fbr_verified
        return matchQ && matchVisa && matchDest && matchBudget && matchSecp && matchBeoe && matchFbr
      })
      .sort((a, b) => {
        if (sortBy === 'price_low')  return (a.price_min||0) - (b.price_min||0)
        if (sortBy === 'price_high') return (b.price_min||0) - (a.price_min||0)
        if (sortBy === 'fastest')    return (a.processing_days||99) - (b.processing_days||99)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [services, query, visaType, destination, sortBy, maxBudget, verifyFilter])

  const toggleSave = (id: string) =>
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const clearAll = () => {
    setQuery(''); setVisaType('All'); setDestination('')
    setVerifyFilter({ secp: false, beoe: false, fbr: false }); setMaxBudget(200000)
  }

  const hasFilters = visaType !== 'All' || destination || query ||
    verifyFilter.secp || verifyFilter.beoe || verifyFilter.fbr || maxBudget < 200000

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <Navbar />

      {/* ── Hero ── */}
      <div className="bg-[#1B3060] py-10 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #C9A227 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-3xl mx-auto text-center mb-6">
          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl mb-1">
            Find Visa Services
          </h1>
          <p className="font-urdu text-[#C9A227]/80 text-base mb-1">ویزا سروسز تلاش کریں</p>
          <p className="text-white/50 text-sm">
            {loading ? 'Loading...' : `${filtered.length} services from verified consultants`}
          </p>
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl flex items-center gap-3 px-4 py-2.5 shadow-xl">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search visa type, country or consultant..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {query && <button onClick={() => setQuery('')}><X size={14} className="text-gray-400" /></button>}
            <button className="bg-[#C9A227] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#b8901f] transition shrink-0">
              Search
            </button>
          </div>
        </div>
        {/* Visa pills */}
        <div className="relative max-w-4xl mx-auto mt-4 flex flex-wrap gap-2 justify-center">
          {['All', ...VISA_TYPES].map(type => (
            <button key={type} onClick={() => setVisaType(type)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                visaType === type
                  ? 'bg-[#C9A227] border-[#C9A227] text-white'
                  : 'border-white/20 text-white/70 hover:border-[#C9A227]/50 hover:text-[#C9A227]'
              }`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ── Sidebar ── */}
          <aside className={`lg:w-56 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#1B3060] text-base">Filters</h3>
                {hasFilters && (
                  <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-600">Clear all</button>
                )}
              </div>

              {/* Service Type */}
              <div className="mb-5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Service Type</h4>
                <div className="space-y-0.5">
                  {VISA_TYPES.map(type => (
                    <button key={type} onClick={() => setVisaType(visaType === type ? 'All' : type)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] transition-all ${
                        visaType === type ? 'text-[#1B3060] font-semibold' : 'text-gray-500 hover:text-[#1B3060]'
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div className="mb-5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Destination</h4>
                <input
                  type="text" value={destination} onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Canada, UK..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1B3060]/20"
                />
              </div>

              {/* Verification */}
              <div className="mb-5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Verification</h4>
                {[
                  { key: 'secp', label: 'SECP Verified' },
                  { key: 'beoe', label: 'BEOE Verified' },
                  { key: 'fbr',  label: 'FBR Verified'  },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifyFilter[key as keyof typeof verifyFilter]}
                      onChange={() => setVerifyFilter(p => ({ ...p, [key]: !p[key as keyof typeof verifyFilter] }))}
                      className="w-4 h-4 accent-[#1B3060] rounded"
                    />
                    <span className="text-[13px] text-gray-500">{label}</span>
                  </label>
                ))}
              </div>

              {/* Budget */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Budget Range</h4>
                <input
                  type="range" min={0} max={200000} step={5000} value={maxBudget}
                  onChange={e => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-[#1B3060]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>PKR 0</span>
                  <span>PKR {maxBudget >= 200000 ? '200K' : (maxBudget/1000).toFixed(0)+'K'}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <p className="font-bold text-gray-800 text-base">
                  {loading ? '...' : filtered.length} services found
                </p>
                <p className="text-xs text-gray-400">Explore our trusted, government-verified consultants</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-1.5 text-xs text-[#1B3060] border border-gray-200 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <Filter size={13} /> Filters
                </button>
                <span className="text-xs text-gray-400">Sort:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5 outline-none bg-white shadow-sm">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                <p className="font-bold text-red-600 mb-1">Could not load services</p>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
                <Search size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-[#1B3060] mb-1">No services found</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your filters</p>
                <button onClick={clearAll}
                  className="text-sm text-[#1B3060] border border-[#1B3060] px-5 py-2 rounded-xl hover:bg-[#1B3060] hover:text-white transition">
                  Clear Filters
                </button>
              </div>
            )}

            {/* ── Cards Grid ── */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

              {/* Skeletons */}
              {loading && Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}

              {/* Service Cards */}
              {!loading && !error && filtered.map((service, i) => {
                const isSaved    = saved.includes(service.id)
                const name       = service.consultant?.display_name || service.consultant?.full_name || 'Consultant'
                const avatarSrc  = service.consultant?.avatar_url
                  ? `${supabaseUrl}/storage/v1/object/public/avatars/${service.consultant.avatar_url}`
                  : null
                const imageSrc   = service.image_url
                  ? `${supabaseUrl}/storage/v1/object/public/services/${service.image_url}`
                  : null
                const badgeBg    = VISA_BADGE_COLORS[service.visa_type] || '#1B3060'

                return (
                  <div key={service.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.13)] hover:-translate-y-0.5 transition-all duration-300 group flex flex-col">

                    {/* ── Image ── */}
                    <div className="relative h-48 overflow-hidden">
                      {imageSrc ? (
                        <img src={imageSrc} alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full relative"
                          style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}>
                          <div className="absolute inset-0 opacity-[0.07]"
                            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                        </div>
                      )}

                      {/* Visa type badge — top left */}
                      <span
                        className="absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-full shadow-sm"
                        style={{ backgroundColor: badgeBg }}>
                        {service.visa_type}
                      </span>

                      {/* Heart — top right */}
                      <button onClick={() => toggleSave(service.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                        <Heart size={14} className={isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                      </button>
                    </div>

                    {/* ── Body ── */}
                    <div className="p-4 flex flex-col flex-1">

                      {/* Consultant row */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1B3060] flex items-center justify-center shrink-0 border-2 border-gray-100">
                          {avatarSrc ? (
                            <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-bold">{getInitials(name)}</span>
                          )}
                        </div>
                        {/* Name + badges */}
                        <div className="min-w-0 flex-1">
                          {/* Name row */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm font-semibold text-gray-800 truncate">{name}</span>
                            <BadgeCheck size={15} className="text-blue-500 shrink-0" />
                          </div>
                          {/* Verification pills — exactly like sample */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {service.consultant?.is_verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">
                                <CheckCircle size={9} strokeWidth={3} />
                                Verified
                              </span>
                            )}
                            {service.consultant?.is_secp_verified && (
                              <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">
                                SECP
                              </span>
                            )}
                            {service.consultant?.is_beoe_verified && (
                              <span className="text-[10px] font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full">
                                BEOE
                              </span>
                            )}
                            {service.consultant?.is_oep_verified && (
                              <span className="text-[10px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-full">
                                OEP
                              </span>
                            )}
                            {service.consultant?.is_fbr_verified && (
                              <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">
                                FBR
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <p className="text-sm text-gray-700 leading-snug mb-3 line-clamp-2 flex-1">
                        {service.title}
                      </p>

                      {/* Stars + City */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-[#C9A227] fill-[#C9A227]" />
                          <span className="font-semibold text-gray-700">4.8</span>
                          <span className="text-gray-400">(127)</span>
                        </span>
                        {service.consultant?.city && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <span className="text-gray-300">·</span>
                            <MapPin size={10} />
                            {service.consultant.city}
                          </span>
                        )}
                      </div>

                      {/* Price + CTA */}
                      <div className="border-t border-gray-100 pt-3 mt-auto flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Starting at</p>
                          <p className="text-lg font-extrabold text-[#1B3060]">
                            PKR {service.price_min?.toLocaleString()}
                          </p>
                        </div>
                        <Link href={`/consultants/${service.consultant_id}`}
                          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1B3060] hover:text-white hover:bg-[#1B3060] border border-[#1B3060]/25 hover:border-[#1B3060] px-4 py-2 rounded-xl transition-all duration-200">
                          View Profile <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}