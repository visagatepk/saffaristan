'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, MapPin, Star, BadgeCheck, Heart, X, Clock,
  Filter, ArrowRight, CheckCircle,
  GraduationCap, Briefcase, Plane, Users, Building2, Globe, Landmark,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const VISA_TYPES = [
  'Student Visa', 'Work Permit', 'Visit Visa', 'Family Visa',
  'Business Visa', 'PR & Immigration', 'Umrah Visa', 'Spouse Visa',
]

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

// Icons rendered inside gradient fallback cards (CON-06)
const VISA_TYPE_ICONS: Record<string, React.ReactNode> = {
  'Student Visa':     <GraduationCap size={44} className="text-white/25" />,
  'Study Visa':       <GraduationCap size={44} className="text-white/25" />,
  'Work Permit':      <Briefcase     size={44} className="text-white/25" />,
  'Work Visa':        <Briefcase     size={44} className="text-white/25" />,
  'Visit Visa':       <Plane         size={44} className="text-white/25" />,
  'Tourist Visa':     <Plane         size={44} className="text-white/25" />,
  'Family Visa':      <Users         size={44} className="text-white/25" />,
  'Spouse Visa':      <Users         size={44} className="text-white/25" />,
  'Business Visa':    <Building2     size={44} className="text-white/25" />,
  'PR & Immigration': <Landmark      size={44} className="text-white/25" />,
  'Umrah Visa':       <Globe         size={44} className="text-white/25" />,
}

