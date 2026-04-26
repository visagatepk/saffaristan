'use client'

import { useState, useEffect } from 'react'
import {
  Calendar, Clock, User, Phone, Mail,
  CheckCircle, XCircle, Eye, MessageSquare,
  Globe, AlertCircle, Filter
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  rejected:  { label: 'Rejected',  color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  completed: { label: 'Completed', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  cancelled: { label: 'Cancelled', color: 'text-gray-600',   bg: 'bg-gray-100 border-gray-200' },
}

export default function ConsultantAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [consultantNote, setConsultantNote] = useState('')
  const [meetingLink, setMeetingLink] = useState('')

  useEffect(() => { load() }, [activeTab])

  const load = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('consultant_id', user.id)
      .order('created_at', { ascending: false })

    if (activeTab !== 'all') {
      query = query.eq('status', activeTab)
    }

    const { data } = await query
    setAppointments(data || [])
    setLoading(false)
  }

  const handleAction = async (id: string, status: string) => {
    setActionLoading(id + status)
    const supabase = createClient()
    await supabase.from('appointments').update({
      status,
      consultant_note: consultantNote || null,
      meeting_link: meetingLink || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setAppointments(prev => prev.filter(a => a.id !== id))
    setActionLoading(null)
    setExpandedId(null)
    setConsultantNote('')
    setMeetingLink('')
  }

  const counts = {
    pending: appointments.filter(a => a.status === 'pending').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-navy text-xl mb-1">Appointments</h1>
          <p className="font-body text-gray-500 text-sm">Manage consultation requests from visa seekers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit overflow-x-auto">
        {['pending', 'confirmed', 'completed', 'rejected', 'all'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`font-heading font-semibold text-xs px-4 py-2 rounded-lg whitespace-nowrap transition-all capitalize ${
              activeTab === tab ? 'bg-navy text-white' : 'text-gray-500 hover:text-navy'
            }`}>
            {tab}
            {tab === 'pending' && counts.pending > 0 && (
              <span className="ml-1.5 bg-gold text-white text-xs px-1.5 py-0.5 rounded-full">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-heading font-bold text-navy text-base mb-1">
            No {activeTab === 'all' ? '' : activeTab} appointments
          </p>
          <p className="font-body text-gray-400 text-sm">
            {activeTab === 'pending' ? 'New booking requests will appear here' : 'Nothing to show'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => {
            const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending
            const isExpanded = expandedId === apt.id

            return (
              <div key={apt.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                  apt.status === 'pending' ? 'border-amber-200' : 'border-gray-100'
                }`}>

                {/* Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-navy rounded-xl flex items-center justify-center text-white font-heading font-bold shrink-0">
                        {(apt.seeker_name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-navy text-base">{apt.seeker_name}</h3>
                        <p className="font-body text-gray-500 text-sm">{apt.subject}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-body text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-gold" />
                            {new Date(apt.preferred_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-gold" />
                            {apt.preferred_time}
                          </span>
                          {apt.visa_type && (
                            <span className="bg-navy-light text-navy px-2 py-0.5 rounded-full font-medium">
                              {apt.visa_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-navy hover:text-navy transition-all">
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-5">

                    {/* Contact info */}
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { icon: Mail, label: apt.seeker_email },
                        { icon: Phone, label: apt.seeker_phone },
                        { icon: Globe, label: apt.destination || 'Not specified' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-gray-100">
                          <item.icon size={13} className="text-gold shrink-0" />
                          <span className="font-body text-xs text-gray-600 truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Message */}
                    {apt.message && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="font-heading font-bold text-navy text-xs mb-2">Seeker's Message:</p>
                        <p className="font-body text-gray-600 text-sm leading-relaxed">{apt.message}</p>
                      </div>
                    )}

                    {/* Action section — only for pending */}
                    {apt.status === 'pending' && (
                      <div className="space-y-3">
                        <div>
                          <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                            Note to Seeker (optional)
                          </label>
                          <textarea
                            value={consultantNote}
                            onChange={e => setConsultantNote(e.target.value)}
                            rows={2}
                            placeholder="e.g. Please join the WhatsApp call at the agreed time..."
                            className="font-body w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all resize-none"
                          />
                        </div>
                        <div>
                          <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">
                            Meeting Link (optional)
                          </label>
                          <input
                            type="url"
                            value={meetingLink}
                            onChange={e => setMeetingLink(e.target.value)}
                            placeholder="https://meet.google.com/xxx or WhatsApp number"
                            className="font-body w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(apt.id, 'confirmed')}
                            disabled={actionLoading === apt.id + 'confirmed'}
                            className="flex-1 font-heading font-bold text-sm text-white bg-green-500 hover:bg-green-600 py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            <CheckCircle size={14} />
                            {actionLoading === apt.id + 'confirmed' ? 'Confirming...' : 'Confirm Appointment'}
                          </button>
                          <button
                            onClick={() => handleAction(apt.id, 'rejected')}
                            disabled={actionLoading === apt.id + 'rejected'}
                            className="font-heading font-bold text-sm text-red-600 border-2 border-red-200 hover:bg-red-500 hover:text-white px-5 py-3 rounded-xl transition-all disabled:opacity-60 flex items-center gap-2">
                            <XCircle size={14} />
                            Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Confirmed info */}
                    {apt.status === 'confirmed' && (
                      <div className="space-y-3">
                        {apt.consultant_note && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="font-heading font-bold text-green-800 text-xs mb-1">Your Note:</p>
                            <p className="font-body text-green-700 text-sm">{apt.consultant_note}</p>
                          </div>
                        )}
                        <button
                          onClick={() => handleAction(apt.id, 'completed')}
                          disabled={!!actionLoading}
                          className="font-heading font-bold text-sm text-white bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2">
                          <CheckCircle size={14} />
                          Mark as Completed
                        </button>
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