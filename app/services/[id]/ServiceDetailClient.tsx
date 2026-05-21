'use client'

import { useMemo } from 'react'
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
  Clock,
  Globe,
  ChevronRight,
  Lock,
  BadgeCheck,
  Briefcase,
  ArrowRight,
  FileCheck2,
  Headphones,
  PiggyBank,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// ───────────────────────── Types ─────────────────────────

interface Consultant {
  id: string
  full_name: string
  display_name: string | null
  business_name: string | null
  city: string | null
  avatar_url: string | null
  years_experience: number | null
  is_verified: boolean | null
  is_oep_verified: boolean | null
  is_secp_verified: boolean | null
  is_beoe_verified: boolean | null
  is_fbr_verified: boolean | null
  phone: string | null
}

interface Service {
  id: string
  consultant_id: string
  title: string
  description: string | null
  visa_type: string | null
  destination_country: string | null
  price_min: number | null
  price_max: number | null
  processing_days: number | null
  image_url: string | null
  is_active: boolean | null
  created_at: string | null
}

interface RelatedService {
  id: string
  title: string
  visa_type: string | null
  destination_country: string | null
  price_min: number | null
  processing_days: number | null
  image_url: string | null
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
  reviewer: Reviewer | Reviewer[] | null
}

interface Props {
  service: Service
  consultant: Consultant
  reviews: Review[]
  relatedServices: RelatedService[]
}

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

// Build a "what's included" list from description bullets or sensible defaults
function buildIncluded(description: string | null): string[] {
  // If the description contains bullet-like lines, extract them
  if (description) {
    const lines = description
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^([•\-*]|\d+[.)])\s+/.test(l))
      .map((l) => l.replace(/^([•\-*]|\d+[.)])\s+/, ''))
    if (lines.length >= 3) return lines.slice(0, 8)
  }
  return [
    'Free initial consultation',
    'Document checklist & review',
    'Application form filling',
    'Visa interview preparation',
    'Continuous status updates',
    'Post-approval guidance',
  ]
}

// ───────────────────────── Main Component ─────────────────────────

