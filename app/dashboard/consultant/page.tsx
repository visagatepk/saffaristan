'use client'
// FILE: app/dashboard/consultant/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Eye, CalendarCheck, Star, TrendingUp,
  ArrowRight, Clock, CheckCircle, AlertCircle,
  Briefcase, MessageSquare, ChevronRight, Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline SVG
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 36
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
function StatCard({ label, value, sub, color, spark, featured }: {
  label: string; value: string | number; sub: string
  color: string; spark: number[]; featured?: boolean
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex-1 min-w-0">
      {featured && (
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 0%, #FBF5E0 0%, transparent 70%)' }} />
      )}
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className={`font-heading font-black text-3xl leading-none tracking-tight ${
            featured ? 'text-[#C9A227]' : 'text-[#1B3060]'
          }`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
        </div>
        <Sparkline data={spark} color={color} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Status chip
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  completed: 'bg-[#EBF0F8] text-[#1B3060]',
  cancelled: 'bg-red-100 text-red-600',
  rejected:  'bg-red-100 text-red-600',
}
function StatusChip({ status }: { status: string }) {
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize whitespace-nowrap ${
      STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'
    }`}>
      {status}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Verification banner
// ─────────────────────────────────────────────────────────────────────────────
function VerificationBanner({ profile }: { profile: any }) {
  // [FIX] check is_verified boolean OR verification_status
  if (profile?.is_verified) return null

  const isPending = profile?.verification_status === 'pending_verification'

  return (
    <div className={`rounded-2xl p-5 mb-5 flex items-start gap-3 ${
      isPending
        ? 'bg-amber-50 border border-amber-200'
        : 'bg-red-50 border border-red-200'
    }`}>
      {isPending
        ? <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
        : <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
      }
      <div>
        <h3 className={`font-heading font-bold text-sm mb-1 ${
          isPending ? 'text-amber-800' : 'text-red-800'
        }`}>
          {isPending ? 'Profile Under Review' : 'Verification Required'}
        </h3>
        <p className={`font-body text-xs leading-relaxed ${
          isPending ? 'text-amber-600' : 'text-red-600'
        }`}>
          {isPending
            ? 'Your OEP and SECP details are being verified. Usually takes 24–48 hours. Your profile will go live once approved.'
            : 'Complete your verification to start receiving appointment requests from seekers.'}
        </p>
        {!isPending && (
          <Link
            href="/dashboard/consultant/verify"
            className="inline-flex items-center gap-1 font-heading font-semibold text-xs text-red-700 mt-2 hover:text-red-900 transition-colors"
          >
            Complete Verification <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ConsultantOverview() {
  const [profile, setProfile]           = useState<any>(null)
  const [apptCount, setApptCount]       = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [reviewStats, setReviewStats]   = useState({ count: 0, avg: 0 })
  const [recentAppts, setRecentAppts]   = useState<any[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, business_name, is_verified, verification_status, avatar_url')
        .eq('user_id', user.id)
        .single()

      if (!prof) return
      setProfile(prof)

      // Parallel fetches
      const [
        { data: appts },
        { data: revs },
      ] = await Promise.all([
        // [FIX] appointments table, consultant_id = auth user id (FK to auth.users)
        supabase
          .from('appointments')
          .select('id, status, seeker_name, subject, visa_type, preferred_date, preferred_time, created_at')
          .eq('consultant_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),

        // Reviews — consultant_id = profiles.id
        supabase
          .from('reviews')
          .select('rating')
          .eq('consultant_id', prof.id)
          .eq('is_approved', true),
      ])

      const allAppts  = appts || []
      const pending   = allAppts.filter(a => a.status === 'pending').length
      const avg       = revs && revs.length > 0
        ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : 0

      setApptCount(allAppts.length)
      setPendingCount(pending)
      setReviewStats({ count: revs?.length || 0, avg: Math.round(avg * 10) / 10 })
      setRecentAppts(allAppts)
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

  const firstName = profile?.display_name?.split(' ')[0] || profile?.full_name?.split(' ')[0] || 'Consultant'

  return (
    <div className="max-w-[1000px] space-y-5">

      {/* Verification banner */}
      <VerificationBanner profile={profile} />

      {/* ── Welcome Banner ── */}
      <div className="bg-[#1B3060] rounded-2xl p-7 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-[0.18]"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />

        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {profile?.is_verified
                ? <><div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.25)]" />
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Verified Consultant</span></>
                : <><div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Pending Verification</span></>
              }
            </div>
            <h1 className="font-heading font-black text-white text-2xl lg:text-[26px] mb-1.5 tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-sm text-white/50">
              {pendingCount > 0
                ? <><strong className="text-[#C9A227]">{pendingCount} new request{pendingCount > 1 ? 's' : ''}</strong> waiting for your response.</>
                : 'Here\'s an overview of your consultant activity.'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard/consultant/appointments"
              className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Appointments
              {pendingCount > 0 && (
                <span className="ml-2 bg-[#C9A227] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/consultant/services"
              className="px-5 py-2.5 rounded-xl text-[#1B3060] text-sm font-bold transition-colors hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}
            >
              Manage Services
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="flex gap-3.5 flex-wrap">
        <StatCard
          label="Total Appointments"
          value={apptCount}
          sub={pendingCount > 0 ? `${pendingCount} pending` : 'All up to date'}
          spark={[2, 3, 2, 4, 3, 5, 4, apptCount]}
          color="#C9A227"
          featured
        />
        <StatCard
          label="Pending Requests"
          value={pendingCount}
          sub="Awaiting response"
          spark={[1, 2, 1, 3, 2, 2, 3, pendingCount]}
          color="#f59e0b"
        />
        <StatCard
          label="Reviews"
          value={reviewStats.count}
          sub={reviewStats.avg > 0 ? `${reviewStats.avg} ★ avg rating` : 'No reviews yet'}
          spark={[1, 2, 2, 3, 3, 4, reviewStats.count, reviewStats.count]}
          color="#7c3aed"
        />
        <StatCard
          label="Avg Rating"
          value={reviewStats.avg > 0 ? `${reviewStats.avg} ★` : '—'}
          sub={reviewStats.count > 0 ? `from ${reviewStats.count} review${reviewStats.count > 1 ? 's' : ''}` : 'No ratings yet'}
          spark={[3, 4, 3, 4, 4, 5, 4, reviewStats.avg > 0 ? Math.round(reviewStats.avg) : 4]}
          color="#059669"
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-extrabold text-[#1B3060] text-[15px]">
              Recent Appointments
            </h3>
            <Link
              href="/dashboard/consultant/appointments"
              className="flex items-center gap-1 text-xs font-semibold text-[#C9A227] hover:text-[#a8861f] transition-colors"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {recentAppts.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentAppts.map(appt => {
                const date = appt.preferred_date
                  ? new Date(appt.preferred_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
                  : new Date(appt.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
                return (
                  <div key={appt.id} className="flex items-center gap-3.5 py-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF0F8] flex items-center justify-center text-[#1B3060] font-heading font-bold text-xs shrink-0">
                      {(appt.seeker_name || 'VS').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-bold text-[13px] text-gray-900 truncate">
                        {appt.seeker_name || 'Visa Seeker'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {appt.subject || appt.visa_type || 'Visa Consultation'}
                        {date && ` · ${date}`}
                      </p>
                    </div>
                    <StatusChip status={appt.status} />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <CalendarCheck size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="font-body text-gray-400 text-sm">No appointments yet</p>
              <p className="font-body text-gray-300 text-xs mt-1">
                Requests will appear here when seekers book with you
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <p className="font-heading font-bold text-[#1B3060] text-[13px] mb-3">
              Quick Actions
            </p>
            {[
              {
                label: 'Edit Profile',
                sub:   'Update bio, photo, contact',
                href:  '/dashboard/consultant/profile',
                icon:  Users,
                bg:    '#EBF0F8',
                color: '#1B3060',
              },
              {
                label: 'Manage Services',
                sub:   'Add or edit your offerings',
                href:  '/dashboard/consultant/services',
                icon:  Briefcase,
                bg:    '#FBF5E0',
                color: '#C9A227',
              },
              {
                label: 'View Appointments',
                sub:   pendingCount > 0 ? `${pendingCount} pending` : 'All up to date',
                href:  '/dashboard/consultant/appointments',
                icon:  CalendarCheck,
                bg:    '#dcfce7',
                color: '#059669',
              },
              {
                label: 'Messages',
                sub:   'Chat with seekers',
                href:  '/dashboard/consultant/messages',
                icon:  MessageSquare,
                bg:    '#f3e8ff',
                color: '#7c3aed',
              },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-[#EBF0F8] transition-colors mb-1.5 last:mb-0 group"
              >
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                  style={{ background: item.bg }}>
                  <item.icon size={15} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-[12px] text-gray-800">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
                <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Verification CTA (if not verified) */}
          {!profile?.is_verified && profile?.verification_status !== 'pending_verification' && (
            <Link
              href="/dashboard/consultant/verify"
              className="bg-[#1B3060] rounded-2xl p-5 relative overflow-hidden hover:opacity-95 transition-opacity"
            >
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-10"
                style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}
              />
              <div className="relative">
                <p className="font-heading font-bold text-white text-sm mb-1">Get Verified ✓</p>
                <p className="font-body text-white/50 text-xs mb-3">
                  Add your OEP badge and 3x your bookings
                </p>
                <span className="inline-flex items-center gap-1 font-heading font-bold text-xs text-[#1B3060] bg-[#C9A227] px-3 py-1.5 rounded-lg">
                  Start Verification <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}