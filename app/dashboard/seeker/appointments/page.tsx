'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar, Clock, User,
  CheckCircle, XCircle, AlertCircle,
  MapPin, Globe, ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:   { label: 'Pending Review',  color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  icon: AlertCircle },
  confirmed: { label: 'Confirmed ✓',     color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  icon: CheckCircle },
  rejected:  { label: 'Declined',        color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      icon: XCircle },
  completed: { label: 'Completed',       color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    icon: CheckCircle },
  cancelled: { label: 'Cancelled',       color: 'text-gray-600',   bg: 'bg-gray-100 border-gray-200',   icon: XCircle },
}

export default function SeekerAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

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
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
  }

  const filtered = activeTab === 'all'
    ? appointments
    : appointments.filter(a => a.status === activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-navy text-xl mb-1">My Appointments</h1>
          <p className="font-body text-gray-500 text-sm">Track your consultation requests</p>
        </div>
        <Link href="/consultants"
          className="font-heading font-bold text-sm text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
          + Book New
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit overflow-x-auto">
        {['all', 'pending', 'confirmed', 'completed', 'rejected'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`font-heading font-semibold text-xs px-4 py-2 rounded-lg whitespace-nowrap transition-all capitalize ${
              activeTab === tab ? 'bg-navy text-white' : 'text-gray-500 hover:text-navy'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-heading font-bold text-navy text-base mb-1">No appointments yet</p>
          <p className="font-body text-gray-400 text-sm mb-5">
            Book a consultation with a verified consultant
          </p>
          <Link href="/consultants"
            className="inline-flex font-heading font-bold text-sm text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
            Find Consultants
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(apt => {
            const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending
            const StatusIcon = config.icon

            return (
              <div key={apt.id} className={`bg-white rounded-2xl border overflow-hidden ${
                apt.status === 'confirmed' ? 'border-green-200' :
                apt.status === 'pending' ? 'border-amber-100' : 'border-gray-100'
              }`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-navy rounded-xl flex items-center justify-center text-white font-heading font-bold shrink-0 text-sm">
                        {(apt.consultant_name || 'VC').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-navy text-base">{apt.consultant_name}</h3>
                        <p className="font-body text-gray-600 text-sm">{apt.subject}</p>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs font-body text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-gold" />
                            {new Date(apt.preferred_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-gold" />
                            {apt.preferred_time}
                          </span>
                          {apt.visa_type && (
                            <span className="bg-navy-light text-navy px-2 py-0.5 rounded-full">
                              {apt.visa_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${config.bg} ${config.color}`}>
                      <StatusIcon size={11} />
                      {config.label}
                    </span>
                  </div>

                  {/* Confirmed details */}
                  {apt.status === 'confirmed' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                      <p className="font-heading font-bold text-green-800 text-sm">
                        ✅ Your appointment is confirmed!
                      </p>
                      {apt.consultant_note && (
                        <p className="font-body text-green-700 text-xs leading-relaxed">
                          {apt.consultant_note}
                        </p>
                      )}
                      {apt.meeting_link && (
                        <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-heading font-bold text-xs text-green-700 underline">
                          <ExternalLink size={11} /> Join Meeting
                        </a>
                      )}
                    </div>
                  )}

                  {/* Rejected */}
                  {apt.status === 'rejected' && apt.consultant_note && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="font-body text-red-600 text-xs">{apt.consultant_note}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {apt.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => handleCancel(apt.id)}
                        className="font-heading font-semibold text-xs text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}