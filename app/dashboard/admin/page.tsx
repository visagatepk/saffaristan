'use client'
// FILE: app/dashboard/admin/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, BadgeCheck, Clock, Star,
  TrendingUp, ArrowRight, AlertTriangle,
  CheckCircle, CalendarCheck, Flag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 70, h = 30
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`
  ).join(' ')
  const line = pts.split(' ').join('L')
  const area = `M${line} L${w},${h} L0,${h} Z`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={`M${line}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={area} fill={color} fillOpacity="0.12" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, spark, href, alert }: {
  label: string; value: number; color: string
  spark: number[]; href: string; alert?: boolean
}) {
  return (
    <Link href={href}
      className={`bg-white rounded-2xl border p-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all group ${
        alert ? 'border-amber-200' : 'border-gray-100 hover:border-[#C9A227]/30'
      }`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        {alert
          ? <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
          : <ArrowRight size={13} className="text-gray-300 group-hover:text-[#C9A227] transition-colors" />
        }
      </div>
      <div className="flex items-end justify-between">
        <p className="font-heading font-black text-[#1B3060] text-3xl tracking-tight">{value}</p>
        <Sparkline data={spark} color={alert ? '#f59e0b' : color} />
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalConsultants:   0,
    pendingVerification:0,
    totalSeekers:       0,
    pendingReviews:     0,
    activeConsultants:  0,
    totalAppointments:  0,
    fraudReports:       0,
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
        { count: totalAppointments },  // [FIX] was 'bookings' table — correct table is 'appointments'
        { count: fraudReports },
        { data: pending },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'consultant'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'consultant').eq('verification_status', 'pending_verification'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seeker'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'consultant').eq('is_verified', true),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),  // [FIX] appointments not bookings
        supabase.from('fraud_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles')
          .select('id, display_name, business_name, city, oep_license_number, created_at')
          .eq('role', 'consultant')
          .eq('verification_status', 'pending_verification')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setStats({
        totalConsultants:    totalConsultants    || 0,
        pendingVerification: pendingVerification || 0,
        totalSeekers:        totalSeekers        || 0,
        pendingReviews:      pendingReviews      || 0,
        activeConsultants:   activeConsultants   || 0,
        totalAppointments:   totalAppointments   || 0,
        fraudReports:        fraudReports        || 0,
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

  const hasAlerts = stats.pendingVerification > 0 || stats.pendingReviews > 0 || stats.fraudReports > 0

  return (
    <div className="max-w-[1000px]">

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="font-heading font-extrabold text-[#1B3060] text-2xl mb-1">Admin Overview</h1>
        <p className="font-body text-gray-400 text-sm">Platform summary and pending actions</p>
      </div>

      {/* ── Action required banner ── */}
      {hasAlerts && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-heading font-bold text-amber-800 text-sm">Action Required</p>
            <div className="font-body text-amber-600 text-xs mt-0.5 space-y-0.5">
              {stats.pendingVerification > 0 && (
                <p>{stats.pendingVerification} consultant{stats.pendingVerification > 1 ? 's' : ''} waiting for verification.</p>
              )}
              {stats.pendingReviews > 0 && (
                <p>{stats.pendingReviews} review{stats.pendingReviews > 1 ? 's' : ''} waiting for approval.</p>
              )}
              {stats.fraudReports > 0 && (
                <p>{stats.fraudReports} fraud report{stats.fraudReports > 1 ? 's' : ''} pending review.</p>
              )}
            </div>
          </div>
          <Link href="/dashboard/admin/consultants"
            className="font-heading font-semibold text-xs text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors shrink-0">
            Review Now
          </Link>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
        <StatCard label="Total Consultants"    value={stats.totalConsultants}    color="#2563eb" spark={[10,14,12,18,16,20,stats.totalConsultants]}    href="/dashboard/admin/consultants" />
        <StatCard label="Pending Verification" value={stats.pendingVerification} color="#f59e0b" spark={[2,3,2,4,3,2,stats.pendingVerification]}          href="/dashboard/admin/consultants" alert={stats.pendingVerification > 0} />
        <StatCard label="Active Consultants"   value={stats.activeConsultants}   color="#059669" spark={[8,10,9,14,12,16,stats.activeConsultants]}    href="/dashboard/admin/consultants" />
        <StatCard label="Total Seekers"        value={stats.totalSeekers}        color="#7c3aed" spark={[20,30,28,35,40,45,stats.totalSeekers]}        href="/dashboard/admin/users" />
        <StatCard label="Pending Reviews"      value={stats.pendingReviews}      color="#ec4899" spark={[2,4,3,5,4,3,stats.pendingReviews]}            href="/dashboard/admin/reviews"      alert={stats.pendingReviews > 0} />
        <StatCard label="Total Appointments"   value={stats.totalAppointments}   color="#0ea5e9" spark={[5,8,10,14,18,22,stats.totalAppointments]}     href="/dashboard/admin/consultants" />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">

        {/* Pending verifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-extrabold text-[#1B3060] text-[15px]">
              Pending Verifications
            </h3>
            <Link href="/dashboard/admin/consultants"
              className="text-xs font-semibold text-[#C9A227] hover:text-[#a8861f] flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {pendingConsultants.length > 0 ? (
            <div className="space-y-3">
              {pendingConsultants.map(c => (
                <div key={c.id}
                  className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-bold text-[#1B3060] text-sm truncate">
                      {c.display_name || 'Unnamed Consultant'}
                    </p>
                    <p className="font-body text-gray-500 text-xs mt-0.5 truncate">
                      {[c.business_name, c.city, c.oep_license_number].filter(Boolean).join(' · ')}
                    </p>
                    <p className="font-body text-gray-400 text-[11px] mt-0.5">
                      Submitted {c.created_at
                        ? new Date(c.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
                        : '—'}
                    </p>
                  </div>
                  <Link href="/dashboard/admin/consultants"
                    className="ml-3 font-heading font-semibold text-xs text-amber-700 border border-amber-300 bg-white px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors shrink-0">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <CheckCircle size={28} className="text-green-300 mx-auto mb-2" />
              <p className="font-body text-gray-400 text-sm">All consultants are verified!</p>
            </div>
          )}
        </div>

        {/* Quick actions sidebar */}
        <div className="flex flex-col gap-3.5">

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4">
            <p className="font-heading font-bold text-[#1B3060] text-[13px] mb-3">Quick Actions</p>
            {[
              { label: 'Verify Consultants',    sub: `${stats.pendingVerification} pending`, href: '/dashboard/admin/consultants', icon: BadgeCheck, color: '#1B3060', bg: '#EBF0F8' },
              { label: 'Approve Reviews',       sub: `${stats.pendingReviews} pending`,      href: '/dashboard/admin/reviews',      icon: Star,       color: '#C9A227', bg: '#FBF5E0' },
              { label: 'Manage Users',          sub: `${stats.totalSeekers} seekers`,        href: '/dashboard/admin/users',        icon: Users,      color: '#7c3aed', bg: '#ede9fe' },
              { label: 'Fraud Reports',         sub: `${stats.fraudReports} pending`,        href: '/dashboard/admin/users',        icon: Flag,       color: '#dc2626', bg: '#fee2e2' },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-[#EBF0F8] transition-colors mb-1.5 last:mb-0 group">
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                  style={{ background: item.bg }}>
                  <item.icon size={15} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-[12px] text-gray-800">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
                <ArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Platform health */}
          <div className="bg-[#1B3060] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle,#C9A227 0%,transparent 70%)', transform: 'translate(20%,-20%)' }} />
            <div className="relative">
              <p className="font-heading font-bold text-white text-sm mb-4">Platform Health</p>
              {[
                { label: 'Verified rate',      value: stats.totalConsultants > 0 ? `${Math.round((stats.activeConsultants / stats.totalConsultants) * 100)}%` : '—', ok: true },
                { label: 'Pending queue',      value: stats.pendingVerification, ok: stats.pendingVerification === 0 },
                { label: 'Unapproved reviews', value: stats.pendingReviews, ok: stats.pendingReviews === 0 },
                { label: 'Fraud reports',      value: stats.fraudReports, ok: stats.fraudReports === 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0">
                  <p className="font-body text-xs text-white/50">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <span className={`font-heading font-bold text-sm ${item.ok ? 'text-green-400' : 'text-amber-400'}`}>
                      {item.value}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}