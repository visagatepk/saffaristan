'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Shield,
  Award,
  Briefcase,
  Globe,
  Clock,
  ChevronRight,
  Mail,
  Languages,
  Tag,
  Building2,
  Sparkles,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// ───────────────────────── Types ─────────────────────────

interface Profile {
  id: string
  full_name: string
  display_name: string | null
  business_name: string | null
  city: string | null
  avatar_url: string | null
  cover_image_url: string | null
  years_experience: number | null
  bio: string | null
  phone: string | null
  verification_status: string | null
  is_verified: boolean | null
  is_oep_verified: boolean | null
  is_secp_verified: boolean | null
  is_beoe_verified: boolean | null
  is_fbr_verified: boolean | null
  languages: string[] | null
  specializations: string[] | null
  office_address: string | null
  created_at: string | null
}

interface Service {
  id: string
  title: string
  description: string | null
  visa_type: string | null
  destination_country: string | null
  price_min: number | null
  price_max: number | null
  processing_days: number | null
  image_url: string | null
  created_at: string | null
}

interface Reviewer {
  id: string
  full_name: string
  avatar_url: string | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  // Supabase may return single or array; we normalise on render
  reviewer: Reviewer | Reviewer[] | null
}

interface Props {
  profile: Profile
  services: Service[]
  reviews: Review[]
}

type TabKey = 'services' | 'reviews' | 'about'

// ───────────────────────── Helpers ─────────────────────────

