'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin, Star, Phone, BadgeCheck, Briefcase,
  Globe, Heart, Share2, ChevronRight,
  Clock, DollarSign, CheckCircle, ArrowLeft, Calendar
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Props {
  consultant: any
  services: any[]
  reviews: any[]
}

export default function ConsultantProfileClient({ consultant: c, services, reviews }: Props) {
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services')
  const [saved, setSaved] = useState(false)

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0
  const rating = Math.round(avgRating * 10) / 10

  const getInitials = (name: string | null) => {
    if (!name) return 'VC'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  const avatarUrl = c.avatar_url
    ? c.avatar_url.startsWith('http')
      ? c.avatar_url
      : `${supabaseUrl}/storage/v1/object/public/avatars/${c.avatar_url}`
    : null

  const waNumber = (c.whatsapp_number || c.phone || '').replace(/\D/g, '')
  const waMessage = encodeURIComponent(`Hi ${c.display_name}, I found your profile on VisaGate.pk and would like to inquire about your visa services.`)
  const whatsappUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null

  const TABS = [
    { key: 'services', label: 'Services', count: services.length },
    { key: 'reviews', label: 'Reviews', count: reviews.length },
    { key: 'about', label: 'About', count: null },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs font-body text-gray-400">
            <Link href="/" className="hover:text-navy transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/consultants" className="hover:text-navy transition-colors">Find Consultants</Link>
            <ChevronRight size={12} />
            <span className="text-navy font-medium">{c.display_name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column */}
          <div className="flex-1 min-w-0">

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">

              {/* Cover banner */}
              <div className="h-28 bg-gradient-to-r from-navy to-blue-800 relative">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-3 right-8 w-20 h-20 rounded-full border-2 border-white" />
                  <div className="absolute bottom-2 left-12 w-12 h-12 rounded-full border border-white" />
                </div>
              </div>

              <div className="px-6 pb-6">
                {/* Avatar row */}
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-navy flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={c.display_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-heading font-bold text-white text-2xl">
                        {getInitials(c.display_name)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-12">
                    <button
                      onClick={() => setSaved(!saved)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        saved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <Heart size={16} className={saved ? 'fill-red-500' : ''} />
                    </button>
                    <button className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:border-gray-300 transition-all">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="font-heading font-bold text-navy text-2xl">{c.display_name}</h1>
                    {c.is_verified && (
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <BadgeCheck size={12} /> Verified
                      </div>
                    )}
                  </div>
                  {c.business_name && (
                    <p className="font-body text-gray-500 text-sm mb-2">{c.business_name}</p>
                  )}

                  {/* Location + exp */}
                  <div className="flex flex-wrap items-center gap-4 text-sm font-body text-gray-500">
                    {c.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gold" />
                        {c.city}
                      </span>
                    )}
                    {c.office_address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-navy/30" />
                        {c.office_address}
                      </span>
                    )}
                    {c.years_experience > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-navy/50" />
                        {c.years_experience} years experience
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {rating > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={16}
                          className={i <= Math.round(rating) ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'} />
                      ))}
                    </div>
                    <span className="font-heading font-bold text-navy">{rating}</span>
                    <span className="font-body text-gray-400 text-sm">({reviews.length} reviews)</span>
                  </div>
                )}

                {/* Verification badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(c.is_beoe_verified || c.is_oep_verified || c.is_secp_verified || c.is_fbr_verified) && (
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-700 text-xs font-body font-semibold px-3 py-1.5 rounded-full">
                      <CheckCircle size={11} />
                      Registered with{' '}
                      {[
                        c.is_beoe_verified && 'BEOE',
                        c.is_oep_verified && 'OEP',
                        c.is_secp_verified && 'SECP',
                        c.is_fbr_verified && 'FBR',
                      ].filter(Boolean).join(' & ')}
                    </div>
                  )}
                </div>

                {/* Bio */}
                {c.bio && (
                  <p className="font-body text-gray-600 text-sm leading-relaxed">{c.bio}</p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {TABS.map((tab) => (
                  <button key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-heading font-semibold transition-colors ${
                      activeTab === tab.key
                        ? 'text-navy border-b-2 border-navy'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-body ${
                        activeTab === tab.key ? 'bg-navy-light text-navy' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">

                {/* Services */}
                {activeTab === 'services' && (
                  <div className="space-y-4">
                    {services.length > 0 ? services.map((s) => (
                      <div key={s.id} className="border border-gray-100 rounded-2xl p-5 hover:border-gold/30 hover:shadow-sm transition-all">
                        {s.image_url && (
                          <div className="h-36 rounded-xl overflow-hidden mb-4 bg-gray-100">
                            <img
                              src={`${supabaseUrl}/storage/v1/object/public/avatars/${s.image_url}`}
                              alt={s.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-heading font-bold text-navy text-base mb-2">{s.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {s.visa_type && (
                            <span className="font-body text-xs bg-navy-light text-navy px-3 py-1 rounded-full">
                              {s.visa_type}
                            </span>
                          )}
                          {s.destination_country && (
                            <span className="font-body text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1">
                              <Globe size={11} />{s.destination_country}
                            </span>
                          )}
                        </div>
                        {s.description && (
                          <p className="font-body text-gray-500 text-sm leading-relaxed mb-3">{s.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs font-body text-gray-400">
                          {s.price_min > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign size={12} className="text-gold" />
                              PKR {s.price_min.toLocaleString()}
                              {s.price_max > 0 ? ` – ${s.price_max.toLocaleString()}` : ''}
                            </span>
                          )}
                          {s.processing_days > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />~{s.processing_days} days
                            </span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <Globe size={32} className="text-gray-200 mx-auto mb-3" />
                        <p className="font-body text-gray-400 text-sm">No services listed yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviews.length > 0 && (
                      <div className="bg-gray-50 rounded-2xl p-5 mb-5 flex items-center gap-6">
                        <div className="text-center">
                          <div className="font-heading font-extrabold text-navy text-5xl mb-1">{rating}</div>
                          <div className="flex items-center justify-center gap-0.5 mb-1">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={14}
                                className={i <= Math.round(rating) ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'} />
                            ))}
                          </div>
                          <p className="font-body text-gray-400 text-xs">{reviews.length} reviews</p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {[5,4,3,2,1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length
                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                            return (
                              <div key={star} className="flex items-center gap-2">
                                <span className="font-body text-xs text-gray-400 w-3">{star}</span>
                                <Star size={10} className="text-gold fill-gold shrink-0" />
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="font-body text-xs text-gray-400 w-4">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {reviews.length > 0 ? reviews.map((r) => (
                      <div key={r.id} className="border border-gray-100 rounded-2xl p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-navy-light rounded-lg flex items-center justify-center text-navy font-heading font-bold text-xs shrink-0">
                              {getInitials(r.reviewer?.display_name || r.reviewer?.full_name)}
                            </div>
                            <div>
                              <p className="font-heading font-semibold text-navy text-sm">
                                {r.reviewer?.display_name || r.reviewer?.full_name || 'Visa Seeker'}
                              </p>
                              <p className="font-body text-gray-400 text-xs">
                                {new Date(r.created_at).toLocaleDateString('en-PK', {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={13}
                                className={i <= r.rating ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'} />
                            ))}
                          </div>
                        </div>
                        {r.comment && (
                          <p className="font-body text-gray-600 text-sm leading-relaxed">"{r.comment}"</p>
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <Star size={32} className="text-gray-200 mx-auto mb-3" />
                        <p className="font-body text-gray-400 text-sm">No reviews yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* About */}
                {activeTab === 'about' && (
                  <div className="space-y-5">
                    {c.bio && (
                      <div>
                        <h3 className="font-heading font-bold text-navy text-sm mb-3">About</h3>
                        <p className="font-body text-gray-600 text-sm leading-relaxed">{c.bio}</p>
                      </div>
                    )}
                    <div className="h-px bg-gray-100" />
                    <div>
                      <h3 className="font-heading font-bold text-navy text-sm mb-3">Details</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Business', value: c.business_name },
                          { label: 'City', value: c.city },
                          { label: 'Address', value: c.office_address },
                          { label: 'Experience', value: c.years_experience ? `${c.years_experience} years` : null },
                          { label: 'OEP License', value: c.oep_license_number },
                          { label: 'OEP Title', value: c.oep_license_title },
                          {
                            label: 'SECP Date',
                            value: c.secp_registration_date
                              ? new Date(c.secp_registration_date).toLocaleDateString('en-PK', {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })
                              : null
                          },
                        ].filter(d => d.value).map(d => (
                          <div key={d.label} className="flex items-start gap-4">
                            <span className="font-body text-gray-400 text-xs w-24 shrink-0 pt-0.5">{d.label}</span>
                            <span className="font-body text-navy text-sm">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div>
                      <h3 className="font-heading font-bold text-navy text-sm mb-3">Verifications</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'BEOE', verified: c.is_beoe_verified, desc: 'Bureau of Emigration' },
                          { label: 'OEP', verified: c.is_oep_verified, desc: 'Overseas Employment' },
                          { label: 'SECP', verified: c.is_secp_verified, desc: 'Securities Commission' },
                          { label: 'FBR', verified: c.is_fbr_verified, desc: 'Revenue Board' },
                        ].map(v => (
                          <div key={v.label} className={`flex items-center gap-2 p-3 rounded-xl border text-xs ${
                            v.verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                          }`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              v.verified ? 'bg-green-500' : 'bg-gray-200'
                            }`}>
                              {v.verified
                                ? <CheckCircle size={12} className="text-white" />
                                : <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                              }
                            </div>
                            <div>
                              <p className={`font-heading font-bold ${v.verified ? 'text-green-700' : 'text-gray-400'}`}>
                                {v.label}
                              </p>
                              <p className="text-gray-400 font-body">{v.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column — Sticky CTA */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Contact card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-heading font-bold text-navy text-base mb-1">Get in Touch</h3>
                <p className="font-body text-gray-400 text-xs mb-5">
                  Contact {c.display_name?.split(' ')[0]} directly
                </p>

                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-heading font-bold text-sm py-3.5 rounded-xl transition-colors mb-3">
                    <Phone size={16} />
                    WhatsApp Now
                  </a>
                )}

                {c.phone && (
                  <a href={`tel:${c.phone}`}
                    className="w-full flex items-center justify-center gap-2 border border-navy text-navy hover:bg-navy hover:text-white font-heading font-bold text-sm py-3.5 rounded-xl transition-colors mb-3">
                    <Phone size={16} />
                    Call Now
                  </a>
                )}

                <button className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-heading font-bold text-sm py-3.5 rounded-xl transition-colors">
                  <Calendar size={16} />
                  Book Consultation
                </button>

                <p className="font-body text-gray-400 text-xs text-center mt-4">
                  Usually responds within 1–2 hours
                </p>
              </div>

              {/* Quick stats */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-heading font-extrabold text-navy text-xl">{c.years_experience || '—'}</p>
                    <p className="font-body text-gray-400 text-xs mt-0.5">Yrs exp</p>
                  </div>
                  <div>
                    <p className="font-heading font-extrabold text-navy text-xl">{reviews.length || '—'}</p>
                    <p className="font-body text-gray-400 text-xs mt-0.5">Reviews</p>
                  </div>
                  <div>
                    <p className="font-heading font-extrabold text-navy text-xl">{rating > 0 ? rating : '—'}</p>
                    <p className="font-body text-gray-400 text-xs mt-0.5">Rating</p>
                  </div>
                </div>
              </div>

              {/* Verified badge */}
              {(c.is_beoe_verified || c.is_oep_verified || c.is_secp_verified) && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck size={16} className="text-green-600 shrink-0" />
                    <h4 className="font-heading font-bold text-green-800 text-sm">Officially Verified</h4>
                  </div>
                  <p className="font-body text-green-700 text-xs leading-relaxed">
                    This consultant has been verified against government records. Safe to contact.
                  </p>
                </div>
              )}

              <Link href="/consultants"
                className="flex items-center justify-center gap-2 font-body text-sm text-gray-400 hover:text-navy transition-colors py-2">
                <ArrowLeft size={14} />
                Back to all consultants
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}