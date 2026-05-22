'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star, MapPin, Phone, MessageCircle, Calendar, CheckCircle2,
  Shield, Award, Briefcase, Globe, Clock, ChevronRight, Mail,
  Languages, Tag, Building2, Sparkles, ExternalLink,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Profile {
  id: string; full_name: string; display_name: string | null
  business_name: string | null; city: string | null; avatar_url: string | null
  cover_image_url: string | null; years_experience: number | null; bio: string | null
  phone: string | null; website_url: string | null; verification_status: string | null
  is_verified: boolean | null; is_oep_verified: boolean | null; is_secp_verified: boolean | null
  is_beoe_verified: boolean | null; is_fbr_verified: boolean | null
  languages: string[] | null; specializations: string[] | null
  office_address: string | null; created_at: string | null
}
interface Service {
  id: string; title: string; description: string | null; visa_type: string | null
  destination_country: string | null; price_min: number | null; price_max: number | null
  processing_days: number | null; image_url: string | null; created_at: string | null
}
interface Reviewer { id: string; full_name: string; avatar_url: string | null }
interface Review {
  id: string; rating: number; comment: string | null; created_at: string
  reviewer: Reviewer | Reviewer[] | null
}
interface Props { profile: Profile; services: Service[]; reviews: Review[] }
type TabKey = 'services' | 'reviews' | 'about'

function formatPrice(v: number | null) { return v == null ? '—' : `PKR ${v.toLocaleString('en-PK')}` }
function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function getReviewer(r: Review): Reviewer | null {
  if (!r.reviewer) return null
  return Array.isArray(r.reviewer) ? r.reviewer[0] ?? null : r.reviewer
}
function getInitial(name: string | null | undefined) { return (name?.trim().charAt(0) || '?').toUpperCase() }
function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}
function whatsappUrl(phone: string) {
  const clean = phone.replace(/[\s\-\(\)]/g, '')
  const num = clean.startsWith('+') ? clean.slice(1) : clean.startsWith('0') ? `92${clean.slice(1)}` : clean
  return `https://wa.me/${num}`
}

const WAIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

