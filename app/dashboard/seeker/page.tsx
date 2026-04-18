'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Heart, CalendarCheck, MessageSquare,
  Search, ArrowRight, Star, MapPin, BadgeCheck
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SeekerOverview() {
  const [profile, setProfile] = useState<any>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [bookingCount, setBookingCount] = useState(0)
  const [savedConsultants, setSavedConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!prof) return
      setProfile(prof)

      // Get saved consultants count
      const { data: saved } = await supabase
        .from('saved_consultants')
        .select('*, consultant:consultant_id(id, display_name, business_name, city, is_verified, avatar_url)')
        .eq('seeker_id', prof.id)
        .order('created_at', { ascending: false })
        .limit(3)

      setSavedConsultants(saved || [])
      setSavedCount(saved?.length || 0)

      // Get bookings count
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('seeker_id', prof.id)

      setBookingCount(count || 0)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'VC'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-navy text-2xl mb-1">
          Hello, {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="font-body text-gray-500 text-sm">
          Find and connect with verified visa consultants across Pakistan
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Saved Consultants',
            value: savedCount,
            icon: Heart,
            color: 'bg-red-50 text-red-500',
            href: '/dashboard/seeker/saved',
          },
          {
            label: 'My Bookings',
            value: bookingCount,
            icon: CalendarCheck,
            color: 'bg-blue-50 text-blue-500',
            href: '/dashboard/seeker/bookings',
          },
          {
            label: 'Messages',
            value: 0,
            icon: MessageSquare,
            color: 'bg-purple-50 text-purple-500',
            href: '/dashboard/seeker/messages',
          },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gold/30 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-gold transition-colors" />
            </div>
            <p className="font-heading font-bold text-navy text-2xl">{stat.value}</p>
            <p className="font-body text-gray-400 text-xs mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Search CTA */}
      <div className="bg-navy rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full border border-white/10 translate-x-1/2 -translate-y-1/2" />
        <div className="relative">
          <h3 className="font-heading font-bold text-white text-lg mb-1">
            Looking for a Visa Consultant?
          </h3>
          <p className="font-body text-white/60 text-sm mb-4">
            Browse 500+ verified consultants across Pakistan
          </p>
          <Link href="/consultants"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-heading font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
            <Search size={15} />
            Find Consultants
          </Link>
        </div>
      </div>

      {/* Recently saved */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-navy text-base">Recently Saved</h3>
          <Link href="/dashboard/seeker/saved"
            className="font-body text-xs text-gold hover:text-gold-dark transition-colors">
            View all
          </Link>
        </div>

        {savedConsultants.length > 0 ? (
          <div className="space-y-3">
            {savedConsultants.map((item) => {
              const c = item.consultant
              return (
                <div key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-navy-light transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-navy rounded-lg flex items-center justify-center text-white font-heading font-bold text-xs shrink-0">
                      {getInitials(c?.display_name)}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-navy text-sm">
                        {c?.display_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {c?.city && (
                          <span className="font-body text-gray-400 text-xs flex items-center gap-1">
                            <MapPin size={10} className="text-gold" />{c.city}
                          </span>
                        )}
                        {c?.is_verified && (
                          <span className="flex items-center gap-0.5 text-green-600 text-xs">
                            <BadgeCheck size={11} /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href={`/consultants/${c?.id}`}
                    className="font-heading text-xs font-semibold text-navy border border-navy px-3 py-1.5 rounded-lg hover:bg-navy hover:text-white transition-colors">
                    View
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="font-body text-gray-400 text-sm mb-4">No saved consultants yet</p>
            <Link href="/consultants"
              className="font-heading font-semibold text-xs text-navy border border-navy px-4 py-2 rounded-xl hover:bg-navy hover:text-white transition-colors">
              Browse Consultants
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}