function formatPrice(value: number | null): string {
  if (value == null) return '—'
  return `PKR ${value.toLocaleString('en-PK')}`
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getReviewer(review: Review): Reviewer | null {
  if (!review.reviewer) return null
  return Array.isArray(review.reviewer) ? review.reviewer[0] ?? null : review.reviewer
}

function getInitial(name: string | null | undefined): string {
  return (name?.trim().charAt(0) || '?').toUpperCase()
}

// ───────────────────────── Main Component ─────────────────────────

export default function ConsultantProfileClient({ profile, services, reviews }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('services')

  const displayName = profile.display_name?.trim() || profile.full_name
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      })
    : null

  const { avgRating, ratingBreakdown } = useMemo(() => {
    if (reviews.length === 0) {
      return { avgRating: 0, ratingBreakdown: [0, 0, 0, 0, 0] }
    }
    const total = reviews.reduce((sum, r) => sum + r.rating, 0)
    const breakdown = [0, 0, 0, 0, 0]
    reviews.forEach((r) => {
      const idx = Math.min(Math.max(Math.round(r.rating), 1), 5) - 1
      breakdown[idx] += 1
    })
    return { avgRating: total / reviews.length, ratingBreakdown: breakdown.reverse() }
  }, [reviews])

  const hasAnyAccreditation =
    profile.is_oep_verified ||
    profile.is_secp_verified ||
    profile.is_beoe_verified ||
    profile.is_fbr_verified

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        {/* ═══════════ COVER + HEADER ═══════════ */}
        <section className="relative">
          {/* Cover photo */}
          <div className="relative h-44 sm:h-60 md:h-72 lg:h-80 w-full overflow-hidden">
            {profile.cover_image_url ? (
              <Image
                src={profile.cover_image_url}
                alt={`${displayName} cover`}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1B3060] via-[#243d7a] to-[#1B3060]">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 30%, rgba(201,162,39,0.4) 1.5px, transparent 1.5px), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.3) 1.5px, transparent 1.5px)',
                    backgroundSize: '50px 50px, 70px 70px',
                  }}
                />
                <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden md:block">
                  <Sparkles className="w-24 h-24 text-[#C9A227]/30" />
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* Header info bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-16 sm:-mt-20 pb-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-6">
                {/* Avatar */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full ring-4 ring-white shadow-2xl overflow-hidden bg-white flex-shrink-0">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={displayName}
                      fill
                      sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1B3060] to-[#243d7a] flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                      {getInitial(profile.full_name)}
                    </div>
                  )}
                  {profile.is_verified && (
                    <div
                      className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1.5 ring-2 ring-white"
                      aria-label="Verified consultant"
                      title="Verified consultant"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Name + meta + buttons */}
                <div className="flex-1 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 lg:pb-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-gray-900 leading-tight">
                        {displayName}
                      </h1>
                      {profile.is_verified && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                          <Shield className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    {profile.business_name && (
                      <p className="text-base sm:text-lg text-gray-700 mt-1 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {profile.business_name}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-600">
                      {profile.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {profile.city}
                        </span>
                      )}
                      {profile.years_experience != null && profile.years_experience > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          {profile.years_experience} {profile.years_experience === 1 ? 'year' : 'years'}{' '}
                          experience
                        </span>
                      )}
                      {reviews.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('reviews')}
                          className="inline-flex items-center gap-1 hover:text-[#1B3060] transition-colors"
                        >
                          <Star className="w-4 h-4 fill-[#C9A227] text-[#C9A227]" />
                          <strong className="text-gray-900">{avgRating.toFixed(1)}</strong>
                          <span className="text-gray-500">
                            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Desktop action buttons */}
                  <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                    )}
                    <Link
                      href={`/messages?to=${profile.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1B3060] text-[#1B3060] bg-white font-medium hover:bg-[#1B3060] hover:text-white transition-colors text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Link>
                    <Link
                      href={`/book/${profile.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A227] text-white font-semibold hover:bg-[#b18d1e] transition-colors text-sm shadow-md hover:shadow-lg"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Consultation
                    </Link>
                  </div>
                </div>
              </div>

              {/* Accreditation badges */}
              {hasAnyAccreditation && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium mr-1">
                    Accredited by
                  </span>
                  {profile.is_oep_verified && (
                    <AccreditationBadge label="OEP Licensed" />
                  )}
                  {profile.is_secp_verified && (
                    <AccreditationBadge label="SECP Registered" />
                  )}
                  {profile.is_beoe_verified && (
                    <AccreditationBadge label="BEOE Approved" />
                  )}
                  {profile.is_fbr_verified && (
                    <AccreditationBadge label="FBR Compliant" />
                  )}
                </div>
              )}

              {/* Mobile action buttons */}
              <div className="grid grid-cols-3 gap-2 mt-5 lg:hidden">
                {profile.phone ? (
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                ) : (
                  <div />
                )}
                <Link
                  href={`/messages?to=${profile.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#1B3060] text-[#1B3060] font-medium text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Link>
                <Link
                  href={`/book/${profile.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#C9A227] text-white font-semibold text-sm shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  Book
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ MAIN GRID ═══════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs container */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
                  <nav className="flex min-w-max" aria-label="Profile tabs">
                    <TabButton
                      active={activeTab === 'services'}
                      onClick={() => setActiveTab('services')}
                      count={services.length}
                    >
                      Services
                    </TabButton>
                    <TabButton
                      active={activeTab === 'reviews'}
                      onClick={() => setActiveTab('reviews')}
                      count={reviews.length}
                    >
                      Reviews
                    </TabButton>
                    <TabButton
                      active={activeTab === 'about'}
                      onClick={() => setActiveTab('about')}
                    >
                      About
                    </TabButton>
                  </nav>
                </div>

                <div className="p-4 sm:p-6">
                  {activeTab === 'services' && <ServicesGrid services={services} />}
                  {activeTab === 'reviews' && (
                    <ReviewsList
                      reviews={reviews}
                      avgRating={avgRating}
                      breakdown={ratingBreakdown}
                    />
                  )}
                  {activeTab === 'about' && <AboutSection profile={profile} memberSince={memberSince} />}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Contact / quick action card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 text-lg">Get in touch</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Discuss your visa needs directly with {displayName.split(' ')[0]}.
                  </p>

                  {reviews.length > 0 && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-gradient-to-br from-[#1B3060]/5 to-[#C9A227]/5 rounded-lg border border-gray-100">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#1B3060]">
                          {avgRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`w-3 h-3 ${
                                n <= Math.round(avgRating)
                                  ? 'fill-[#C9A227] text-[#C9A227]'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 text-sm text-gray-700">
                        <strong>{reviews.length}</strong> verified{' '}
                        {reviews.length === 1 ? 'review' : 'reviews'} from real seekers
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mt-5">
                    <Link
                      href={`/book/${profile.id}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-[#C9A227] text-white font-semibold hover:bg-[#b18d1e] transition-colors shadow-md hover:shadow-lg"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Consultation
                    </Link>
                    <Link
                      href={`/messages?to=${profile.id}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-[#1B3060] text-[#1B3060] font-semibold hover:bg-[#1B3060] hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send Message
                    </Link>
                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call Now
                      </a>
                    )}
                  </div>

                  {memberSince && (
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Member since {memberSince}
                    </p>
                  )}
                </div>

                {/* Trust card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#1B3060]" />
                    Why Visagate
                  </h3>
                  <ul className="mt-4 space-y-3">
                    <TrustItem
                      icon={CheckCircle2}
                      title="Verified consultants only"
                      sub="OEP, SECP & BEOE accredited"
                    />
                    <TrustItem
                      icon={Shield}
                      title="Secure platform"
                      sub="Your data stays private"
                    />
                    <TrustItem
                      icon={Award}
                      title="Genuine reviews"
                      sub="From real visa seekers"
                    />
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

// ───────────────────────── Sub-components ─────────────────────────

interface TabButtonProps {
  active: boolean
  onClick: () => void
  count?: number
  children: React.ReactNode
}

function TabButton({ active, onClick, count, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-5 sm:px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
        active ? 'text-[#1B3060]' : 'text-gray-600 hover:text-gray-900'
      }`}
      aria-selected={active}
      role="tab"
    >
      <span className="flex items-center gap-2">
        {children}
        {count != null && count > 0 && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              active ? 'bg-[#1B3060] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {count}
          </span>
        )}
      </span>
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A227]" />}
    </button>
  )
}

function AccreditationBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1B3060]/5 border border-[#1B3060]/15 text-[#1B3060] text-xs font-semibold">
      <CheckCircle2 className="w-3 h-3" />
      {label}
    </span>
  )
}

function TrustItem({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  sub: string
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#C9A227]" />
      </div>
      <div className="text-sm">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-gray-500 text-xs">{sub}</div>
      </div>
    </li>
  )
}

// ──────────── Services ────────────

function ServicesGrid({ services }: { services: Service[] }) {
  if (services.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No services yet"
        description="This consultant hasn't published any services. Check back soon or send them a message."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {services.map((s) => (
        <ServiceCard key={s.id} service={s} />
      ))}
    </div>
  )
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#C9A227]/50 transition-all duration-300"
    >
      <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B3060]/10 via-[#C9A227]/5 to-[#1B3060]/10 flex items-center justify-center">
            <Globe className="w-14 h-14 text-[#1B3060]/30" />
          </div>
        )}
        {service.visa_type && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-[#1B3060] shadow-sm">
            {service.visa_type}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#1B3060] transition-colors leading-snug">
          {service.title}
        </h3>
        {service.destination_country && (
          <p className="text-xs text-gray-500 mt-1.5 inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {service.destination_country}
          </p>
        )}

        <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {service.processing_days ? `${service.processing_days} days` : 'Varies'}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Starting at</div>
            <div className="font-bold text-[#1B3060] text-base">
              {formatPrice(service.price_min)}
            </div>
          </div>
        </div>

        <div className="mt-3 inline-flex items-center justify-center gap-1 text-sm font-medium text-[#1B3060] group-hover:text-[#C9A227] transition-colors">
          View Details
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

// ──────────── Reviews ────────────

interface ReviewsListProps {
  reviews: Review[]
  avgRating: number
  breakdown: number[] // [5★, 4★, 3★, 2★, 1★]
}

function ReviewsList({ reviews, avgRating, breakdown }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No reviews yet"
        description="Be the first to share your experience after working with this consultant."
      />
    )
  }

  const maxCount = Math.max(...breakdown, 1)

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="grid sm:grid-cols-2 gap-6 p-4 sm:p-5 bg-gradient-to-br from-[#1B3060]/5 to-[#C9A227]/5 rounded-xl border border-gray-100">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-bold text-[#1B3060]">{avgRating.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-5 h-5 ${
                  n <= Math.round(avgRating)
                    ? 'fill-[#C9A227] text-[#C9A227]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        <div className="space-y-1.5">
          {breakdown.map((count, i) => {
            const stars = 5 - i
            const pct = (count / maxCount) * 100
            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-gray-600 font-medium">{stars}★</span>
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                  <div
                    className="h-full bg-[#C9A227] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const reviewer = getReviewer(review)
          return (
            <div
              key={review.id}
              className="p-4 sm:p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                  {reviewer?.avatar_url ? (
                    <Image
                      src={reviewer.avatar_url}
                      alt={reviewer.full_name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1B3060] to-[#243d7a] flex items-center justify-center text-white font-semibold text-sm">
                      {getInitial(reviewer?.full_name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="font-medium text-gray-900 text-sm">
                      {reviewer?.full_name || 'Anonymous'}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(review.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${
                          n <= review.rating
                            ? 'fill-[#C9A227] text-[#C9A227]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-line">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ──────────── About ────────────

function AboutSection({
  profile,
  memberSince,
}: {
  profile: Profile
  memberSince: string | null
}) {
  const hasContent =
    profile.bio ||
    (profile.specializations && profile.specializations.length > 0) ||
    (profile.languages && profile.languages.length > 0) ||
    profile.office_address

  if (!hasContent) {
    return (
      <EmptyState
        icon={Mail}
        title="No additional information"
        description="This consultant hasn't filled out their profile yet."
      />
    )
  }

  return (
    <div className="space-y-6">
      {profile.bio && (
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-2">About</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
        </div>
      )}

      {profile.specializations && profile.specializations.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C9A227]" />
            Specializations
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.specializations.map((spec) => (
              <span
                key={spec}
                className="px-3 py-1.5 rounded-full bg-[#1B3060]/5 text-[#1B3060] text-sm font-medium border border-[#1B3060]/10"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.languages && profile.languages.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#C9A227]" />
            Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.office_address && (
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C9A227]" />
            Office Address
          </h3>
          <p className="text-gray-700 leading-relaxed">{profile.office_address}</p>
        </div>
      )}

      {memberSince && (
        <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
          Member of Visagate since {memberSince}
        </div>
      )}
    </div>
  )
}

// ──────────── Empty state ────────────

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1 max-w-sm mx-auto">{description}</p>
    </div>
  )
}