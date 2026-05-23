'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar, Clock, CheckCircle, XCircle,
  AlertCircle, ExternalLink, ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string; icon: any
}> = {
  pending:   { label: 'Pending Review', color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200',  icon: AlertCircle },
  confirmed: { label: 'Confirmed',      color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200',  icon: CheckCircle },
  rejected:  { label: 'Declined',       color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200',    icon: XCircle },
  completed: { label: 'Completed',      color: 'text-[#1B3060]',  bg: 'bg-[#EBF0F8]', border: 'border-[#1B3060]/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled',      color: 'text-gray-500',   bg: 'bg-gray-100',   border: 'border-gray-200',   icon: XCircle },
}

const TABS = ['all', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled']

const TAB_LABELS: Record<string, string> = {
  all: 'All', pending: 'Pending', confirmed: 'Confirmed',
  completed: 'Completed', rejected: 'Declined', cancelled: 'Cancelled',
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getInitials(name: string | null) {
  if (!name) return 'VC'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SeekerAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('all')

  useEffect(() => { load() }, [])

  const load = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('seeker_id', user.id)
      .order('created_at', { ascending: false })

    setAppointments(data || [])
    setLoading(false)
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment request?')) return
    const supabase = createClient()
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
    )
  }

  // Per-tab counts for badge
  const countFor = (tab: string) =>
    tab === 'all' ? appointments.length : appointments.filter(a => a.status === tab).length

  const filtered = activeTab === 'all'
    ? appointments
    : appointments.filter(a => a.status === activeTab)

  return (
    <div className="max-w-3xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-1">
            My Appointments
          </h1>
          <p className="font-body text-gray-400 text-sm">
            Track and manage your consultation requests
          </p>
        </div>
        <Link
          href="/consultants"
          className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}
        >
          + Book New
        </Link>
      </div>

      {/* ── Filter tabs with counts ── */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 overflow-x-auto shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {TABS.map(tab => {
          const count   = countFor(tab)
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 font-heading font-semibold text-xs px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
                isActive ? 'bg-navy text-white shadow-sm' : 'text-gray-500 hover:text-navy'
              }`}
            >
              {TAB_LABELS[tab]}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
        </div>

      /* ── Empty state ── */
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-heading font-bold text-[#1B3060] text-base mb-1">
            {activeTab === 'all' ? 'No appointments yet' : `No ${TAB_LABELS[activeTab].toLowerCase()} appointments`}
          </p>
          <p className="font-body text-gray-400 text-sm mb-6">
            {activeTab === 'all'
              ? 'Book a consultation with a verified consultant to get started.'
              : 'Try switching to a different filter above.'}
          </p>
          {activeTab === 'all' && (
            <Link
              href="/consultants"
              className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}
            >
              Find Consultants <ArrowRight size={14} />
            </Link>
          )}
        </div>

      /* ── Appointment cards ── */
      ) : (
        <div className="space-y-4">
          {filtered.map(apt => {
            const config     = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending
            const StatusIcon = config.icon

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${
                  apt.status === 'confirmed' ? 'border-green-200' :
                  apt.status === 'pending'   ? 'border-amber-100' :
                  apt.status === 'rejected'  ? 'border-red-100'   : 'border-gray-100'
                }`}
              >
                {/* ── Card body ── */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">

                    {/* Left — avatar + info */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-[#1B3060] rounded-xl flex items-center justify-center text-white font-heading font-bold shrink-0 text-sm">
                        {getInitials(apt.consultant_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading font-bold text-[#1B3060] text-base leading-tight">
                          {apt.consultant_name || 'Consultant'}
                        </h3>
                        <p className="font-body text-gray-600 text-sm mt-0.5 line-clamp-1">
                          {apt.subject}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-body text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-[#C9A227]" />
                            {formatDate(apt.preferred_date)}
                          </span>
                          {apt.preferred_time && (
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-[#C9A227]" />
                              {apt.preferred_time}
                            </span>
                          )}
                          {apt.visa_type && (
                            <span className="bg-[#EBF0F8] text-[#1B3060] font-semibold px-2 py-0.5 rounded-full">
                              {apt.visa_type}
                            </span>
                          )}
                          {apt.destination && (
                            <span className="text-gray-400">
                              → {apt.destination}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right — status badge */}
                    <span className={`inline-flex items-center gap-1 font-body text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      config.bg
                    } ${config.color} ${config.border}`}>
                      <StatusIcon size={11} />
                      {config.label}
                    </span>
                  </div>

                  {/* ── Confirmed details ── */}
                  {apt.status === 'confirmed' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="font-heading font-bold text-green-800 text-sm mb-1">
                        ✅ Your appointment is confirmed!
                      </p>
                      {apt.consultant_note && (
                        <p className="font-body text-green-700 text-xs leading-relaxed mt-1">
                          {apt.consultant_note}
                        </p>
                      )}
                      {apt.meeting_link && (
                        <a
                          href={apt.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 font-heading font-bold text-xs text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                        >
                          <ExternalLink size={11} /> Join Meeting
                        </a>
                      )}
                    </div>
                  )}

                  {/* ── Declined note ── */}
                  {apt.status === 'rejected' && apt.consultant_note && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="font-heading font-bold text-red-700 text-xs mb-1">
                        Reason:
                      </p>
                      <p className="font-body text-red-600 text-xs leading-relaxed">
                        {apt.consultant_note}
                      </p>
                    </div>
                  )}

                  {/* ── Actions ── */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="font-heading font-semibold text-xs text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        Cancel Request
                      </button>
                    )}
                    {/* Book again after completed/cancelled/rejected */}
                    {['completed', 'cancelled', 'rejected'].includes(apt.status) && (
                      <Link
                        href="/consultants"
                        className="font-heading font-semibold text-xs text-[#1B3060] border border-[#1B3060]/25 px-4 py-2 rounded-xl hover:bg-[#1B3060] hover:text-white transition-colors"
                      >
                        Book Again
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}