export default function ServiceDetailClient({
  service,
  consultant,
  reviews,
  relatedServices,
}: Props) {
  const consultantName = consultant.display_name?.trim() || consultant.full_name
  const included = useMemo(() => buildIncluded(service.description), [service.description])

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  }, [reviews])

  const priceDisplay = useMemo(() => {
    if (service.price_min == null && service.price_max == null) {
      return { from: '—', to: null as string | null }
    }
    if (service.price_min != null && service.price_max != null && service.price_min !== service.price_max) {
      return { from: formatPrice(service.price_min), to: formatPrice(service.price_max) }
    }
    return { from: formatPrice(service.price_min ?? service.price_max), to: null }
  }, [service.price_min, service.price_max])

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 text-xs text-gray-500">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-[#1B3060]">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3" />
            </li>
            <li>
              <Link href="/consultants" className="hover:text-[#1B3060]">
                Consultants
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3" />
            </li>
            <li>
              <Link href={`/consultants/${consultant.id}`} className="hover:text-[#1B3060]">
                {consultantName}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3" />
            </li>
            <li className="text-gray-700 truncate max-w-[200px]" title={service.title}>
              {service.title}
            </li>
          </ol>
        </nav>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ══════════ LEFT COLUMN ══════════ */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title block */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {service.visa_type && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#1B3060]/5 text-[#1B3060] text-xs font-semibold border border-[#1B3060]/15">
                      {service.visa_type}
                    </span>
                  )}
                  {service.destination_country && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C9A227]/10 text-[#9b7d1f] text-xs font-semibold border border-[#C9A227]/30">
                      <Globe className="w-3 h-3" />
                      {service.destination_country}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-gray-900 leading-tight">
                  {service.title}
                </h1>

                {/* Consultant mini card */}
                <Link
                  href={`/consultants/${consultant.id}`}
                  className="inline-flex items-center gap-3 mt-4 p-2 pr-4 rounded-full bg-white border border-gray-200 hover:border-[#C9A227]/50 hover:shadow-md transition-all group"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {consultant.avatar_url ? (
                      <Image
                        src={consultant.avatar_url}
                        alt={consultantName}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1B3060] to-[#243d7a] flex items-center justify-center text-white font-semibold">
                        {getInitial(consultant.full_name)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 group-hover:text-[#1B3060] transition-colors">
                        {consultantName}
                      </span>
                      {consultant.is_verified && (
                        <BadgeCheck className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {reviews.length > 0 && (
                        <span className="inline-flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-[#C9A227] text-[#C9A227]" />
                          {avgRating.toFixed(1)} ({reviews.length})
                        </span>
                      )}
                      {consultant.years_experience != null && consultant.years_experience > 0 && (
                        <>
                          <span>•</span>
                          <span>{consultant.years_experience}y experience</span>
                        </>
                      )}
                      {consultant.city && (
                        <>
                          <span>•</span>
                          <span>{consultant.city}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Hero image */}
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                {service.image_url ? (
                  <Image
                    src={service.image_url}
                    alt={service.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1B3060] via-[#243d7a] to-[#1B3060] flex items-center justify-center">
                    <div className="text-center text-white/80">
                      <Globe className="w-20 h-20 mx-auto opacity-50" />
                      <div className="text-sm mt-2 opacity-70">
                        {service.destination_country || 'Visa service'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* About this service */}
              {service.description && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About this service</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {service.description}
                  </div>
                </div>
              )}

              {/* What's included */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#C9A227]" />
                  What's included
                </h2>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Processing timeline */}
              {service.processing_days && service.processing_days > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#C9A227]" />
                    Processing timeline
                  </h2>
                  <ProcessingTimeline totalDays={service.processing_days} />
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#C9A227] fill-[#C9A227]" />
                    Reviews
                    {reviews.length > 0 && (
                      <span className="text-sm font-normal text-gray-500">
                        {avgRating.toFixed(1)} ({reviews.length})
                      </span>
                    )}
                  </h2>
                  {reviews.length > 0 && (
                    <Link
                      href={`/consultants/${consultant.id}`}
                      className="text-sm font-medium text-[#1B3060] hover:text-[#C9A227] inline-flex items-center gap-1"
                    >
                      See all
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-600 py-6 text-center">
                    No reviews yet. Be the first to share your experience.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => {
                      const reviewer = getReviewer(review)
                      return (
                        <div
                          key={review.id}
                          className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                              {reviewer?.avatar_url ? (
                                <Image
                                  src={reviewer.avatar_url}
                                  alt={reviewer.full_name}
                                  width={36}
                                  height={36}
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
                                <div className="text-xs text-gray-500">
                                  {formatDate(review.created_at)}
                                </div>
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
                )}
              </div>
            </div>

            {/* ══════════ RIGHT COLUMN (STICKY) ══════════ */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Price / booking card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  <div className="p-5">
                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">
                        Service Fee
                      </div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <div className="text-3xl font-bold text-[#1B3060]">{priceDisplay.from}</div>
                        {priceDisplay.to && (
                          <>
                            <span className="text-gray-400">→</span>
                            <div className="text-lg font-semibold text-gray-700">
                              {priceDisplay.to}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick facts */}
                    <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" />
                          Processing
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {service.processing_days ? `${service.processing_days} days` : 'Varies'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <Globe className="w-3 h-3" />
                          Destination
                        </div>
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {service.destination_country || '—'}
                        </div>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="space-y-2 mt-4">
                      <Link
                        href={`/book/${consultant.id}?service=${service.id}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-lg bg-[#C9A227] text-white font-semibold hover:bg-[#b18d1e] transition-colors shadow-md hover:shadow-lg"
                      >
                        <Calendar className="w-4 h-4" />
                        Book Consultation
                      </Link>
                      <Link
                        href={`/messages?to=${consultant.id}&service=${service.id}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-[#1B3060] text-[#1B3060] font-semibold hover:bg-[#1B3060] hover:text-white transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message Consultant
                      </Link>
                      {consultant.phone && (
                        <a
                          href={`tel:${consultant.phone}`}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:text-[#1B3060] transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {consultant.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Trust strip */}
                  <div className="bg-gray-50 px-5 py-4 space-y-2.5 border-t border-gray-100">
                    <TrustBadge
                      icon={BadgeCheck}
                      title="Verified Consultant"
                      sub={
                        consultant.is_oep_verified || consultant.is_secp_verified
                          ? 'OEP / SECP accredited'
                          : 'Identity verified'
                      }
                    />
                    <TrustBadge
                      icon={Lock}
                      title="Secure Platform"
                      sub="Private & encrypted"
                    />
                    <TrustBadge
                      icon={PiggyBank}
                      title="No Hidden Fees"
                      sub="Pay consultant directly"
                    />
                    <TrustBadge
                      icon={Headphones}
                      title="Visagate Support"
                      sub="We've got your back"
                    />
                  </div>
                </div>

                {/* Accreditation card */}
                {(consultant.is_oep_verified ||
                  consultant.is_secp_verified ||
                  consultant.is_beoe_verified ||
                  consultant.is_fbr_verified) && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#1B3060]" />
                      Accreditation
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {consultant.is_oep_verified && <AccBadge label="OEP" />}
                      {consultant.is_secp_verified && <AccBadge label="SECP" />}
                      {consultant.is_beoe_verified && <AccBadge label="BEOE" />}
                      {consultant.is_fbr_verified && <AccBadge label="FBR" />}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* ══════════ RELATED SERVICES ══════════ */}
          {relatedServices.length > 0 && (
            <div className="mt-12 lg:mt-16">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  More from {consultantName.split(' ')[0]}
                </h2>
                <Link
                  href={`/consultants/${consultant.id}`}
                  className="text-sm font-medium text-[#1B3060] hover:text-[#C9A227] inline-flex items-center gap-1"
                >
                  View all services
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {relatedServices.map((s) => (
                  <RelatedServiceCard key={s.id} service={s} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}

// ───────────────────────── Sub-components ─────────────────────────

function TrustBadge({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  sub: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
        <Icon className="w-3.5 h-3.5 text-[#1B3060]" />
      </div>
      <div className="text-xs leading-tight">
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-gray-500 mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

function AccBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1B3060]/5 border border-[#1B3060]/15">
      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      <span className="text-xs font-semibold text-[#1B3060]">{label}</span>
    </div>
  )
}

function ProcessingTimeline({ totalDays }: { totalDays: number }) {
  const stages = [
    { label: 'Consultation', icon: MessageCircle, pct: 5 },
    { label: 'Document prep', icon: FileCheck2, pct: 25 },
    { label: 'Submission', icon: Briefcase, pct: 50 },
    { label: 'Processing', icon: Clock, pct: 90 },
    { label: 'Decision', icon: Award, pct: 100 },
  ]

  return (
    <div>
      <div className="relative pb-2">
        {/* Track */}
        <div className="absolute left-3 right-3 top-4 h-0.5 bg-gray-200" />
        <div className="grid grid-cols-5 gap-1 relative">
          {stages.map((stage, i) => {
            const Icon = stage.icon
            return (
              <div key={stage.label} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                    i === 0
                      ? 'bg-[#C9A227] text-white shadow-md'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-700 mt-2 text-center leading-tight font-medium">
                  {stage.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-4 p-3 bg-gradient-to-r from-[#1B3060]/5 to-[#C9A227]/5 rounded-lg flex items-center gap-3 text-sm">
        <Clock className="w-4 h-4 text-[#1B3060] flex-shrink-0" />
        <span className="text-gray-700">
          Total estimated time: <strong className="text-[#1B3060]">{totalDays} days</strong>{' '}
          <span className="text-xs text-gray-500">(may vary by embassy)</span>
        </span>
      </div>
    </div>
  )
}

function RelatedServiceCard({ service }: { service: RelatedService }) {
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B3060]/10 via-[#C9A227]/5 to-[#1B3060]/10 flex items-center justify-center">
            <Globe className="w-10 h-10 text-[#1B3060]/30" />
          </div>
        )}
        {service.visa_type && (
          <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#1B3060] shadow-sm">
            {service.visa_type}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-[#1B3060] transition-colors leading-snug">
          {service.title}
        </h3>
        {service.destination_country && (
          <p className="text-[11px] text-gray-500 mt-1 inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {service.destination_country}
          </p>
        )}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="text-[10px] text-gray-500 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {service.processing_days ? `${service.processing_days}d` : '—'}
          </div>
          <div className="text-right">
            <div className="text-[9px] text-gray-500 uppercase">From</div>
            <div className="font-bold text-[#1B3060] text-sm">
              {formatPrice(service.price_min)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}