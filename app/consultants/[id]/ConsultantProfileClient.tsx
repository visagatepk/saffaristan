'use client'
// FILE: app/consultants/[id]/ConsultantProfileClient.tsx

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, Briefcase, Globe, Clock, Star, Shield,
  CheckCircle, Award, Phone, Calendar, MessageSquare,
  Share2, Heart, ChevronRight, Zap, BadgeCheck,
  AlertCircle, ExternalLink,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Service {
  id: string
  title: string
  description: string
  visa_type: string
  destination_country: string
  price_min: number
  price_max: number
  processing_days: number
  image_url: string | null
  is_active: boolean
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  reviewer: { full_name: string | null; display_name: string | null }
}

interface Consultant {
  id: string
  user_id: string
  display_name: string | null
  full_name: string | null
  business_name: string | null
  bio: string | null
  city: string | null
  office_address: string | null
  phone: string | null
  whatsapp_number: string | null
  years_experience: number | null
  avatar_url: string | null
  is_verified: boolean
  verification_status: string | null
  oep_license_number: string | null
}

interface Props {
  consultant: Consultant
  services: Service[]
  reviews: Review[]
  avgRating: number
  supabaseUrl: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getInitials(name: string | null) {
  if (!name) return 'VC'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 86400)  return 'Today'
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  if (diff < 2592000) return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Star row
// ─────────────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          className={i <= Math.round(rating) ? 'text-[#C9A227] fill-[#C9A227]' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Rating distribution bar
// ─────────────────────────────────────────────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-gray-500 w-3">{star}</span>
      <Star size={11} className="text-[#C9A227] fill-[#C9A227] shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C9A227, #a8861f)' }}
        />
      </div>
      <span className="text-xs font-bold text-gray-500 w-7 text-right">{count}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Country flag emoji lookup
// ─────────────────────────────────────────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  'United Kingdom': '🇬🇧', 'UK': '🇬🇧',
  'United States': '🇺🇸', 'USA': '🇺🇸',
  'Canada': '🇨🇦', 'Australia': '🇦🇺',
  'Germany': '🇩🇪', 'France': '🇫🇷',
  'UAE': '🇦🇪', 'Saudi Arabia': '🇸🇦',
  'Turkey': '🇹🇷', 'Malaysia': '🇲🇾',
  'Italy': '🇮🇹', 'Japan': '🇯🇵',
  'South Korea': '🇰🇷', 'New Zealand': '🇳🇿',
}

function countryFlag(country: string) {
  return FLAG_MAP[country] || '🌐'
}

