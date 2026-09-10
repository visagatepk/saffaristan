'use client'
// FILE: app/dashboard/admin/consultants/page.tsx

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  BadgeCheck, Search, CheckCircle, XCircle,
  Eye, X, Star, Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'active',  label: 'Active'  },
  { key: 'all',     label: 'All'     },
]

// ✅ 'verified' is the correct value — not 'active'
const STATUS_BADGE: Record<string, string> = {
  verified:             'bg-green-50 text-green-700 border-green-200',
  pending_verification: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected:             'bg-red-50 text-red-700 border-red-200',
  unverified:           'bg-gray-100 text-gray-500 border-gray-200',
}
const STATUS_LABEL: Record<string, string> = {
  verified:             'Verified',
  pending_verification: 'Pending',
  rejected:             'Rejected',
  unverified:           'Unverified',
}

function getInitials(name: string | null) {
  if (!name) return 'VC'
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function AdminConsultants() {
  const [allConsultants, setAllConsultants] = useState<any[]>([])
  const [loading, setLoading]               = useState(true)
  const [activeTab, setActiveTab]           = useState('pending')
  const [query, setQuery]                   = useState('')
  const [actionLoading, setActionLoading]   = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm]   = useState<string | null>(null)

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'consultant')
      .order('created_at', { ascending: false })
    setAllConsultants(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Client-side filtering ──────────────────────────────────────────────────
  const tabFiltered = activeTab === 'pending'
    ? allConsultants.filter(c => c.verification_status === 'pending_verification')
    : activeTab === 'active'
      ? allConsultants.filter(c => c.is_verified === true)
      : allConsultants

  const filtered = tabFiltered.filter(c =>
    !query ||
    c.display_name?.toLowerCase().includes(query.toLowerCase()) ||
    c.business_name?.toLowerCase().includes(query.toLowerCase()) ||
    c.oep_license_number?.toLowerCase().includes(query.toLowerCase()) ||
    c.city?.toLowerCase().includes(query.toLowerCase())
  )

  const featuredCount = allConsultants.filter(c => c.is_featured).length
  const pendingCount  = allConsultants.filter(c => c.verification_status === 'pending_verification').length

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setActionLoading(id + '_approve')
    const { error } = await supabase
      .from('profiles')
      .update({
        verification_status: 'verified',   // ✅ correct value
        is_verified:         true,
        is_suspended:        false,
      })
      .eq('user_id', id)                   // ✅ use user_id not id

    if (error) {
      // fallback: try with id column
      await supabase.from('profiles').update({
        verification_status: 'verified',
        is_verified:         true,
        is_suspended:        false,
      }).eq('id', id)
    }

    setAllConsultants(prev =>
      prev.map(c => c.id === id
        ? { ...c, verification_status: 'verified', is_verified: true, is_suspended: false }
        : c
      )
    )
    setActionLoading(null)
  }

  // ── Reject / Suspend ───────────────────────────────────────────────────────
  const handleReject = async (id: string) => {
    setActionLoading(id + '_reject')
    await supabase
      .from('profiles')
      .update({
        verification_status: 'rejected',
        is_verified:         false,
        is_suspended:        true,
      })
      .eq('id', id)

    setAllConsultants(prev =>
      prev.map(c => c.id === id
        ? { ...c, verification_status: 'rejected', is_verified: false, is_suspended: true }
        : c
      )
    )
    setActionLoading(null)
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setActionLoading(id + '_delete')
    // Delete profile first, then auth user via service role if needed
    await supabase.from('profiles').delete().eq('id', id)
    // Remove from local state immediately
    setAllConsultants(prev => prev.filter(c => c.id !== id))
    setDeleteConfirm(null)
    setActionLoading(null)
  }

  // ── Feature toggle ─────────────────────────────────────────────────────────
  const handleFeatureToggle = async (id: string, currentFeatured: boolean) => {
    setActionLoading(id + '_feature')
    if (!currentFeatured) {
      if (featuredCount >= 3) {
        alert('Maximum 3 featured consultants allowed. Pehle ek hatao.')
        setActionLoading(null)
        return
      }
      const maxOrder = Math.max(0, ...allConsultants.filter(c => c.is_featured).map(c => c.featured_order || 0))
      await supabase.from('profiles').update({
        is_featured: true, featured_order: maxOrder + 1,
      }).eq('id', id)
    } else {
      await supabase.from('profiles').update({
        is_featured: false, featured_order: 0,
      }).eq('id', id)
    }
    setAllConsultants(prev =>
      prev.map(c => c.id === id ? { ...c, is_featured: !currentFeatured } : c)
    )
    setActionLoading(null)
  }

  return (
    <div className="max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-1">Consultants</h1>
          <p className="text-gray-400 text-sm">Manage, verify and feature consultant listings</p>
        </div>
        <div className="flex items-center gap-2 bg-[#FBF5E0] border border-[#C9A227]/30 rounded-xl px-4 py-2">
          <Star size={14} className="text-[#C9A227] fill-[#C9A227]" />
          <span className="font-bold text-[#C9A227] text-sm">{featuredCount}/3 Featured</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-xl p-1 mb-4 w-fit">
        {TABS.map(tab => {
          const count = tab.key === 'pending'
            ? pendingCount
            : tab.key === 'active'
              ? allConsultants.filter(c => c.is_verified).length
              : allConsultants.length
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 font-semibold text-xs px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.key ? 'bg-[#1B3060] text-white shadow-sm' : 'text-gray-500 hover:text-[#1B3060]'
              }`}>
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20 text-white'
                    : tab.key === 'pending' ? 'bg-[#C9A227] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Search ── */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2.5 flex items-center gap-3 mb-5 max-w-md">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, city, OEP number…"
          className="text-sm w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
        {query && (
          <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Loading / Empty ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <BadgeCheck size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-[#1B3060] text-base mb-1">
            {activeTab === 'pending' ? 'No pending verifications' : 'No consultants found'}
          </p>
          <p className="text-gray-400 text-sm">
            {activeTab === 'pending' ? 'Sab clear hai! ✅' : 'Filter change karo'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all ${
                c.is_featured ? 'border-[#C9A227]/40 bg-[#FBF5E0]/20' : 'border-gray-100'
              }`}>
              <div className="flex items-start gap-4">

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-[#1B3060] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(c.display_name)}
                  </div>
                  {c.is_featured && (
                    <div className="absolute -top-1.5 -right-1.5 bg-[#C9A227] rounded-full p-0.5">
                      <Star size={10} className="text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-[#1B3060] text-base">
                          {c.display_name || c.full_name || 'Unnamed'}
                        </h3>
                        {c.is_featured && (
                          <span className="text-[10px] font-bold bg-[#FBF5E0] text-[#C9A227] border border-[#C9A227]/30 px-2 py-0.5 rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs">{c.business_name}</p>
                    </div>
                    {/* Status badge */}
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      STATUS_BADGE[c.verification_status] || 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {STATUS_LABEL[c.verification_status] || c.verification_status || 'unverified'}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                    {[
                      { label: 'City',        value: c.city },
                      { label: 'OEP License', value: c.oep_license_number },
                      { label: 'Experience',  value: c.years_experience ? `${c.years_experience} yrs` : null },
                      { label: 'Phone',       value: c.phone },
                      { label: 'SECP Date',   value: c.secp_registration_date
                          ? new Date(c.secp_registration_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
                          : null },
                      { label: 'Registered',  value: new Date(c.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    ].filter(d => d.value).map(d => (
                      <div key={d.label} className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide">{d.label}</p>
                        <p className="text-[#1B3060] text-xs font-semibold mt-0.5 truncate">{d.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="flex items-center gap-2 flex-wrap">

                    {/* View Profile */}
                    <Link href={`/consultants/${c.id}`} target="_blank"
                      className="text-xs font-semibold text-[#1B3060] border border-[#1B3060]/25 px-3 py-1.5 rounded-lg hover:bg-[#1B3060] hover:text-white transition-colors flex items-center gap-1">
                      <Eye size={12} /> View Profile
                    </Link>

                    {/* Feature toggle — verified consultants only */}
                    {c.is_verified && (
                      <button
                        onClick={() => handleFeatureToggle(c.id, c.is_featured)}
                        disabled={actionLoading === c.id + '_feature'}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-60 ${
                          c.is_featured
                            ? 'bg-[#FBF5E0] text-[#C9A227] border border-[#C9A227]/30 hover:bg-[#C9A227] hover:text-white'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-[#FBF5E0] hover:text-[#C9A227] hover:border-[#C9A227]/30'
                        }`}>
                        <Star size={12} className={c.is_featured ? 'fill-[#C9A227] text-[#C9A227]' : ''} />
                        {actionLoading === c.id + '_feature' ? 'Saving…' : c.is_featured ? 'Unfeature' : 'Set Featured'}
                      </button>
                    )}

                    {/* Pending — Approve / Reject */}
                    {c.verification_status === 'pending_verification' && (
                      <>
                        <button onClick={() => handleApprove(c.id)}
                          disabled={actionLoading === c.id + '_approve'}
                          className="text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1">
                          <CheckCircle size={12} />
                          {actionLoading === c.id + '_approve' ? 'Approving…' : 'Approve'}
                        </button>
                        <button onClick={() => handleReject(c.id)}
                          disabled={actionLoading === c.id + '_reject'}
                          className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1">
                          <XCircle size={12} />
                          {actionLoading === c.id + '_reject' ? 'Rejecting…' : 'Reject'}
                        </button>
                      </>
                    )}

                    {/* Verified — Suspend */}
                    {c.verification_status === 'verified' && (
                      <button onClick={() => handleReject(c.id)}
                        disabled={actionLoading === c.id + '_reject'}
                        className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1">
                        <XCircle size={12} /> Suspend
                      </button>
                    )}

                    {/* Rejected — Re-activate */}
                    {(c.verification_status === 'rejected' || c.verification_status === 'unverified') && (
                      <button onClick={() => handleApprove(c.id)}
                        disabled={actionLoading === c.id + '_approve'}
                        className="text-xs font-semibold text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-1">
                        <CheckCircle size={12} /> Verify
                      </button>
                    )}

                    {/* ✅ Delete button — naya */}
                    <button onClick={() => setDeleteConfirm(c.id)}
                      className="text-xs font-semibold text-red-400 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-1 ml-auto">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="font-bold text-[#1B3060] text-center text-lg mb-1">Consultant Delete Karo?</h3>
            <p className="text-gray-400 text-sm text-center mb-5">
              Ye action undo nahi ho sakta. Profile aur services hamesha ke liye delete ho jayengi.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm + '_delete'}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-60">
                {actionLoading === deleteConfirm + '_delete' ? 'Deleting…' : 'Haan, Delete Karo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}