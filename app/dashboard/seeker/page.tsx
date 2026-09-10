'use client'
// FILE: app/dashboard/seeker/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Heart, CalendarCheck, MessageSquare, Search,
  ArrowRight, MapPin, BadgeCheck, ChevronRight,
  Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SavedConsultant {
  id: string
  consultant: {
    id: string
    display_name: string
    city: string
    is_verified: boolean
    avatar_url: string | null
  } | null
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  completed: 'bg-[#EBF0F8] text-[#1B3060]',
  cancelled: 'bg-red-100 text-red-600',
}
const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  pending:   'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function StatusChip({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
      STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'
    }`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

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

function StatCard({ label, value, sub, color, spark, featured, trend }: {
  label: string; value: string | number; sub: string
  color: string; spark: number[]; featured?: boolean; trend?: number
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden shadow-sm flex-1 min-w-0">
      {featured && (
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 0%, #FBF5E0 0%, transparent 70%)' }} />
      )}
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        {trend != null && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {trend > 0 ? '↑' : '↓'}{Math.abs(trend)}%
          </span>
        )}
      </div>
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

function getInitials(name: string | null) {
  if (!name) return 'VC'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function SeekerOverview() {
  const [profile, setProfile]                   = useState<any>(null)
  const [savedCount, setSavedCount]             = useState(0)
  const [appointmentCount, setAppointmentCount] = useState(0)
  const [unreadCount, setUnreadCount]           = useState(0)
  const [savedConsultants, setSavedConsultants] = useState<SavedConsultant[]>([])
  const [recentAppts, setRecentAppts]           = useState<any[]>([])
  const [nextAppt, setNextAppt]                 = useState<any>(null)
  const [loading, setLoading]                   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()

        // ✅ getSession() — client side ke liye correct
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setLoading(false); return }

        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (!prof) { setLoading(false); return }
        setProfile(prof)

        const today = new Date().toISOString().split('T')[0]

        const [
          { data: saved },
          { count: apptCount },
          { data: appts },
          { count: msgCount },
        ] = await Promise.all([
          supabase
            .from('saved_consultants')
            .select('id, consultant:consultant_id(id, display_name, city, is_verified, avatar_url)')
            .eq('seeker_id', prof.id)
            .order('created_at', { ascending: false })
            .limit(3),

          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('seeker_id', session.user.id),

          supabase
            .from('appointments')
            .select('id, subject, visa_type, destination, consultant_name, preferred_date, preferred_time, status, meeting_link')
            .eq('seeker_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(4),

          supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', prof.id)
            .eq('is_read', false),
        ])

        setSavedConsultants((saved as unknown as SavedConsultant[]) || [])
        setSavedCount(saved?.length || 0)
        setAppointmentCount(apptCount || 0)
        setUnreadCount(msgCount || 0)

        if (appts && appts.length > 0) {
          setRecentAppts(appts)
          const upcoming = appts.find(
            a => a.status === 'confirmed' && a.preferred_date && a.preferred_date >= today
          )
          setNextAppt(upcoming || null)
        }
      } catch (err) {
        console.error('Seeker overview error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || profile?.display_name || 'there'
  const greeting  = getGreeting()

  return (
    <div className="max-w-[1000px] space-y-5">

      {/* ── Welcome Banner ── */}
      <div className="bg-[#1B3060] rounded-2xl p-7 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-[0.18]"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #4B78C8 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.25)]" />
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Visa Journey</span>
            </div>
            <h1 className="font-heading font-black text-white text-2xl lg:text-[26px] mb-1.5 tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            {nextAppt ? (
              <p className="text-sm text-white/50">
                Your next appointment is in{' '}
                <strong className="text-[#C9A227]">
                  {nextAppt.preferred_date
                    ? Math.ceil((new Date(nextAppt.preferred_date).getTime() - Date.now()) / 86400000)
                    : '?'} days
                </strong>
              </p>
            ) : (
              <p className="text-sm text-white/50">
                Find and connect with verified visa consultants across Pakistan.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/dashboard/seeker/appointments"
              className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
              My Appointments
            </Link>
            <Link href="/consultants"
              className="px-5 py-2.5 rounded-xl text-[#1B3060] text-sm font-bold transition-colors hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
              Book Consultation
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="flex gap-3.5 flex-wrap">
        <StatCard label="Active Appointments" value={appointmentCount} sub={`${appointmentCount} total`} spark={[2,3,2,4,3,5,4,6]} color="#C9A227" featured />
        <StatCard label="Saved Consultants"   value={savedCount}       sub="Last added recently"         spark={[1,2,2,3,2,3,3,savedCount]} color="#C9A227" />
        <StatCard label="Unread Messages"     value={unreadCount}      sub={unreadCount > 0 ? `${unreadCount} new` : 'All caught up'} spark={[1,3,2,5,3,4,6,unreadCount]} color="#059669" />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-extrabold text-[#1B3060] text-[15px]">Recent Appointments</h3>
            <Link href="/dashboard/seeker/appointments"
              className="flex items-center gap-1 text-xs font-semibold text-[#C9A227] hover:text-[#a8861f] transition-colors">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {recentAppts.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentAppts.map(appt => {
                const title = appt.subject || appt.visa_type || 'Visa Appointment'
                const dest  = appt.destination ? ` · ${appt.destination}` : ''
                const date  = appt.preferred_date
                  ? new Date(appt.preferred_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
                  : '—'
                return (
                  <div key={appt.id} className="flex items-center gap-3.5 py-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF0F8] flex items-center justify-center text-lg shrink-0">🌐</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[13px] text-gray-900 truncate">{title}{dest}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        with {appt.consultant_name || 'Consultant'} · {date}
                        {appt.preferred_time && ` · ${appt.preferred_time}`}
                      </p>
                    </div>
                    <StatusChip status={appt.status} />
                    {appt.meeting_link && appt.status === 'confirmed' && (
                      <a href={appt.meeting_link} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-white bg-green-500 hover:bg-green-600 px-2.5 py-1 rounded-lg transition-colors shrink-0">
                        Join
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <CalendarCheck size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-4">No appointments yet</p>
              <Link href="/consultants"
                className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#1B3060] border border-[#1B3060] px-4 py-2 rounded-xl hover:bg-[#1B3060] hover:text-white transition-colors">
                Find a Consultant
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Next appointment or CTA */}
          {nextAppt ? (
            <div className="rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
              <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-2.5">Next Appointment</p>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="text-3xl">🌐</div>
                <div>
                  <p className="font-heading font-extrabold text-[15px] leading-snug">
                    {nextAppt.subject || nextAppt.visa_type || 'Visa Consultation'}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">{nextAppt.consultant_name || 'Consultant'}</p>
                </div>
              </div>
              <div className="bg-black/15 rounded-xl px-3.5 py-2.5 mb-3.5">
                <p className="text-[13px] font-semibold flex items-center gap-2">
                  <Clock size={13} className="shrink-0" />
                  {nextAppt.preferred_date
                    ? new Date(nextAppt.preferred_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Date TBC'}
                  {nextAppt.preferred_time && ` · ${nextAppt.preferred_time}`}
                </p>
              </div>
              <Link href="/dashboard/seeker/appointments"
                className="block w-full text-center py-2.5 rounded-xl bg-white/20 border border-white/30 text-white font-bold text-[13px] hover:bg-white/30 transition-colors">
                View Details
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1B3060 0%, #2d4a8a 100%)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <p className="font-bold text-white text-sm mb-1 relative">No upcoming appointment</p>
              <p className="text-white/50 text-xs mb-4 relative">Book a consultation with a verified consultant today.</p>
              <Link href="/consultants"
                className="relative inline-flex items-center gap-2 bg-[#C9A227] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#a8861f] transition-colors">
                <Search size={14} /> Find Consultants
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-bold text-[#1B3060] text-[13px] mb-3">Quick Actions</p>
            {[
              { label: 'Find a Consultant', sub: 'Search verified experts',        href: '/consultants',                      color: '#1B3060', bg: '#EBF0F8', icon: Search },
              { label: 'My Appointments',   sub: `${appointmentCount} total`,       href: '/dashboard/seeker/appointments',    color: '#059669', bg: '#dcfce7', icon: CalendarCheck },
              { label: 'View Messages',     sub: unreadCount > 0 ? `${unreadCount} unread` : 'All caught up', href: '/dashboard/seeker/messages', color: '#C9A227', bg: '#FBF5E0', icon: MessageSquare },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-[#EBF0F8] transition-colors mb-1.5 last:mb-0 group">
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                  style={{ background: item.bg }}>
                  <item.icon size={15} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[12px] text-gray-800">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
                <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recently Saved ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-extrabold text-[#1B3060] text-[15px]">Recently Saved</h3>
          <Link href="/dashboard/seeker/saved"
            className="text-xs font-semibold text-[#C9A227] hover:text-[#a8861f] transition-colors">
            View all
          </Link>
        </div>

        {savedConsultants.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedConsultants.map(item => {
              const c = item.consultant
              return (
                <div key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#EBF0F8] transition-colors">
                  <div className="w-9 h-9 bg-[#1B3060] rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {getInitials(c?.display_name || null)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1B3060] text-[13px] truncate">{c?.display_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {c?.city && (
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <MapPin size={9} className="text-[#C9A227]" />{c.city}
                        </span>
                      )}
                      {c?.is_verified && (
                        <span className="text-[11px] text-green-600 flex items-center gap-0.5">
                          <BadgeCheck size={10} /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/consultants/${c?.id}`}
                    className="shrink-0 font-semibold text-[11px] text-[#1B3060] border border-[#1B3060]/25 px-2.5 py-1 rounded-lg hover:bg-[#1B3060] hover:text-white transition-colors">
                    View
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-4">No saved consultants yet</p>
            <Link href="/consultants"
              className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#1B3060] border border-[#1B3060] px-4 py-2 rounded-xl hover:bg-[#1B3060] hover:text-white transition-colors">
              Browse Consultants
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}