// ─────────────────────────────────────────────────────────────────────────────
// Whatsapp icon SVG
// ─────────────────────────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.297-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.69.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016a9.87 9.87 0 0 1-5.031-1.378l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12 12 0 0 0 5.71 1.447h.005c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ConsultantProfileClient({
  consultant, services, reviews, avgRating, supabaseUrl,
}: Props) {
  const router   = useRouter()
  const [tab, setTab]     = useState<'services' | 'reviews' | 'about'>('services')
  const [saved, setSaved] = useState(false)

  const name        = consultant.display_name || consultant.full_name || 'Consultant'
  const initials    = getInitials(name)
  const avatarSrc   = consultant.avatar_url
    ? `${supabaseUrl}/storage/v1/object/public/avatars/${consultant.avatar_url}`
    : null
  const waNumber    = (consultant.whatsapp_number || consultant.phone || '').replace(/\D/g, '')
  const totalReviews = reviews.length

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star, count: reviews.filter(r => Math.round(r.rating) === star).length,
  }))

  return (
    <div className="bg-white min-h-screen">

      {/* ══════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#1B3060] relative overflow-hidden" style={{ marginBottom: 90 }}>
        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Gold glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-[0.18]"
          style={{ background: 'radial-gradient(circle,#C9A227 0%,transparent 70%)', transform: 'translate(30%,-30%)' }}
        />
        {/* Blue glow */}
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle,#4B78C8 0%,transparent 70%)', transform: 'translate(-30%,30%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-28">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-white/40">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/consultants" className="hover:text-white transition-colors">Find Consultants</Link>
            <ChevronRight size={12} />
            <span className="text-white">{name}</span>
          </div>

          {/* Top row — badges + actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {consultant.is_verified && (
                <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <BadgeCheck size={12} className="text-green-400" /> BEOE Verified
                </span>
              )}
              {avgRating >= 4.5 && totalReviews >= 10 && (
                <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Award size={12} className="text-[#C9A227]" /> Top Rated
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.3)]" />
                Available now
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSaved(!saved)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  saved ? 'bg-[#C9A227] border-[#C9A227]' : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
              >
                <Heart size={16} className="text-white" fill={saved ? 'white' : 'none'} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all">
                <Share2 size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PROFILE CARD — overlaps hero by -90px
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative" style={{ marginTop: -90, marginBottom: 32 }}>
        <div className="bg-white rounded-3xl shadow-[0_16px_48px_rgba(15,30,61,0.12)] border border-gray-100 p-8">
          <div className="flex items-start gap-7">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-36 h-36 rounded-[28px] overflow-hidden bg-[#1B3060] flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 opacity-[0.06]"
                      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '20px 20px' }}
                    />
                    <span className="font-heading font-black text-white text-5xl relative z-10">{initials}</span>
                  </div>
                )}
              </div>
              {consultant.is_verified && (
                <div className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-full bg-white border-[3px] border-green-500 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-500 fill-green-500" strokeWidth={0} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="font-heading font-black text-[#1B3060] text-3xl tracking-tight leading-none">
                  {name}
                </h1>
              </div>
              <p className="text-gray-500 text-base font-medium mb-4">
                {consultant.business_name || 'Visa Consultant'}
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
                {consultant.city && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={14} className="text-[#C9A227]" />{consultant.city}, Pakistan
                  </span>
                )}
                {consultant.years_experience && consultant.years_experience > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Briefcase size={14} className="text-gray-400" />{consultant.years_experience} years experience
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Globe size={14} className="text-gray-400" />English, Urdu
                </span>
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                  <Clock size={14} />Responds in ~1 hour
                </span>
              </div>

              {/* Service tags */}
              {services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {services.slice(0, 5).map(s => (
                    <span key={s.id}
                      className="inline-flex items-center text-xs font-bold bg-[#EBF0F8] text-[#1B3060] px-2.5 py-1 rounded-full">
                      {s.destination_country ? `${countryFlag(s.destination_country)} ` : ''}{s.title}
                    </span>
                  ))}
                  {services.length > 5 && (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                      +{services.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Rating block */}
            <div className="w-48 shrink-0 p-5 rounded-2xl text-center border border-[#C9A227]/20"
              style={{ background: 'linear-gradient(135deg, #FBF5E0 0%, #fff 100%)' }}>
              <Stars rating={avgRating} size={17} />
              <p className="font-heading font-black text-[#1B3060] text-4xl tracking-tight leading-none mt-2">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                {totalReviews > 0 ? `Based on ${totalReviews} reviews` : 'No reviews yet'}
              </p>
              <div className="h-px bg-[#C9A227]/20 my-3.5" />
              <div className="flex justify-around">
                <div>
                  <p className="font-heading font-black text-[#1B3060] text-lg">98%</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Success</p>
                </div>
                <div>
                  <p className="font-heading font-black text-[#1B3060] text-lg">{totalReviews}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-0 mt-6 pt-6 border-t border-gray-100">
            {[
              { icon: Shield,    color: '#059669', label: 'License', value: consultant.oep_license_number || 'Verified' },
              { icon: BadgeCheck,color: '#1B3060', label: 'Certified', value: 'SECP, FBR' },
              { icon: Award,     color: '#C9A227', label: 'Association Memberships', value: 'TAAP, PATO' },
              { icon: Clock,     color: '#7c3aed', label: 'Response', value: '~1 hour' },
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-3 px-6 ${i < 3 ? 'border-r border-gray-100' : ''}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: stat.color + '14' }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">{stat.label}</p>
                  <p className="font-heading font-bold text-[#1B3060] text-sm mt-0.5">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">

          {/* ── Left column ── */}
          <div>
            {/* Tab bar */}
            <div className="flex gap-1 border-b border-gray-200 mb-7 sticky top-[65px] bg-white z-10 pt-2">
              {([
                ['services', 'Services', services.length],
                ['reviews',  'Reviews',  totalReviews],
                ['about',    'About',    null],
              ] as const).map(([k, l, n]) => (
                <button key={k} onClick={() => setTab(k as any)}
                  className={`flex items-center gap-2 pb-3.5 px-5 border-b-[3px] -mb-px text-sm font-bold transition-all font-heading ${
                    tab === k
                      ? 'border-[#C9A227] text-[#1B3060]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}>
                  {l}
                  {n != null && n > 0 && (
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      tab === k ? 'bg-[#C9A227] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {n}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── SERVICES TAB ── */}
            {tab === 'services' && (
              <div>
                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <h2 className="font-heading font-extrabold text-[#1B3060] text-2xl tracking-tight">Services Offered</h2>
                    <p className="text-sm text-gray-400 mt-1">{services.length} visa services · All prices in PKR</p>
                  </div>
                </div>

                {services.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {services.map((s, idx) => (
                      <div key={s.id}
                        className={`bg-white rounded-2xl border p-6 relative transition-all hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 ${
                          idx === 0 ? 'border-[#C9A227] shadow-[0_8px_28px_rgba(201,162,39,0.15)]' : 'border-gray-200'
                        }`}>
                        {idx === 0 && (
                          <div className="absolute -top-2.5 left-5 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider"
                            style={{ background: 'linear-gradient(135deg, #C9A227, #a8861f)' }}>
                            Most Popular
                          </div>
                        )}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-13 h-13 rounded-2xl bg-[#EBF0F8] flex items-center justify-center text-2xl shrink-0 w-14 h-14">
                            {s.image_url ? (
                              <img src={s.image_url} alt={s.title} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                              <span>{countryFlag(s.destination_country)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-extrabold text-[#1B3060] text-base mb-1.5 leading-tight">
                              {s.title}
                            </h3>
                            {s.description && (
                              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{s.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-2.5 mb-4 text-xs">
                          {s.processing_days > 0 && (
                            <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
                              <Clock size={12} /> {s.processing_days} days
                            </span>
                          )}
                          {s.processing_days > 0 && avgRating > 0 && (
                            <div className="w-px h-3.5 bg-gray-300" />
                          )}
                          {avgRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-[#C9A227] fill-[#C9A227]" />
                              <span className="font-bold text-gray-800">{avgRating.toFixed(1)}</span>
                              <span className="text-gray-400">({totalReviews})</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-gray-400 font-semibold mb-0.5">Starting from</p>
                            <p className="font-heading font-black text-[#C9A227] text-xl tracking-tight">
                              PKR {s.price_min > 0 ? s.price_min.toLocaleString() : '—'}
                              {s.price_max > 0 && s.price_max !== s.price_min && (
                                <span className="text-sm font-semibold text-gray-400"> – {s.price_max.toLocaleString()}</span>
                              )}
                            </p>
                          </div>
                          <Link href={`/book/${consultant.user_id}?service=${s.id}`}
                            className="font-heading font-bold text-sm text-white bg-[#1B3060] hover:bg-[#243d7a] px-5 py-2.5 rounded-xl transition-colors">
                            Book Now →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center border border-dashed border-gray-200">
                    <Globe size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="font-heading font-bold text-[#1B3060] text-base mb-1">No services listed yet</p>
                    <p className="text-gray-400 text-sm">This consultant hasn't added their services yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {tab === 'reviews' && (
              <div>
                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <h2 className="font-heading font-extrabold text-[#1B3060] text-2xl tracking-tight">Client Reviews</h2>
                    <p className="text-sm text-gray-400 mt-1">{totalReviews} verified reviews</p>
                  </div>
                </div>

                {totalReviews > 0 ? (
                  <>
                    {/* Rating summary */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 grid grid-cols-[180px_1fr] gap-8 items-center">
                      <div className="text-center border-r border-gray-100 pr-8">
                        <p className="font-heading font-black text-[#1B3060] text-6xl leading-none tracking-tight">
                          {avgRating.toFixed(1)}
                        </p>
                        <Stars rating={avgRating} size={16} />
                        <p className="text-xs text-gray-400 font-semibold mt-2">{totalReviews} total</p>
                      </div>
                      <div className="space-y-2">
                        {dist.map(d => (
                          <RatingBar key={d.star} star={d.star} count={d.count} total={totalReviews} />
                        ))}
                      </div>
                    </div>

                    {/* Review cards */}
                    <div className="space-y-4">
                      {reviews.map(r => {
                        const reviewer = r.reviewer?.display_name || r.reviewer?.full_name || 'Client'
                        const rinit = getInitials(reviewer)
                        const colors = ['#1B3060', '#C9A227', '#7c3aed', '#059669', '#dc2626']
                        const col = colors[reviewer.charCodeAt(0) % colors.length]
                        return (
                          <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-start gap-4 mb-3">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-heading font-black text-sm text-white shrink-0"
                                style={{ background: col }}>
                                {rinit}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-heading font-bold text-[#1B3060] text-sm">{reviewer}</p>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                                    <CheckCircle size={9} className="fill-green-700" strokeWidth={0} /> Verified
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Stars rating={r.rating} size={12} />
                                  <span className="text-xs text-gray-400">· {formatDate(r.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center border border-dashed border-gray-200">
                    <Star size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="font-heading font-bold text-[#1B3060] text-base mb-1">No reviews yet</p>
                    <p className="text-gray-400 text-sm">Be the first to leave a review after your consultation.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── ABOUT TAB ── */}
            {tab === 'about' && (
              <div>
                <h2 className="font-heading font-extrabold text-[#1B3060] text-2xl tracking-tight mb-1">
                  About {name}
                </h2>
                <p className="text-sm text-gray-400 mb-6">Get to know your consultant before booking</p>

                {/* Bio */}
                <div className="bg-white rounded-2xl border border-gray-200 p-7 mb-4">
                  {consultant.bio ? (
                    <p className="text-[15px] text-gray-700 leading-[1.75]">{consultant.bio}</p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No bio provided.</p>
                  )}
                </div>

                {/* Specialties + Credentials */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-heading font-extrabold text-[#1B3060] text-sm mb-4 flex items-center gap-2">
                      <Zap size={15} className="text-[#C9A227]" /> Specialties
                    </h3>
                    {services.length > 0 ? (
                      <div className="space-y-0">
                        {services.map(s => (
                          <div key={s.id} className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                            <CheckCircle size={13} className="text-green-500 fill-green-500" strokeWidth={0} />
                            <span className="text-sm text-gray-700 font-medium">{s.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No specialties listed.</p>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-heading font-extrabold text-[#1B3060] text-sm mb-4 flex items-center gap-2">
                      <Award size={15} className="text-[#C9A227]" /> Credentials
                    </h3>
                    <div className="space-y-0">
                      {[
                        consultant.is_verified && { title: 'BEOE Licensed Agent', sub: consultant.oep_license_number || 'Verified', color: '#059669' },
                        { title: 'IATA Travel Certified', sub: 'Member', color: '#1B3060' },
                        { title: 'NTN Registered', sub: 'Federal Board of Revenue', color: '#C9A227' },
                      ].filter(Boolean).map((c: any, i) => (
                        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: c.color + '14' }}>
                            <Shield size={14} style={{ color: c.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{c.title}</p>
                            <p className="text-xs text-gray-400">{c.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Office info */}
                {(consultant.office_address || consultant.city) && (
                  <div className="bg-[#1B3060] rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none opacity-10"
                      style={{ background: 'radial-gradient(circle,#C9A227 0%,transparent 70%)', transform: 'translate(20%,-20%)' }} />
                    <div className="relative grid sm:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider mb-2">Office Address</p>
                        <p className="text-sm text-white font-semibold leading-relaxed">
                          {consultant.office_address || `${consultant.city}, Pakistan`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider mb-2">Working Hours</p>
                        <p className="text-sm text-white font-semibold leading-relaxed">
                          Mon – Fri · 10:00 AM – 7:00 PM<br />Sat · 11:00 AM – 4:00 PM
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider mb-2">Languages</p>
                        <p className="text-sm text-white font-semibold leading-relaxed">
                          English · Urdu<br />Punjabi (conversational)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4" style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>

            {/* Main CTA card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.25)]" />
                <span className="text-xs text-green-600 font-bold">Available now</span>
              </div>
              <h3 className="font-heading font-black text-[#1B3060] text-xl tracking-tight mb-1">
                Get in Touch
              </h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Discuss your visa needs directly with {name.split(' ')[0]} — usually replies within an hour.
              </p>

              <div className="space-y-2.5">
                <Link href={`/book/${consultant.user_id}`}
                  className="w-full flex items-center justify-center gap-2 font-heading font-bold text-sm text-white py-3.5 rounded-xl transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)', boxShadow: '0 4px 14px rgba(201,162,39,0.35)' }}>
                  <Calendar size={15} /> Book Consultation
                </Link>
                <Link href={`/messages?to=${consultant.user_id}`}
                  className="w-full flex items-center justify-center gap-2 font-heading font-bold text-sm text-[#1B3060] border-[1.5px] border-[#1B3060] py-3.5 rounded-xl hover:bg-[#1B3060] hover:text-white transition-all">
                  <MessageSquare size={15} /> Send Message
                </Link>
                {waNumber && (
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 font-heading font-bold text-sm text-[#1ea952] border-[1.5px] border-[#25d366] py-3.5 rounded-xl hover:bg-[#25d366] hover:text-white transition-all">
                    <WhatsAppIcon size={15} /> WhatsApp
                  </a>
                )}
                {consultant.phone && (
                  <a href={`tel:${consultant.phone}`}
                    className="w-full flex items-center justify-center gap-2 font-heading font-bold text-sm text-[#1B3060] bg-[#EBF0F8] border border-[#1B3060]/10 py-3.5 rounded-xl hover:bg-[#1B3060] hover:text-white transition-all">
                    <Phone size={15} /> Phone Call
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-semibold mb-1">Response time</p>
                  <p className="font-heading font-black text-[#1B3060] text-sm">~1 hour</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-semibold mb-1">Languages</p>
                  <p className="font-heading font-black text-[#1B3060] text-sm">3 languages</p>
                </div>
              </div>
            </div>

            {/* Trust card */}
            <div className="rounded-2xl border border-[#1B3060]/15 p-5"
              style={{ background: 'linear-gradient(135deg, #EBF0F8 0%, #fff 100%)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#1B3060] flex items-center justify-center shrink-0">
                  <Shield size={17} className="text-[#C9A227]" />
                </div>
                <div>
                  <p className="font-heading font-bold text-[#1B3060] text-sm">VisaGate Protected</p>
                  <p className="text-xs text-gray-400">Verified & secure</p>
                </div>
              </div>
              <ul className="space-y-2">
                {['Verified by BEOE & VisaGate', 'Encrypted secure messaging', 'Transparent pricing'].map(t => (
                  <li key={t} className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle size={13} className="text-green-500 fill-green-500 shrink-0" strokeWidth={0} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Office hours */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="font-heading font-bold text-[#1B3060] text-sm mb-3 flex items-center gap-2">
                <Clock size={14} className="text-[#C9A227]" /> Office Hours
              </p>
              {[
                ['Mon – Fri', '10:00 AM – 7:00 PM', true],
                ['Saturday',  '11:00 AM – 4:00 PM', true],
                ['Sunday',    'Closed',              false],
              ].map(([day, hours, open]) => (
                <div key={day as string} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500 font-medium">{day}</span>
                  <span className={`text-xs font-semibold ${open ? 'text-gray-800' : 'text-gray-400'}`}>{hours}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}