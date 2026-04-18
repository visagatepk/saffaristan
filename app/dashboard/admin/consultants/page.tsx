'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BadgeCheck, Clock, Search, MapPin,
  CheckCircle, XCircle, Eye, Filter, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { key: 'pending', label: 'Pending', color: 'text-amber-600 border-amber-400' },
  { key: 'active', label: 'Active', color: 'text-green-600 border-green-400' },
  { key: 'all', label: 'All', color: 'text-navy border-navy' },
]

export default function AdminConsultants() {
  const [consultants, setConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [query, setQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [activeTab])

  const load = async () => {
    setLoading(true)
    const supabase = createClient()

    let q = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'consultant')
      .order('created_at', { ascending: false })

    if (activeTab === 'pending') q = q.eq('verification_status', 'pending_verification')
    else if (activeTab === 'active') q = q.eq('verification_status', 'active')

    const { data } = await q
    setConsultants(data || [])
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id + '_approve')
    const supabase = createClient()
    await supabase.from('profiles').update({
      verification_status: 'active',
      is_verified: true,
      is_beoe_verified: true,
      is_oep_verified: true,
    }).eq('id', id)
    setConsultants(prev => prev.filter(c => c.id !== id))
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    setActionLoading(id + '_reject')
    const supabase = createClient()
    await supabase.from('profiles').update({
      verification_status: 'rejected',
      is_verified: false,
    }).eq('id', id)
    setConsultants(prev => prev.filter(c => c.id !== id))
    setActionLoading(null)
  }

  const filtered = consultants.filter(c =>
    !query ||
    c.display_name?.toLowerCase().includes(query.toLowerCase()) ||
    c.business_name?.toLowerCase().includes(query.toLowerCase()) ||
    c.oep_license_number?.toLowerCase().includes(query.toLowerCase()) ||
    c.city?.toLowerCase().includes(query.toLowerCase())
  )

  const getInitials = (name: string | null) => {
    if (!name) return 'VC'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const STATUS_BADGE: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    pending_verification: 'bg-amber-50 text-amber-700 border-amber-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    inactive: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  const STATUS_LABEL: Record<string, string> = {
    active: 'Active',
    pending_verification: 'Pending',
    rejected: 'Rejected',
    inactive: 'Inactive',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-navy text-xl mb-1">Consultants</h1>
          <p className="font-body text-gray-500 text-sm">
            Manage and verify consultant listings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-5 w-fit">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`font-heading font-semibold text-sm px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-navy text-white'
                : 'text-gray-500 hover:text-navy'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-3 mb-5 max-w-md">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, city, OEP number..."
          className="font-body text-sm w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
        {query && <button onClick={() => setQuery('')}><X size={14} className="text-gray-400" /></button>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
        </div>
      )}

      {/* List */}
      {!loading && (
        <div className="space-y-3">
          {filtered.length > 0 ? filtered.map((c) => (
            <div key={c.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-all">
              <div className="flex items-start gap-4">

                {/* Avatar */}
                <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white font-heading font-bold shrink-0">
                  {getInitials(c.display_name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-heading font-bold text-navy text-base">
                        {c.display_name || 'Unnamed'}
                      </h3>
                      <p className="font-body text-gray-500 text-xs mt-0.5">
                        {c.business_name}
                      </p>
                    </div>
                    <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                      STATUS_BADGE[c.verification_status] || STATUS_BADGE.inactive
                    }`}>
                      {STATUS_LABEL[c.verification_status] || c.verification_status}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'City', value: c.city },
                      { label: 'OEP License', value: c.oep_license_number },
                      { label: 'NTN Number', value: c.ntn_number },
                      { label: 'Experience', value: c.years_experience ? `${c.years_experience} years` : null },
                      { label: 'OEP Expiry', value: c.oep_expiry_date ? new Date(c.oep_expiry_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
                      { label: 'SECP Date', value: c.secp_registration_date ? new Date(c.secp_registration_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
                      { label: 'Phone', value: c.phone },
                      { label: 'Registered', value: new Date(c.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    ].filter(d => d.value).map(d => (
                      <div key={d.label} className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="font-body text-gray-400 text-xs">{d.label}</p>
                        <p className="font-body text-navy text-xs font-semibold mt-0.5 truncate">
                          {d.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/consultants/${c.id}`} target="_blank"
                      className="font-heading text-xs font-semibold text-navy border border-navy px-3 py-1.5 rounded-lg hover:bg-navy hover:text-white transition-colors flex items-center gap-1">
                      <Eye size={12} /> View Profile
                    </Link>

                    {c.verification_status === 'pending_verification' && (
                      <>
                        <button
                          onClick={() => handleApprove(c.id)}
                          disabled={actionLoading === c.id + '_approve'}
                          className="font-heading text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1">
                          <CheckCircle size={12} />
                          {actionLoading === c.id + '_approve' ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(c.id)}
                          disabled={actionLoading === c.id + '_reject'}
                          className="font-heading text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1">
                          <XCircle size={12} />
                          {actionLoading === c.id + '_reject' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}

                    {c.verification_status === 'active' && (
                      <button
                        onClick={() => handleReject(c.id)}
                        disabled={actionLoading === c.id + '_reject'}
                        className="font-heading text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1">
                        <XCircle size={12} /> Suspend
                      </button>
                    )}

                    {c.verification_status === 'rejected' && (
                      <button
                        onClick={() => handleApprove(c.id)}
                        disabled={actionLoading === c.id + '_approve'}
                        className="font-heading text-xs font-semibold text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-1">
                        <CheckCircle size={12} /> Re-activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <BadgeCheck size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="font-heading font-bold text-navy text-base mb-1">
                {activeTab === 'pending' ? 'No pending verifications' : 'No consultants found'}
              </p>
              <p className="font-body text-gray-400 text-sm">
                {activeTab === 'pending' ? 'All caught up! ✅' : 'Try a different filter'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}