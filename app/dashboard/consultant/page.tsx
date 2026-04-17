'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Eye, Users, CalendarCheck, Star,
  TrendingUp, ArrowRight, Phone, Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ConsultantOverview() {
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ views: 0, bookings: 0, reviews: 0, avgRating: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
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

      if (prof) {
        setProfile(prof)

        // Get review stats
        const { data: revs } = await supabase
          .from('reviews')
          .select('rating')
          .eq('consultant_id', prof.id)
          .eq('is_approved', true)

        const avg = revs && revs.length > 0
          ? revs.reduce((s, r) => s + r.rating, 0) / revs.length
          : 0

        // Get bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, seeker:seeker_id(display_name, full_name)')
          .eq('consultant_id', prof.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          views: 0,
          bookings: bookings?.length || 0,
          reviews: revs?.length || 0,
          avgRating: Math.round(avg * 10) / 10,
        })
        setRecentBookings(bookings || [])
      }
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

  // Verification banner
  const VerificationBanner = () => {
    if (profile?.verification_status === 'active') return null

    return (
      <div className={`rounded-2xl p-5 mb-6 ${
        profile?.verification_status === 'pending_verification'
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          <Clock size={20} className={
            profile?.verification_status === 'pending_verification' ? 'text-amber-500 shrink-0 mt-0.5' : 'text-red-500 shrink-0 mt-0.5'
          } />
          <div>
            <h3 className={`font-heading font-bold text-sm mb-1 ${
              profile?.verification_status === 'pending_verification' ? 'text-amber-800' : 'text-red-800'
            }`}>
              {profile?.verification_status === 'pending_verification'
                ? 'Profile Under Review'
                : 'Verification Required'}
            </h3>
            <p className={`font-body text-xs leading-relaxed ${
              profile?.verification_status === 'pending_verification' ? 'text-amber-600' : 'text-red-600'
            }`}>
              {profile?.verification_status === 'pending_verification'
                ? 'Your OEP and SECP details are being verified. This usually takes 24–48 hours. Your profile will go live once approved.'
                : 'Please complete your profile verification to start receiving leads.'}
            </p>
            {profile?.verification_status !== 'pending_verification' && (
              <Link href="/register/consultant/complete-profile"
                className="inline-flex items-center gap-1 font-heading font-semibold text-xs text-red-700 mt-2 hover:text-red-900">
                Complete Verification <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <VerificationBanner />

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-navy text-2xl mb-1">
          Welcome back, {profile?.display_name?.split(' ')[0] || 'Consultant'}
        </h1>
        <p className="font-body text-gray-500 text-sm">
          Here's an overview of your consultant activity
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Profile Views', value: stats.views || '—', icon: Eye, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Bookings', value: stats.bookings, icon: CalendarCheck, color: 'bg-green-50 text-green-600' },
          { label: 'Reviews', value: stats.reviews, icon: Users, color: 'bg-purple-50 text-purple-600' },
          { label: 'Avg Rating', value: stats.avgRating > 0 ? `${stats.avgRating} ★` : '—', icon: Star, color: 'bg-amber-50 text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <TrendingUp size={14} className="text-green-400" />
            </div>
            <p className="font-heading font-bold text-navy text-2xl">{stat.value}</p>
            <p className="font-body text-gray-400 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/consultant/profile"
          className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gold/40 hover:shadow-sm transition-all group">
          <h3 className="font-heading font-bold text-navy text-sm mb-1">Edit Profile</h3>
          <p className="font-body text-gray-400 text-xs mb-3">Update your bio, photo, and contact info</p>
          <span className="font-heading text-xs font-semibold text-navy group-hover:text-gold transition-colors flex items-center gap-1">
            Go to profile <ArrowRight size={12} />
          </span>
        </Link>
        <Link href="/dashboard/consultant/services"
          className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gold/40 hover:shadow-sm transition-all group">
          <h3 className="font-heading font-bold text-navy text-sm mb-1">Manage Services</h3>
          <p className="font-body text-gray-400 text-xs mb-3">Add or update your visa service offerings</p>
          <span className="font-heading text-xs font-semibold text-navy group-hover:text-gold transition-colors flex items-center gap-1">
            Go to services <ArrowRight size={12} />
          </span>
        </Link>
        <Link href="/dashboard/consultant/bookings"
          className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gold/40 hover:shadow-sm transition-all group">
          <h3 className="font-heading font-bold text-navy text-sm mb-1">View Bookings</h3>
          <p className="font-body text-gray-400 text-xs mb-3">Check and manage consultation requests</p>
          <span className="font-heading text-xs font-semibold text-navy group-hover:text-gold transition-colors flex items-center gap-1">
            Go to bookings <ArrowRight size={12} />
          </span>
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-navy text-base">Recent Bookings</h3>
          <Link href="/dashboard/consultant/bookings"
            className="font-body text-xs text-gold hover:text-gold-dark transition-colors">
            View all
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-navy-light rounded-lg flex items-center justify-center">
                    <CalendarCheck size={14} className="text-navy" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-navy text-sm">
                      {b.seeker?.display_name || b.seeker?.full_name || 'Visa Seeker'}
                    </p>
                    <p className="font-body text-gray-400 text-xs">
                      {new Date(b.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${
                  b.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                  b.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                  b.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <CalendarCheck size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="font-body text-gray-400 text-sm">No bookings yet</p>
            <p className="font-body text-gray-300 text-xs mt-1">
              Bookings will appear here when seekers contact you
            </p>
          </div>
        )}
      </div>
    </div>
  )
}