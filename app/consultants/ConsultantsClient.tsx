'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, MapPin, Star, BadgeCheck,
  Heart, X, Clock, DollarSign,
  Globe, Filter, ChevronDown, ArrowRight
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

const VISA_TYPES = [
  'All',
  'Student Visa',
  'Work Permit',
  'Visit Visa',
  'Family Visa',
  'Business Visa',
  'PR & Immigration',
  'Umrah Visa',
]

const DESTINATIONS = [
  'All',
  'United Kingdom',
  'Canada',
  'United States',
  'Australia',
  'UAE',
  'Saudi Arabia',
  'Germany',
  'Other',
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'fastest', label: 'Fastest Processing' },
]

const GRADIENTS = [
  'from-blue-900 to-blue-700',
  'from-[#1B3060] to-blue-800',
  'from-slate-800 to-indigo-900',
  'from-indigo-900 to-blue-800',
  'from-[#1B3060] to-slate-700',
  'from-blue-950 to-indigo-800',
  'from-teal-900 to-blue-800',
  'from-purple-900 to-indigo-800',
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
  }
}

function getInitials(name: string | null) {
  if (!name) return 'VC'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ConsultantsClient() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [visaType, setVisaType] = useState('All')
  const [destination, setDestination] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [saved, setSaved] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            consultant:consultant_id (
              display_name,
              full_name,
              city,
              is_verified,
              avatar_url,
              years_experience,
              is_beoe_verified,
              is_oep_verified
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error(error)
          setError(error.message)
        } else {
          setServices(data || [])
        }
      } catch (err) {
        setError('Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const filtered = useMemo(() => {
    return services
      .filter(s => {
        const matchQuery = !query ||
          s.title?.toLowerCase().includes(query.toLowerCase()) ||
          s.description?.toLowerCase().includes(query.toLowerCase()) ||
          s.destination_country?.toLowerCase().includes(query.toLowerCase()) ||
          s.consultant?.display_name?.toLowerCase().includes(query.toLowerCase())
        const matchVisa = visaType === 'All' || s.visa_type === visaType
        const matchDest = destination === 'All' || s.destination_country === destination
        return matchQuery && matchVisa && matchDest
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return (a.price_min || 0) - (b.price_min || 0)
        if (sortBy === 'price_high') return (b.price_min || 0) - (a.price_min || 0)
        if (sortBy === 'fastest') return (a.processing_days || 99) - (b.processing_days || 99)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [services, query, visaType, destination, sortBy])

  const toggleSave = (id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const hasActiveFilters = visaType !== 'All' || destination !== 'All' || query

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />

        <div className="relative max-w-4xl mx-auto text-center mb-8">
          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl mb-2">
            Find Visa Services
          </h1>
          <p className="font-urdu text-gold/80 text-lg mb-2">ویزا سروسز تلاش کریں</p>
          <p className="font-body text-white/60 text-sm">
            {loading ? 'Loading...' : `${filtered.length} services from verified consultants`}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-lg">
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search visa services, countries, consultants..."
                className="font-body text-sm w-full outline-none text-gray-700 placeholder-gray-400" />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 font-heading font-semibold text-sm text-navy border border-navy/20 bg-navy-light px-5 py-3 rounded-xl hover:bg-navy hover:text-white transition-all sm:hidden">
              <Filter size={14} /> Filters
            </button>
            <Link href="/consultants"
              className="hidden sm:flex font-heading font-bold text-sm text-white px-7 py-3 rounded-xl hover:opacity-90 transition-all items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
              <Search size={15} /> Search
            </Link>
          </div>
        </div>

        {/* Category pills */}
        <div className="relative max-w-4xl mx-auto mt-4 flex flex-wrap gap-2 justify-center">
          {VISA_TYPES.slice(1).map(type => (
            <button key={type} onClick={() => setVisaType(visaType === type ? 'All' : type)}
              className={`font-body text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                visaType === type
                  ? 'bg-gold border-gold text-white'
                  : 'border-white/20 text-white/70 hover:border-gold/50 hover:text-gold'
              }`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <aside className={`lg:w-56 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-navy text-sm">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={() => { setVisaType('All'); setDestination('All'); setQuery('') }}
                    className="font-body text-xs text-red-400 hover:text-red-600 transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              {/* Visa Type */}
              <div className="mb-5">
                <h4 className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Visa Type</h4>
                <div className="space-y-1.5">
                  {VISA_TYPES.map(type => (
                    <button key={type} onClick={() => setVisaType(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-body text-xs transition-all ${
                        visaType === type
                          ? 'bg-navy text-white font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div>
                <h4 className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Destination</h4>
                <div className="space-y-1.5">
                  {DESTINATIONS.map(dest => (
                    <button key={dest} onClick={() => setDestination(dest)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-body text-xs transition-all ${
                        destination === dest
                          ? 'bg-navy text-white font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                      }`}>
                      {dest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-body text-sm text-gray-500">
                  <span className="font-semibold text-navy">{filtered.length}</span> services found
                </p>
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-1.5">
                    {visaType !== 'All' && (
                      <span className="font-body text-xs bg-navy-light text-navy px-2.5 py-1 rounded-full flex items-center gap-1">
                        {visaType}
                        <button onClick={() => setVisaType('All')}>
                          <X size={11} />
                        </button>
                      </span>
                    )}
                    {destination !== 'All' && (
                      <span className="font-body text-xs bg-navy-light text-navy px-2.5 py-1 rounded-full flex items-center gap-1">
                        {destination}
                        <button onClick={() => setDestination('All')}>
                          <X size={11} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-gray-400">Sort:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="font-body text-sm text-navy border border-gray-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer bg-white">
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin mb-4" />
                <p className="font-body text-gray-400 text-sm">Loading services...</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="font-heading font-bold text-red-700 mb-2">Failed to load</p>
                <p className="font-body text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Search size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="font-heading font-bold text-navy text-base mb-1">No services found</p>
                <p className="font-body text-gray-400 text-sm mb-4">Try adjusting your filters</p>
                <button onClick={() => { setQuery(''); setVisaType('All'); setDestination('All') }}
                  className="font-heading font-semibold text-sm text-navy border border-navy px-5 py-2 rounded-xl hover:bg-navy hover:text-white transition-colors">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Service Cards — Fiverr Style */}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((service, i) => {
                  const isSaved = saved.includes(service.id)
                  const consultantName = service.consultant?.display_name || service.consultant?.full_name || 'Consultant'
                  const avatarUrl = service.consultant?.avatar_url
                    ? `${supabaseUrl}/storage/v1/object/public/avatars/${service.consultant.avatar_url}`
                    : null
                  const imageUrl = service.image_url
                    ? `${supabaseUrl}/storage/v1/object/public/avatars/${service.image_url}`
                    : null

                  return (
                    <div key={service.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group flex flex-col">

                      {/* Service image / gradient banner */}
                      <div className={`relative h-40 overflow-hidden ${!imageUrl ? `bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}` : ''}`}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-end p-4">
                            <div className="opacity-20">
                              <div className="absolute top-3 right-4 w-14 h-14 rounded-full border-2 border-white" />
                              <div className="absolute top-10 right-14 w-8 h-8 rounded-full border border-white" />
                            </div>
                            {/* Visa type badge on image */}
                            <span className="relative font-body text-xs font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full">
                              {service.visa_type}
                            </span>
                          </div>
                        )}

                        {/* Save button */}
                        <button onClick={() => toggleSave(service.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/40 transition-colors">
                          <Heart size={14} className={isSaved ? 'text-red-400 fill-red-400' : 'text-white'} />
                        </button>

                        {/* Destination flag */}
                        {service.destination_country && (
                          <div className="absolute top-3 left-3 font-body text-xs text-white bg-white/20 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Globe size={10} />
                            {service.destination_country}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">

                        {/* Consultant info */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-navy flex items-center justify-center shrink-0">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={consultantName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-heading font-bold text-white text-xs">
                                {getInitials(consultantName)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-body text-xs text-gray-500 truncate">{consultantName}</span>
                            {service.consultant?.is_verified && (
                              <BadgeCheck size={12} className="text-green-500 shrink-0" />
                            )}
                            {service.consultant?.city && (
                              <span className="flex items-center gap-0.5 text-gray-400 text-xs shrink-0">
                                <MapPin size={9} className="text-gold" />
                                {service.consultant.city}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-heading font-bold text-navy text-sm leading-snug mb-2 group-hover:text-gold transition-colors duration-200 line-clamp-2 flex-1">
                          {service.title}
                        </h3>

                        {/* Description */}
                        <p className="font-body text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">
                          {service.description}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs font-body text-gray-400 mb-4 pt-3 border-t border-gray-100">
                          {service.processing_days > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-gold" />
                              {service.processing_days} days
                            </span>
                          )}
                          {(service.consultant?.years_experience ?? 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-gray-400 text-xs shrink-0">
  <MapPin size={9} className="text-gold" />
  {service.consultant?.city}
</span>
                          )}
                        </div>

                        {/* Footer — Price + CTA */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-body text-xs text-gray-400">Starting from</p>
                            <div className="flex items-baseline gap-1">
                              <span className="font-body text-xs text-gray-400">PKR</span>
                              <span className="font-heading font-extrabold text-gold text-lg">
                                {service.price_min?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Link href={`/consultants/${service.consultant_id}`}
                            className="flex items-center gap-1.5 font-heading font-bold text-xs text-white px-4 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #1B3060 0%, #2a4a8a 100%)' }}>
                            View Details <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}