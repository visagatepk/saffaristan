'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Star, CheckCircle, ArrowRight } from 'lucide-react'

interface Service {
  id: string
  title: string
  visa_type: string
  price: number
  delivery_days: number
}

interface Consultant {
  id: string
  full_name: string
  display_name: string | null
  avatar_url: string | null
  city: string | null
  country: string | null
  years_experience: number | null
  average_rating: number | null
  total_reviews: number | null
  is_verified: boolean
  is_featured: boolean
  tagline: string | null
  services: Service[]
}

export default function FeaturedConsultants() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchFeaturedConsultants()
  }, [])

  async function fetchFeaturedConsultants() {
    try {
      // Try admin-featured consultants first
      const { data: featured } = await supabase
        .from('profiles')
        .select(`
          id, full_name, display_name, avatar_url, city, country,
          years_experience, average_rating, total_reviews,
          is_verified, is_featured, tagline,
          services (id, title, visa_type, price, delivery_days)
        `)
        .eq('role', 'consultant')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('featured_order', { ascending: true })
        .limit(3)

      if (featured && featured.length > 0) {
        setConsultants(featured as Consultant[])
      } else {
        // Fallback: newest verified consultants
        const { data: newest } = await supabase
          .from('profiles')
          .select(`
            id, full_name, display_name, avatar_url, city, country,
            years_experience, average_rating, total_reviews,
            is_verified, is_featured, tagline,
            services (id, title, visa_type, price, delivery_days)
          `)
          .eq('role', 'consultant')
          .eq('is_verified', true)
          .order('created_at', { ascending: false })
          .limit(3)

        setConsultants(newest as Consultant[] || [])
      }
    } catch (err) {
      console.error('Featured consultants error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getName = (c: Consultant) => c.display_name || c.full_name || 'Consultant'

  const getInitials = (c: Consultant) => {
    const name = getName(c)
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const avatarColors = [
    'bg-blue-700', 'bg-[#1B3060]', 'bg-purple-700',
    'bg-teal-700', 'bg-rose-700', 'bg-orange-700'
  ]

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-[#C9A227] uppercase tracking-widest mb-2">TOP CONSULTANTS</p>
            <h2 className="text-3xl font-bold text-[#1B3060]">Featured Consultants</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (consultants.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-[#C9A227] uppercase tracking-widest mb-2">
              TOP CONSULTANTS
            </p>
            <h2 className="text-3xl font-bold text-[#1B3060]">Featured Consultants</h2>
            <p className="text-gray-500 mt-1 text-sm">ہمارے قابل اعتماد ویزا ماہرین سے ملیں</p>
          </div>
          <Link
            href="/consultants"
            className="hidden md:flex items-center gap-1 text-[#1B3060] font-semibold text-sm hover:text-[#C9A227] transition-colors"
          >
            View all consultants <ArrowRight size={16} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {consultants.map((consultant, index) => {
            const name = getName(consultant)
            const primaryService = consultant.services?.[0]
            const rating = consultant.average_rating || 0
            const reviews = consultant.total_reviews || 0

            return (
              <div
                key={consultant.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Featured Badge */}
                {consultant.is_featured && (
                  <div className="bg-[#C9A227] text-white text-xs font-bold text-center py-1.5 tracking-wider">
                    ⭐ FEATURED CONSULTANT
                  </div>
                )}

                <div className="p-5">
                  {/* Avatar + Name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative flex-shrink-0">
                      {consultant.avatar_url ? (
                        <Image
                          src={consultant.avatar_url}
                          alt={name}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-[#1B3060]/10"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${avatarColors[index % avatarColors.length]}`}>
                          {getInitials(consultant)}
                        </div>
                      )}
                      {consultant.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                          <CheckCircle size={16} className="text-[#C9A227] fill-[#C9A227]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1B3060] text-base truncate">{name}</h3>
                      {consultant.tagline && (
                        <p className="text-gray-500 text-xs truncate mt-0.5">{consultant.tagline}</p>
                      )}
                      {consultant.city && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={11} className="text-gray-400" />
                          <span className="text-gray-400 text-xs">{consultant.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <Star size={13} className="text-[#C9A227] fill-[#C9A227]" />
                      <span className="font-bold text-sm text-[#1B3060]">
                        {rating > 0 ? rating.toFixed(1) : 'New'}
                      </span>
                      {reviews > 0 && (
                        <span className="text-gray-400 text-xs">({reviews})</span>
                      )}
                    </div>
                    {consultant.years_experience && (
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold text-[#1B3060]">{consultant.years_experience}</span> yrs exp
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold text-[#1B3060]">{consultant.services?.length || 0}</span> services
                    </div>
                  </div>

                  {/* Primary Service */}
                  {primaryService && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Popular Service</p>
                      <p className="font-semibold text-[#1B3060] text-sm truncate">{primaryService.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs bg-[#1B3060]/10 text-[#1B3060] px-2 py-0.5 rounded-full">
                          {primaryService.visa_type}
                        </span>
                        <span className="text-xs text-gray-500">{primaryService.delivery_days} days</span>
                      </div>
                    </div>
                  )}

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Starting from</p>
                      <p className="font-bold text-[#1B3060] text-lg">
                        {primaryService ? `PKR ${primaryService.price.toLocaleString()}` : 'Contact'}
                      </p>
                    </div>
                    <Link
                      href={`/consultants/${consultant.id}`}
                      className="bg-[#1B3060] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#C9A227] transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link
            href="/consultants"
            className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#C9A227] transition-colors"
          >
            View All Consultants <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  )
}