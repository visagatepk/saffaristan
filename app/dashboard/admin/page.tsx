'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, BadgeCheck, Clock, Star,
  TrendingUp, ArrowRight, AlertTriangle, CheckCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalConsultants: 0,
    pendingVerification: 0,
    totalSeekers: 0,
    pendingReviews: 0,
    activeConsultants: 0,
    totalBookings: 0,
  })
  const [pendingConsultants, setPendingConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      const [
        { count: totalConsultants },
        { count: pendingVerification },
        { count: totalSeekers },
        { count: pendingReviews },
        { count: activeConsultants },
        { count: totalBookings },
        { data: pending },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'consultant'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'consultant').eq('verification_status', 'pending_verification'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seeker'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'consultant').eq('verification_status', 'active'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('profiles')
          .select('id, display_name, business_name, city, oep_license_number, created_at, verification_status')
          .eq('role', 'consultant')
          .eq('verification_status', 'pending_verification')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setStats({
        totalConsultants: totalConsultants || 0,
        pendingVerification: pendingVerification || 0,
        totalSeekers: totalSeekers || 0,
        pendingReviews: pendingReviews || 0,
        activeConsultants: activeConsultants || 0,
        totalBookings: totalBookings || 0,
      })
      setPendingConsultants(pending || [])
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-navy text-2xl mb-1">Admin Overview</h1>
        <p className="font-body text-gray-500 text-sm">Platform summary and pending actions</p>
      </div>

      {/* Alert for pending items */}
      {(stats.pendingVerification > 0 || stats.pendingReviews > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="font-heading font-bold text-amber-800 text-sm">Action Required</p>
            <p className="font-body text-amber-600 text-xs mt-0.5">
              {stats.pendingVerification > 0 && `${stats.pendingVerification} consultant(s) waiting for verification. `}
              {stats.pendingReviews > 0 && `${stats.pendingReviews} review(s) waiting for approval.`}
            </p>
          </div>
          <Link href="/dashboard/admin/consultants"
            className="font-heading font-semibold text-xs text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors shrink-0">
            Review Now
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Consultants', value: stats.totalConsultants, icon: BadgeCheck, color: 'bg-blue-50 text-blue-600', href: '/dashboard/admin/consultants' },
          { label: 'Pending Verification', value: stats.pendingVerification, icon: Clock, color: 'bg-amber-50 text-amber-600', href: '/dashboard/admin/consultants?tab=pending', alert: stats.pendingVerification > 0 },
          { label: 'Active Consultants', value: stats.activeConsultants, icon: CheckCircle, color: 'bg-green-50 text-green-600', href: '/dashboard/admin/consultants?tab=active' },
          { label: 'Total Seekers', value: stats.totalSeekers, icon: Users, color: 'bg-purple-50 text-purple-600', href: '/dashboard/admin/users' },
          { label: 'Pending Reviews', value: stats.pendingReviews, icon: Star, color: 'bg-pink-50 text-pink-600', href: '/dashboard/admin/reviews', alert: stats.pendingReviews > 0 },
          { label: 'Total Bookings', value: stats.totalBookings, icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600', href: '/dashboard/admin/consultants' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className={`bg-white rounded-2xl border p-5 hover:shadow-sm transition-all group ${
              stat.alert ? 'border-amber-200' : 'border-gray-100 hover:border-gold/30'
            }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              {stat.alert && <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />}
              {!stat.alert && <ArrowRight size={14} className="text-gray-300 group-hover:text-gold transition-colors" />}
            </div>
            <p className="font-heading font-bold text-navy text-2xl">{stat.value}</p>
            <p className="font-body text-gray-400 text-xs mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Pending consultants */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-navy text-base">
            Pending Verifications
          </h3>
          <Link href="/dashboard/admin/consultants"
            className="font-body text-xs text-gold hover:text-gold-dark transition-colors">
            View all
          </Link>
        </div>

        {pendingConsultants.length > 0 ? (
          <div className="space-y-3">
            {pendingConsultants.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div>
                  <p className="font-heading font-semibold text-navy text-sm">
                    {c.display_name || 'Unnamed Consultant'}
                  </p>
                  <p className="font-body text-gray-500 text-xs mt-0.5">
                    {c.business_name} · {c.city}
                    {c.oep_license_number && ` · ${c.oep_license_number}`}
                  </p>
                </div>
                <Link href={`/dashboard/admin/consultants`}
                  className="font-heading font-semibold text-xs text-amber-700 border border-amber-300 bg-white px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors shrink-0">
                  Review
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle size={28} className="text-green-300 mx-auto mb-2" />
            <p className="font-body text-gray-400 text-sm">All consultants are verified!</p>
          </div>
        )}
      </div>
    </div>
  )
}