export default function ConsultantProfileClient({ profile, services, reviews }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('services')
  const displayName = profile.display_name?.trim() || profile.full_name
  const firstName = displayName.split(' ')[0]
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : null
  const { avgRating, ratingBreakdown } = useMemo(() => {
    if (reviews.length === 0) return { avgRating: 0, ratingBreakdown: [0,0,0,0,0] }
    const total = reviews.reduce((s, r) => s + r.rating, 0)
    const bd = [0,0,0,0,0]
    reviews.forEach(r => { bd[Math.min(Math.max(Math.round(r.rating),1),5)-1]++ })
    return { avgRating: total/reviews.length, ratingBreakdown: bd.reverse() }
  }, [reviews])
  const hasAccred = profile.is_oep_verified||profile.is_secp_verified||profile.is_beoe_verified||profile.is_fbr_verified
  const msgHref = `/dashboard/seeker/messages?to=${profile.id}`

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* COVER */}
        <section className="relative">
          <div className="relative h-44 sm:h-60 md:h-72 lg:h-80 w-full overflow-hidden">
            {profile.cover_image_url ? (
              <Image src={profile.cover_image_url} alt={`${displayName} cover`} fill priority sizes="100vw" className="object-cover"/>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1B3060] via-[#243d7a] to-[#1B3060]">
                <div className="absolute inset-0 opacity-15" style={{backgroundImage:'radial-gradient(circle at 20% 30%,rgba(201,162,39,.4) 1.5px,transparent 1.5px),radial-gradient(circle at 75% 70%,rgba(255,255,255,.3) 1.5px,transparent 1.5px)',backgroundSize:'50px 50px,70px 70px'}}/>
                <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden md:block">
                  <Sparkles className="w-24 h-24 text-[#C9A227]/30"/>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"/>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-16 sm:-mt-20 pb-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-6">

                {/* ✅ FIXED: Avatar — ternary colon was missing, causing broken fallback rendering */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full ring-4 ring-white shadow-2xl overflow-hidden bg-white flex-shrink-0">
                  {profile.avatar_url
                    ? <Image
                        src={profile.avatar_url}
                        alt={displayName}
                        fill
                        sizes="(max-width:640px) 112px,(max-width:1024px) 144px,176px"
                        className="object-cover"
                      />
                    : <div className="w-full h-full bg-gradient-to-br from-[#1B3060] to-[#243d7a] flex items-center justify-center text-white font-bold text-3xl select-none">
                        {getInitials(profile.display_name || profile.full_name)}
                      </div>
                  }
                  {profile.is_verified && (
                    <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1.5 ring-2 ring-white">
                      <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3}/>
                    </div>
                  )}
                </div>

                {/* Name + meta */}
                <div className="flex-1 lg:pb-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-gray-900 leading-tight">{displayName}</h1>
                    {profile.is_verified && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                        <Shield className="w-3 h-3"/> Verified
                      </span>
                    )}
                  </div>
                  {profile.business_name && (
                    <p className="text-base sm:text-lg text-gray-700 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-gray-400"/>{profile.business_name}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-600">
                    {profile.city && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400"/>{profile.city}</span>}
                    {profile.years_experience != null && profile.years_experience > 0 && (
                      <span className="inline-flex items-center gap-1"><Briefcase className="w-4 h-4 text-gray-400"/>
                        {profile.years_experience} {profile.years_experience===1?'year':'years'} experience
                      </span>
                    )}
                    {reviews.length > 0 && (
                      <button type="button" onClick={() => setActiveTab('reviews')} className="inline-flex items-center gap-1 hover:text-[#1B3060] transition-colors">
                        <Star className="w-4 h-4 fill-[#C9A227] text-[#C9A227]"/>
                        <strong className="text-gray-900">{avgRating.toFixed(1)}</strong>
                        <span className="text-gray-500">({reviews.length} {reviews.length===1?'review':'reviews'})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {hasAccred && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium mr-1">Accredited by</span>
                  {profile.is_oep_verified && <AccBadge label="OEP Licensed"/>}
                  {profile.is_secp_verified && <AccBadge label="SECP Registered"/>}
                  {profile.is_beoe_verified && <AccBadge label="BEOE Approved"/>}
                  {profile.is_fbr_verified && <AccBadge label="FBR Compliant"/>}
                </div>
              )}

              {/* Mobile buttons only */}
              <div className="grid grid-cols-2 gap-2 mt-5 lg:hidden">
                <Link href={msgHref} className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#1B3060] text-[#1B3060] font-medium text-sm">
                  <MessageCircle className="w-4 h-4"/> Message
                </Link>
                <Link href={`/book/${profile.id}`} className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#C9A227] text-white font-semibold text-sm shadow-md">
                  <Calendar className="w-4 h-4"/> Book
                </Link>
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium text-sm">
                    <Phone className="w-4 h-4"/> Call
                  </a>
                )}
                {profile.phone && (
                  <a href={whatsappUrl(profile.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-green-500 bg-green-50 text-green-700 font-medium text-sm">
                    <WAIcon className="w-4 h-4"/> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 overflow-x-auto">
                  <nav className="flex min-w-max">
                    <TabBtn active={activeTab==='services'} onClick={() => setActiveTab('services')} count={services.length}>Services</TabBtn>
                    <TabBtn active={activeTab==='reviews'} onClick={() => setActiveTab('reviews')} count={reviews.length}>Reviews</TabBtn>
                    <TabBtn active={activeTab==='about'} onClick={() => setActiveTab('about')}>About</TabBtn>
                  </nav>
                </div>
                <div className="p-4 sm:p-6">
                  {activeTab==='services' && <ServicesGrid services={services}/>}
                  {activeTab==='reviews' && <ReviewsList reviews={reviews} avgRating={avgRating} breakdown={ratingBreakdown}/>}
                  {activeTab==='about' && <AboutSection profile={profile} memberSince={memberSince}/>}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 text-lg">Get in Touch</h3>
                  <p className="text-sm text-gray-600 mt-1">Discuss your visa needs directly with {firstName}.</p>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-gradient-to-br from-[#1B3060]/5 to-[#C9A227]/5 rounded-lg border border-gray-100">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#1B3060]">{avgRating.toFixed(1)}</div>
                        <div className="flex items-center justify-center gap-0.5">
                          {[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n<=Math.round(avgRating)?'fill-[#C9A227] text-[#C9A227]':'text-gray-300'}`}/>)}
                        </div>
                      </div>
                      <div className="flex-1 text-sm text-gray-700">
                        <strong>{reviews.length}</strong> verified {reviews.length===1?'review':'reviews'} from real seekers
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 mt-5">
                    <Link href={`/book/${profile.id}`} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-[#C9A227] text-white font-semibold hover:bg-[#b18d1e] transition-colors shadow-md">
                      <Calendar className="w-4 h-4"/> Book Consultation
                    </Link>
                    <Link href={msgHref} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-[#1B3060] text-[#1B3060] font-semibold hover:bg-[#1B3060] hover:text-white transition-colors">
                      <MessageCircle className="w-4 h-4"/> Send Message
                    </Link>
                    {profile.phone && (
                      <a href={whatsappUrl(profile.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-green-500 text-green-700 font-semibold hover:bg-green-500 hover:text-white transition-colors">
                        <WAIcon className="w-4 h-4"/> WhatsApp
                      </a>
                    )}
                    {profile.phone && (
                      <a href={`tel:${profile.phone}`} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition-colors">
                        <Phone className="w-4 h-4"/> Call Now
                      </a>
                    )}
                    {profile.website_url && (
                      <a href={profile.website_url.startsWith('http')?profile.website_url:`https://${profile.website_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                        <Globe className="w-4 h-4"/> Visit Website <ExternalLink className="w-3 h-3 text-gray-400"/>
                      </a>
                    )}
                  </div>
                  {memberSince && <p className="text-xs text-gray-500 mt-4 text-center">Member since {memberSince}</p>}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#1B3060]"/> Why VisaGate
                  </h3>
                  <ul className="mt-4 space-y-3">
                    <TrustItem icon={CheckCircle2} title="Verified consultants only" sub="OEP, SECP & BEOE accredited"/>
                    <TrustItem icon={Shield} title="Secure platform" sub="Your data stays private"/>
                    <TrustItem icon={Award} title="Genuine reviews" sub="From real visa seekers"/>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  )
}

function TabBtn({ active, onClick, count, children }: { active:boolean; onClick:()=>void; count?:number; children:React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} role="tab" aria-selected={active}
      className={`relative px-5 sm:px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${active?'text-[#1B3060]':'text-gray-600 hover:text-gray-900'}`}>
      <span className="flex items-center gap-2">
        {children}
        {count!=null&&count>0&&<span className={`text-xs px-2 py-0.5 rounded-full ${active?'bg-[#1B3060] text-white':'bg-gray-100 text-gray-600'}`}>{count}</span>}
      </span>
      {active&&<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A227]"/>}
    </button>
  )
}

function AccBadge({ label }: { label:string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1B3060]/5 border border-[#1B3060]/15 text-[#1B3060] text-xs font-semibold">
      <CheckCircle2 className="w-3 h-3"/> {label}
    </span>
  )
}

function TrustItem({ icon: Icon, title, sub }: { icon:React.ComponentType<{className?:string}>; title:string; sub:string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#C9A227]"/>
      </div>
      <div className="text-sm">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-gray-500 text-xs">{sub}</div>
      </div>
    </li>
  )
}

function ServicesGrid({ services }: { services:Service[] }) {
  if (services.length===0) return <EmptyState icon={Briefcase} title="No services yet" description="This consultant hasn't published any services yet."/>
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {services.map(s => <ServiceCard key={s.id} service={s}/>)}
    </div>
  )
}

function ServiceCard({ service }: { service:Service }) {
  return (
    <Link href={`/services/${service.id}`} className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#C9A227]/50 transition-all duration-300">
      <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
        {service.image_url
          ? <Image src={service.image_url} alt={service.title} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" className="object-cover group-hover:scale-105 transition-transform duration-500"/>
          : <div className="absolute inset-0 bg-gradient-to-br from-[#1B3060]/10 via-[#C9A227]/5 to-[#1B3060]/10 flex items-center justify-center"><Globe className="w-14 h-14 text-[#1B3060]/30"/></div>
        }
        {service.visa_type && <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-[#1B3060] shadow-sm">{service.visa_type}</span>}
      </div>
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#1B3060] transition-colors leading-snug">{service.title}</h3>
        {service.destination_country && <p className="text-xs text-gray-500 mt-1.5 inline-flex items-center gap-1"><MapPin className="w-3 h-3"/>{service.destination_country}</p>}
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 inline-flex items-center gap-1">
            <Clock className="w-3 h-3"/>{service.processing_days?`${service.processing_days} days`:'Varies'}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Starting at</div>
            <div className="font-bold text-[#1B3060] text-base">{formatPrice(service.price_min)}</div>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center justify-center gap-1 text-sm font-medium text-[#1B3060] group-hover:text-[#C9A227] transition-colors">
          View Details <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"/>
        </div>
      </div>
    </Link>
  )
}

function ReviewsList({ reviews, avgRating, breakdown }: { reviews:Review[]; avgRating:number; breakdown:number[] }) {
  if (reviews.length===0) return <EmptyState icon={Star} title="No reviews yet" description="Be the first to share your experience."/>
  const maxCount = Math.max(...breakdown, 1)
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6 p-4 sm:p-5 bg-gradient-to-br from-[#1B3060]/5 to-[#C9A227]/5 rounded-xl border border-gray-100">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-bold text-[#1B3060]">{avgRating.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 mt-2">
            {[1,2,3,4,5].map(n=><Star key={n} className={`w-5 h-5 ${n<=Math.round(avgRating)?'fill-[#C9A227] text-[#C9A227]':'text-gray-300'}`}/>)}
          </div>
          <div className="text-sm text-gray-600 mt-2">Based on {reviews.length} {reviews.length===1?'review':'reviews'}</div>
        </div>
        <div className="space-y-1.5">
          {breakdown.map((count,i) => {
            const stars=5-i; const pct=(count/maxCount)*100
            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-gray-600 font-medium">{stars}★</span>
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                  <div className="h-full bg-[#C9A227] rounded-full" style={{width:`${pct}%`}}/>
                </div>
                <span className="w-8 text-right text-gray-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map(review => {
          const reviewer = getReviewer(review)
          return (
            <div key={review.id} className="p-4 sm:p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                  {reviewer?.avatar_url
                    ? <Image src={reviewer.avatar_url} alt={reviewer.full_name} width={40} height={40} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full bg-gradient-to-br from-[#1B3060] to-[#243d7a] flex items-center justify-center text-white font-semibold text-sm">{getInitial(reviewer?.full_name)}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="font-medium text-gray-900 text-sm">{reviewer?.full_name||'Anonymous'}</div>
                    <div className="text-xs text-gray-500">{formatDate(review.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(n=><Star key={n} className={`w-3.5 h-3.5 ${n<=review.rating?'fill-[#C9A227] text-[#C9A227]':'text-gray-300'}`}/>)}
                  </div>
                  {review.comment && <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-line">{review.comment}</p>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AboutSection({ profile, memberSince }: { profile:Profile; memberSince:string|null }) {
  const has = profile.bio||(profile.specializations?.length??0)>0||(profile.languages?.length??0)>0||profile.office_address||profile.website_url
  if (!has) return <EmptyState icon={Mail} title="No additional information" description="This consultant hasn't filled out their profile yet."/>
  return (
    <div className="space-y-6">
      {profile.bio && <div><h3 className="font-semibold text-gray-900 text-base mb-2">About</h3><p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p></div>}
      {profile.specializations&&profile.specializations.length>0 && (
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-[#C9A227]"/> Specializations</h3>
          <div className="flex flex-wrap gap-2">{profile.specializations.map(s=><span key={s} className="px-3 py-1.5 rounded-full bg-[#1B3060]/5 text-[#1B3060] text-sm font-medium border border-[#1B3060]/10">{s}</span>)}</div>
        </div>
      )}
      {profile.languages&&profile.languages.length>0 && (
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2"><Languages className="w-4 h-4 text-[#C9A227]"/> Languages</h3>
          <div className="flex flex-wrap gap-2">{profile.languages.map(l=><span key={l} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">{l}</span>)}</div>
        </div>
      )}
      {profile.office_address && (
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#C9A227]"/> Office Address</h3>
          <p className="text-gray-700 leading-relaxed">{profile.office_address}</p>
        </div>
      )}
      {profile.website_url && (
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-[#C9A227]"/> Website</h3>
          <a href={profile.website_url.startsWith('http')?profile.website_url:`https://${profile.website_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#1B3060] hover:text-[#C9A227] transition-colors text-sm font-medium underline underline-offset-2">
            {profile.website_url}<ExternalLink className="w-3.5 h-3.5"/>
          </a>
        </div>
      )}
      {memberSince && <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">Member of VisaGate since {memberSince}</div>}
    </div>
  )
}

function EmptyState({ icon:Icon, title, description }: { icon:React.ComponentType<{className?:string}>; title:string; description:string }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"><Icon className="w-7 h-7 text-gray-400"/></div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1 max-w-sm mx-auto">{description}</p>
    </div>
  )
}