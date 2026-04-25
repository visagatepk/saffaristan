'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, BadgeCheck, Heart, Filter, X, ChevronDown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

const CITIES = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar', 'Quetta', 'Multan']
const VISA_TYPES = ['Student Visa', 'Work Permit', 'Visit Visa', 'Family Visa', 'Business Visa', 'Umrah Visa', 'PR & Immigration']

const GRADIENTS = [
  'from-blue-900 to-blue-700',
  'from-[#1B3060] to-blue-800',
  'from-slate-800 to-indigo-900',
  'from-indigo-900 to-blue-800',
  'from-[#1B3060] to-slate-700',
  'from-blue-950 to-indigo-800',
]

function getInitials(name: string | null) {
  if (!name) return 'VC'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ConsultantsClient() {
  const [consultants, setConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, display_name, full_name, business_name, city, bio, avatar_url, years_experience, verification_status, is_verified, is_beoe_verified, is_oep_verified, is_secp_verified, phone, created_at')
          .eq('role', 'consultant')

        if (error) {
          console.error('Supabase error:', error)
          setError(error.message)
        } else {
          setConsultants(data || [])
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to load consultants')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultants()
  }, [])

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleSave = (id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const filtered = consultants.filter(c => {
    const name = c.display_name || c.full_name || ''
    const matchQuery = !query ||
      name.toLowerCase().includes(query.toLowerCase()) ||
      c.business_name?.toLowerCase().includes(query.toLowerCase()) ||
      c.city?.toLowerCase().includes(query.toLowerCase())
    const matchCity = selectedCities.length === 0 || selectedCities.includes(c.city)
    return matchQuery && matchCity
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sortBy === 'experience') return (b.years_experience || 0) - (a.years_experience || 0)
    return 0
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy py-10 px-6">
        <div className="max-w-4xl mx-auto text-center mb-7">
          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl mb-2">
            Find Visa Consultants
          </h1>
          <p className="font-body text-white/60 text-sm">
            {loading ? 'Loading...' : `${filtered.length} verified consultants across Pakistan`}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-lg">
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, visa type, destination..."
                className="font-body text-sm w-full outline-none text-gray-700 placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-t sm:border-t-0 sm:border-l border-gray-100">
              <MapPin size={14} className="text-gold shrink-0" />
              <select
                value={selectedCities[0] || ''}
                onChange={e => setSelectedCities(e.target.value ? [e.target.value] : [])}
                className="font-body text-sm text-gray-600 outline-none bg-transparent appearance-none cursor-pointer w-28"
              >
                <option value="">All Cities</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Link href="/consultants"
              className="font-heading font-bold text-sm text-white px-7 py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
              <Search size={15} /> Search
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">

              <h3 className="font-heading font-bold text-navy text-sm mb-4">City</h3>
              <div className="space-y-2 mb-6">
                {CITIES.map(city => (
                  <label key={city} className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggleCity(city)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        selectedCities.includes(city)
                          ? 'bg-navy border-navy'
                          : 'border-gray-300 group-hover:border-navy/50'
                      }`}>
                      {selectedCities.includes(city) && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-body text-sm text-gray-600 group-hover:text-navy transition-colors">{city}</span>
                  </label>
                ))}
              </div>

              <h3 className="font-heading font-bold text-navy text-sm mb-4">Visa Type</h3>
              <div className="space-y-2">
                {VISA_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggleType(type)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        selectedTypes.includes(type)
                          ? 'bg-navy border-navy'
                          : 'border-gray-300 group-hover:border-navy/50'
                      }`}>
                      {selectedTypes.includes(type) && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-body text-xs text-gray-600 group-hover:text-navy transition-colors">{type}</span>
                  </label>
                ))}
              </div>

              {(selectedCities.length > 0 || selectedTypes.length > 0) && (
                <button
                  onClick={() => { setSelectedCities([]); setSelectedTypes([]) }}
                  className="mt-5 w-full font-heading font-semibold text-xs text-red-500 border border-red-200 py-2 rounded-xl hover:bg-red-50 transition-colors">
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <p className="font-body text-sm text-gray-500">
                <span className="font-semibold text-navy">{filtered.length}</span> consultants found
              </p>
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-gray-400">Sort:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="font-body text-sm text-navy border border-gray-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer bg-white">
                  <option value="newest">Newest</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin mb-4" />
                <p className="font-body text-gray-400 text-sm">Loading consultants...</p>
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
                <p className="font-heading font-bold text-navy text-base mb-1">No consultants found</p>
                <p className="font-body text-gray-400 text-sm">Try adjusting your filters</p>
                <button onClick={() => { setQuery(''); setSelectedCities([]); setSelectedTypes([]) }}
                  className="mt-4 font-heading font-semibold text-sm text-navy border border-navy px-5 py-2 rounded-xl hover:bg-navy hover:text-white transition-colors">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Cards */}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((c, i) => {
                  const avatarUrl = c.avatar_url
                    ? `${supabaseUrl}/storage/v1/object/public/avatars/${c.avatar_url}`
                    : null
                  const name = c.display_name || c.full_name || 'Consultant'
                  const isSaved = saved.includes(c.id)

                  return (
                    <div key={c.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group flex flex-col">

                      {/* Gradient banner */}
                      <div className={`h-20 bg-gradient-to-r ${GRADIENTS[i % GRADIENTS.length]} relative`}>
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-2 right-4 w-12 h-12 rounded-full border border-white" />
                        </div>
                        {/* Save button */}
                        <button onClick={() => toggleSave(c.id)}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/40 transition-colors">
                          <Heart size={13} className={isSaved ? 'text-red-400 fill-red-400' : 'text-white'} />
                        </button>
                      </div>

                      <div className="px-5 pb-5 flex flex-col flex-1">
                        {/* Avatar */}
                        <div className="-mt-7 mb-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-navy border-2 border-white shadow-sm flex items-center justify-center">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-heading font-bold text-white text-lg">
                                {getInitials(name)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Name + verified */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-heading font-bold text-navy text-base leading-tight group-hover:text-gold transition-colors">
                            {name}
                          </h3>
                          {c.is_verified && (
                            <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                              <BadgeCheck size={10} /> Verified
                            </div>
                          )}
                        </div>

                        {c.business_name && (
                          <p className="font-body text-gray-400 text-xs mb-2">{c.business_name}</p>
                        )}

                        {/* City + exp */}
                        <div className="flex items-center gap-3 text-xs font-body text-gray-400 mb-3">
                          {c.city && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-gold" />{c.city}
                            </span>
                          )}
                          {c.years_experience > 0 && (
                            <span>{c.years_experience} yrs exp</span>
                          )}
                        </div>

                        {/* Bio */}
                        {c.bio && (
                          <p className="font-body text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
                            {c.bio}
                          </p>
                        )}

                        {/* Verification badges */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {c.is_beoe_verified && <span className="font-body text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">BEOE</span>}
                          {c.is_oep_verified && <span className="font-body text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">OEP</span>}
                          {c.is_secp_verified && <span className="font-body text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">SECP</span>}
                        </div>

                        {/* CTA */}
                        <Link href={`/consultants/${c.user_id}`}
                          className="w-full flex items-center justify-center font-heading font-bold text-xs text-navy border border-navy/20 bg-navy-light hover:bg-navy hover:text-white py-2.5 rounded-xl transition-all duration-200">
                          View Profile →
                        </Link>
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