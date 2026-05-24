'use client'
// FILE: app/dashboard/consultant/appointments/page.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  Calendar, Clock, Mail, Phone,
  CheckCircle, XCircle, Eye, Globe,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: 'Pending',   color: 'text-amber-700', bg: 'bg-amber-50',   border: 'border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'text-green-700', bg: 'bg-green-50',   border: 'border-green-200' },
  rejected:  { label: 'Rejected',  color: 'text-red-700',   bg: 'bg-red-50',     border: 'border-red-200' },
  completed: { label: 'Completed', color: 'text-[#1B3060]', bg: 'bg-[#EBF0F8]', border: 'border-[#1B3060]/20' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500',  bg: 'bg-gray-100',   border: 'border-gray-200' },
}

const TABS = ['pending', 'confirmed', 'completed', 'rejected', 'all'] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed',
  rejected: 'Declined', all: 'All',
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
export default function ConsultantAppointments() {
  const [allAppointments, setAllAppointments] = useState<any[]>([])
  const [loading, setLoading]                 = useState(true)
  const [activeTab, setActiveTab]             = useState<Tab>('pending')
  const [actionLoading, setActionLoading]     = useState<string | null>(null)
  const [expandedId, setExpandedId]           = useState<string | null>(null)
  const [consultantNote, setConsultantNote]   = useState('')
  const [meetingLink, setMeetingLink]         = useState('')

  // [FIX] Load ALL appointments once — filter client-side so tab counts are always correct
  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('consultant_id', user.id)
      .order('created_at', { ascending: false })

    setAllAppointments(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Client-side filter — no server round-trip on tab change
  const filtered = activeTab === 'all'
    ? allAppointments
    : allAppointments.filter(a => a.status === activeTab)

  // Per-tab counts — always computed from full dataset
  const countFor = (tab: Tab) =>
    tab === 'all'
      ? allAppointments.length
      : allAppointments.filter(a => a.status === tab).length

  const handleAction = async (id: string, status: string) => {
    setActionLoading(id + status)
    const supabase = createClient()
    await supabase.from('appointments').update({
      status,
      consultant_note: consultantNote || null,
      meeting_link:    meetingLink    || null,
      updated_at:      new Date().toISOString(),
    }).eq('id', id)

    // Update local state — no refetch needed
    setAllAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status, consultant_note: consultantNote, meeting_link: meetingLink } : a)
    )
    setActionLoading(null)
    setExpandedId(null)
    setConsultantNote('')
    setMeetingLink('')
  }

  return (
    <div className="max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-1">Appointments</h1>
          <p className="font-body text-gray-400 text-sm">
            Manage consultation requests from visa seekers
          </p>
        </div>
      </div>

      {/* Filter tabs with live counts */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 overflow-x-auto shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {TABS.map(tab => {
          const count    = countFor(tab)
          const isActive = activeTab === tab
          const isPendingTab = tab === 'pending'
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
                  isActive
                    ? 'bg-white/20 text-white'
                    : isPendingTab && count > 0
                      ? 'bg-[#C9A227] text-white'  // gold badge for pending
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
        </div>

      /* Empty state */
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-heading font-bold text-[#1B3060] text-base mb-1">
            No {activeTab === 'all' ? '' : TAB_LABELS[activeTab].toLowerCase()} appointments
          </p>
          <p className="font-body text-gray-400 text-sm">
            {activeTab === 'pending'
              ? 'New requests from seekers will appear here'
              : 'Try switching to a different filter above'}
          </p>
        </div>

      /* Appointment cards */
      ) : (
        <div className="space-y-4">
          {filtered.map(apt => {
            const config     = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending
            const isExpanded = expandedId === apt.id

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all ${
                  apt.status === 'pending'
                    ? 'border-amber-200'
                    : apt.status === 'confirmed'
                      ? 'border-green-200'
                      : 'border-gray-100'
                }`}
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">

                    {/* Seeker info */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-[#1B3060] rounded-xl flex items-center justify-center text-white font-heading font-bold shrink-0 text-sm">
                        {(apt.seeker_name || 'VS').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading font-bold text-[#1B3060] text-base leading-tight">
                          {apt.seeker_name || 'Visa Seeker'}
                        </h3>
                        <p className="font-body text-gray-500 text-sm mt-0.5 line-clamp-1">
                          {apt.subject}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-body text-gray-400">
                          {apt.preferred_date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={11} className="text-[#C9A227]" />
                              {formatDate(apt.preferred_date)}
                            </span>
                          )}
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
                            <span className="text-gray-400">→ {apt.destination}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status + expand */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-body text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        config.bg} ${config.color} ${config.border}`}>
                        {config.label}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-[#1B3060] hover:text-[#1B3060] transition-all"
                        title="View details"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">

                    {/* Contact info row */}
                    <div className="grid sm:grid-cols-3 gap-2.5">
                      {[
                        { icon: Mail,  label: apt.seeker_email  || '—' },
                        { icon: Phone, label: apt.seeker_phone  || '—' },
                        { icon: Globe, label: apt.destination   || 'Not specified' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-gray-100">
                          <item.icon size={12} className="text-[#C9A227] shrink-0" />
                          <span className="font-body text-xs text-gray-600 truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Seeker message */}
                    {apt.message && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="font-heading font-bold text-[#1B3060] text-xs mb-2">
                          Seeker&apos;s Message:
                        </p>
                        <p className="font-body text-gray-600 text-sm leading-relaxed">{apt.message}</p>
                      </div>
                    )}

                    {/* ── PENDING — Accept / Decline ── */}
                    {apt.status === 'pending' && (
                      <div className="space-y-3">
                        <div>
                          <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                            Note to Seeker <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <textarea
                            value={consultantNote}
                            onChange={e => setConsultantNote(e.target.value)}
                            rows={2}
                            placeholder="e.g. Please join the WhatsApp call at the agreed time..."
                            className="font-body w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10 transition-all resize-none"
                          />
                        </div>
                        <div>
                          <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                            Meeting Link <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <input
                            type="url"
                            value={meetingLink}
                            onChange={e => setMeetingLink(e.target.value)}
                            placeholder="https://meet.google.com/xxx or WhatsApp link"
                            className="font-body w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1B3060] focus:ring-2 focus:ring-[#1B3060]/10 transition-all"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(apt.id, 'confirmed')}
                            disabled={actionLoading === apt.id + 'confirmed'}
                            className="flex-1 font-heading font-bold text-sm text-white bg-green-500 hover:bg-green-600 py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={14} />
                            {actionLoading === apt.id + 'confirmed' ? 'Confirming...' : 'Confirm Appointment'}
                          </button>
                          <button
                            onClick={() => handleAction(apt.id, 'rejected')}
                            disabled={!!actionLoading}
                            className="font-heading font-bold text-sm text-red-600 border-2 border-red-200 hover:bg-red-500 hover:text-white px-5 py-3 rounded-xl transition-all disabled:opacity-60 flex items-center gap-2"
                          >
                            <XCircle size={14} /> Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── CONFIRMED — note + meeting link + complete ── */}
                    {apt.status === 'confirmed' && (
                      <div className="space-y-3">
                        {apt.consultant_note && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="font-heading font-bold text-green-800 text-xs mb-1">Your Note:</p>
                            <p className="font-body text-green-700 text-sm">{apt.consultant_note}</p>
                          </div>
                        )}
                        {apt.meeting_link && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                            <ArrowRight size={13} className="text-blue-500 shrink-0" />
                            <a
                              href={apt.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-body text-xs text-blue-600 hover:underline truncate"
                            >
                              {apt.meeting_link}
                            </a>
                          </div>
                        )}
                        <button
                          onClick={() => handleAction(apt.id, 'completed')}
                          disabled={!!actionLoading}
                          className="font-heading font-bold text-sm text-white bg-[#1B3060] hover:bg-[#243d7a] px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
                        >
                          <CheckCircle size={14} /> Mark as Completed
                        </button>
                      </div>
                    )}

                    {/* ── COMPLETED ── */}
                    {apt.status === 'completed' && apt.consultant_note && (
                      <div className="bg-[#EBF0F8] border border-[#1B3060]/15 rounded-xl p-4">
                        <p className="font-heading font-bold text-[#1B3060] text-xs mb-1">Completion Note:</p>
                        <p className="font-body text-[#1B3060]/70 text-sm">{apt.consultant_note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}