// ─────────────────────────────────────────────────────────────────────────────
// [CON-03] Guard: only render images hosted on our own Supabase project or CDN.
// Any external URL (e.g. crisis photos uploaded by bad actors) is rejected and
// the styled gradient fallback is shown instead.
// ─────────────────────────────────────────────────────────────────────────────
function isValidServiceImageUrl(url: string | null, supabaseUrl: string): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    const supabaseHost = supabaseUrl.replace(/^https?:\/\//, '')
    return (
      hostname === supabaseHost         ||
      hostname.endsWith('.supabase.co') ||
      hostname === 'cdn.visagate.pk'
    )
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
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
  // [CON-05] Populated by page.tsx after merging from reviews table
  average_rating?: number | null
  review_count?: number | null
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

interface Props {
  initialServices: Service[]
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ConsultantsClient({ initialServices }: Props) {
  const [services]                      = useState<Service[]>(initialServices)
  const [query, setQuery]               = useState('')
  const [visaType, setVisaType]         = useState('All')
  const [destination, setDestination]   = useState('')
  const [sortBy, setSortBy]             = useState('newest')
  const [saved, setSaved]               = useState<string[]>([])
  const [showFilters, setShowFilters]   = useState(false)
  const [verifyFilter, setVerifyFilter] = useState({ secp: false, beoe: false, fbr: false })
  const [maxBudget, setMaxBudget]       = useState(200000)
  const [session, setSession]           = useState<any>(null)
  // [CON-03] Track per-card image load failures → show gradient fallback
  const [imgErrors, setImgErrors]       = useState<Set<string>>(new Set())

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  // Fetch session client-side only — services already loaded server-side
  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    run()
  }, [])

  // [CON-09] Compute live stats from real Supabase data
  const verifiedConsultantCount = useMemo(() =>
    new Set(
      services.filter(s => s.consultant?.is_verified).map(s => s.consultant_id)
    ).size,
  [services])

  const filtered = useMemo(() => {
    return services
      .filter(s => {
        const q           = query.toLowerCase()
        const matchQ      = !query
          || s.title?.toLowerCase().includes(q)
          || s.destination_country?.toLowerCase().includes(q)
          || s.consultant?.display_name?.toLowerCase().includes(q)
        const matchVisa   = visaType === 'All' || s.visa_type === visaType
        const matchDest   = !destination || s.destination_country?.toLowerCase().includes(destination.toLowerCase())
        const matchBudget = !s.price_min || s.price_min <= maxBudget
        const matchSecp   = !verifyFilter.secp || s.consultant?.is_secp_verified
        const matchBeoe   = !verifyFilter.beoe || s.consultant?.is_beoe_verified
        const matchFbr    = !verifyFilter.fbr  || s.consultant?.is_fbr_verified
        return matchQ && matchVisa && matchDest && matchBudget && matchSecp && matchBeoe && matchFbr
      })
      .sort((a, b) => {
        if (sortBy === 'price_low')  return (a.price_min || 0) - (b.price_min || 0)
        if (sortBy === 'price_high') return (b.price_min || 0) - (a.price_min || 0)
        if (sortBy === 'fastest')    return (a.processing_days || 99) - (b.processing_days || 99)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [services, query, visaType, destination, sortBy, maxBudget, verifyFilter])

  const toggleSave = (id: string) =>
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const clearAll = () => {
    setQuery('')
    setVisaType('All')
    setDestination('')
    setVerifyFilter({ secp: false, beoe: false, fbr: false })
    setMaxBudget(200000)
  }

  const hasFilters =
    visaType !== 'All' || destination || query ||
    verifyFilter.secp || verifyFilter.beoe || verifyFilter.fbr ||
    maxBudget < 200000

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
          [CON-01] pt-[calc(64px+2.5rem)] — clears fixed 64px navbar
          [CON-02] h1 fixed: "Find Verified Visa Consultants"
          [CON-09] Badge pill + live stats bar added
          Pattern: white grid lines — matches /visa-categories reference page
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-navy relative overflow-hidden pt-[calc(64px+2.5rem)] pb-10 px-6">

        {/* Layer 1 — white grid lines at 4% opacity (same as /visa-categories) */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Layer 2 — gold radial glow, top-right corner */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)',
            transform: 'translate(20%, -20%)',
          }}
        />

        {/* Hero content */}
        <div className="relative max-w-3xl mx-auto text-center mb-6">

          {/* [CON-09] Badge pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-5">
            <BadgeCheck size={13} className="text-gold" />
            <span className="font-body text-xs font-semibold text-gold tracking-wide">
              Pakistan's Verified Consultant Directory
            </span>
          </div>

          {/* [CON-02] Fixed h1 — was "Find Visa Services" */}
          <h1 className="font-heading font-extrabold text-white text-4xl lg:text-5xl mb-3 leading-tight">
            Find Verified Visa Consultants
          </h1>

          {/* Urdu subtitle */}
          <p className="font-urdu text-gold/80 text-xl mb-4">
            پاکستان میں قابلِ اعتماد ویزا کنسلٹنٹ تلاش کریں
          </p>

          {/* [CON-09] Stats bar — live counts from real Supabase data */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            {[
              { num: String(services.length), label: 'Active Services' },
              { num: String(verifiedConsultantCount), label: 'Verified Consultants' },
              { num: '★ Gov\'t Registered', label: '' },
            ].map((s, i, arr) => (
              <div key={s.label || s.num} className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-heading font-extrabold text-white text-2xl">{s.num}</div>
                  {s.label && <div className="font-body text-white/50 text-xs mt-0.5">{s.label}</div>}
                </div>
                {i < arr.length - 1 && <div className="w-px h-6 bg-white/15 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl flex items-center gap-3 px-4 py-2.5 shadow-xl">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search visa type, country or consultant..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X size={14} className="text-gray-400" />
              </button>
            )}
            <button className="bg-gold text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-gold/90 transition shrink-0">
              Search
            </button>
          </div>
        </div>

        {/* Visa type pills */}
        <div className="relative max-w-4xl mx-auto mt-4 flex flex-wrap gap-2 justify-center">
          {['All', ...VISA_TYPES].map(type => (
            <button
              key={type}
              onClick={() => setVisaType(type)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                visaType === type
                  ? 'bg-gold border-gold text-white'
                  : 'border-white/20 text-white/70 hover:border-gold/50 hover:text-gold'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ── Sidebar ── */}
          <aside className={`lg:w-56 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-navy text-base">Filters</h3>
                {hasFilters && (
                  <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-600">
                    Clear all
                  </button>
                )}
              </div>

              {/* Service Type */}
              <div className="mb-5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Service Type
                </h4>
                <div className="space-y-0.5">
                  {VISA_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setVisaType(visaType === type ? 'All' : type)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] transition-all ${
                        visaType === type
                          ? 'text-navy font-semibold'
                          : 'text-gray-500 hover:text-navy'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div className="mb-5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Destination
                </h4>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Canada, UK..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-navy/20"
                />
              </div>

              {/* Verification */}
              <div className="mb-5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Verification
                </h4>
                {[
                  { key: 'secp', label: 'SECP Verified' },
                  { key: 'beoe', label: 'BEOE Verified' },
                  { key: 'fbr',  label: 'FBR Verified'  },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifyFilter[key as keyof typeof verifyFilter]}
                      onChange={() =>
                        setVerifyFilter(p => ({ ...p, [key]: !p[key as keyof typeof verifyFilter] }))
                      }
                      className="w-4 h-4 accent-navy rounded"
                    />
                    <span className="text-[13px] text-gray-500">{label}</span>
                  </label>
                ))}
              </div>

              {/* Budget */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Budget Range
                </h4>
                <input
                  type="range" min={0} max={200000} step={5000} value={maxBudget}
                  onChange={e => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-navy"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>PKR 0</span>
                  <span>PKR {maxBudget >= 200000 ? '200K' : (maxBudget / 1000).toFixed(0) + 'K'}</span>
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
                  {filtered.length} services found
                </p>
                <p className="text-xs text-gray-400">Explore our trusted, government-verified consultants</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-1.5 text-xs text-navy border border-gray-200 bg-white px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <Filter size={13} /> Filters
                </button>
                <span className="text-xs text-gray-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5 outline-none bg-white shadow-sm"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
                <Search size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-navy mb-1">No services found</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your filters</p>
                <button
                  onClick={clearAll}
                  className="text-sm text-navy border border-navy px-5 py-2 rounded-xl hover:bg-navy hover:text-white transition"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* ── Cards Grid ── */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((service, i) => {
                const isSaved   = saved.includes(service.id)
                const name      = service.consultant?.display_name || service.consultant?.full_name || 'Consultant'
                const badgeBg   = VISA_BADGE_COLORS[service.visa_type] || '#1B3060'
                const avatarSrc = service.consultant?.avatar_url
                  ? `${supabaseUrl}/storage/v1/object/public/avatars/${service.consultant.avatar_url}`
                  : null

                // [CON-03] Validate URL domain before rendering image
                const imageIsTrusted = isValidServiceImageUrl(service.image_url, supabaseUrl)
                const imageHadError  = imgErrors.has(service.id)
                const showImage      = imageIsTrusted && !imageHadError

                // [CON-05] Use real ratings or show "No reviews yet"
                const hasRating = (
                  service.average_rating != null &&
                  service.review_count != null &&
                  service.review_count > 0
                )

                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.13)] hover:-translate-y-0.5 transition-all duration-300 group flex flex-col"
                  >

                    {/* ── Card image ── */}
                    <div className="relative h-48 overflow-hidden">
                      {showImage ? (
                        // [CON-03] Trusted image — with runtime error fallback
                        <img
                          src={service.image_url!}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={() =>
                            setImgErrors(prev => new Set([...prev, service.id]))
                          }
                        />
                      ) : (
                        // [CON-06] Gradient fallback with visa-type icon
                        <div
                          className="w-full h-full relative flex items-center justify-center"
                          style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                        >
                          <div
                            className="absolute inset-0 opacity-[0.07]"
                            style={{
                              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                              backgroundSize: '18px 18px',
                            }}
                          />
                          <div className="relative z-10">
                            {VISA_TYPE_ICONS[service.visa_type] ?? (
                              <Globe size={44} className="text-white/25" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Visa type badge */}
                      <span
                        className="absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-full shadow-sm"
                        style={{ backgroundColor: badgeBg }}
                      >
                        {service.visa_type}
                      </span>

                      {/* Save / heart button */}
                      <button
                        onClick={() => toggleSave(service.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      >
                        <Heart size={14} className={isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                      </button>
                    </div>

                    {/* ── Card body ── */}
                    <div className="p-4 flex flex-col flex-1">

                      {/* Consultant info */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-navy flex items-center justify-center shrink-0 border-2 border-gray-100">
                          {avatarSrc ? (
                            <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-bold">{getInitials(name)}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm font-semibold text-gray-800 truncate">{name}</span>
                            {/* [CON-04] FIXED: Only renders when is_verified === true.
                                Previously showed on ALL cards, contradicting "Not Verified" badge. */}
                            {service.consultant?.is_verified && (
                              <BadgeCheck size={15} className="text-blue-500 shrink-0" />
                            )}
                          </div>

                          {/* Verification pills */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {service.consultant?.is_verified ? (
                              <div className="inline-flex items-center gap-1 border-2 border-green-500 rounded-full px-0.5 py-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">
                                  <CheckCircle size={9} strokeWidth={3} />
                                  Verified
                                </span>
                                {service.consultant?.is_beoe_verified && (
                                  <span className="text-[10px] font-bold text-white bg-[#29B6C5] px-2 py-0.5 rounded-full">
                                    BEOE
                                  </span>
                                )}
                                {service.consultant?.is_secp_verified && (
                                  <span className="text-[10px] font-bold text-white bg-gold px-2 py-0.5 rounded-full">
                                    SECP
                                  </span>
                                )}
                                {service.consultant?.is_oep_verified && (
                                  <span className="text-[10px] font-bold text-white bg-navy px-2 py-0.5 rounded-full">
                                    OEP
                                  </span>
                                )}
                                {service.consultant?.is_fbr_verified && (
                                  <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">
                                    FBR
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 border-2 border-red-500 px-2.5 py-0.5 rounded-full">
                                <X size={9} strokeWidth={3} />
                                Not Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Service title */}
                      <p className="text-sm text-gray-700 leading-snug mb-3 line-clamp-2 flex-1">
                        {service.title}
                      </p>

                      {/* [CON-05] Rating row — real data or "No reviews yet" */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        {hasRating ? (
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-gold fill-gold" />
                            <span className="font-semibold text-gray-700">
                              {service.average_rating!.toFixed(1)}
                            </span>
                            <span className="text-gray-400">({service.review_count})</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">No reviews yet</span>
                        )}
                        {service.consultant?.city && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <span className="text-gray-300">·</span>
                            <MapPin size={10} />
                            {service.consultant.city}
                          </span>
                        )}
                      </div>

                      {/* CTA row */}
                      <div className="border-t border-gray-100 pt-3 mt-auto flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            Starting at
                          </p>
                          <p className="text-lg font-extrabold text-navy">
                            PKR {service.price_min?.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (!session) window.location.href = '/login'
                              else window.location.href = `/consultants/${service.consultant_id}`
                            }}
                            className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-navy px-4 py-2 rounded-xl transition-all duration-200 hover:bg-navy/80"
                          >
                            Message
                          </button>
                          <Link
                            href={`/consultants/${service.consultant_id}`}
                            className="flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:text-white hover:bg-navy border border-navy/25 hover:border-navy px-4 py-2 rounded-xl transition-all duration-200"
                          >
                            View <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>{/* /main */}
        </div>
      </div>

      <Footer />
    </div>
  )
}