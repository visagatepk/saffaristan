'use client'
// FILE: app/dashboard/admin/reviews/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { Star, CheckCircle, XCircle, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13}
          className={i <= rating
            ? 'text-[#C9A227] fill-[#C9A227]'
            : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

export default function AdminReviews() {
  // [FIX] Load ALL reviews once — filter client-side so tab counts are always accurate
  const [allReviews, setAllReviews]       = useState<any[]>([])
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState<'pending' | 'approved'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        consultant:consultant_id(display_name, business_name),
        reviewer:reviewer_id(display_name, full_name)
      `)
      .order('created_at', { ascending: false })
    setAllReviews(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Client-side filter — no refetch on tab change
  const filtered = activeTab === 'pending'
    ? allReviews.filter(r => !r.is_approved)
    : allReviews.filter(r => r.is_approved)

  const pendingCount  = allReviews.filter(r => !r.is_approved).length
  const approvedCount = allReviews.filter(r => r.is_approved).length

  const handleApprove = async (id: string) => {
    setActionLoading(id + '_approve')
    const supabase = createClient()
    await supabase.from('reviews').update({ is_approved: true }).eq('id', id)
    // [FIX] Update in place — card moves to approved tab naturally on tab switch
    setAllReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r))
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return
    setActionLoading(id + '_delete')
    const supabase = createClient()
    await supabase.from('reviews').delete().eq('id', id)
    setAllReviews(prev => prev.filter(r => r.id !== id))
    setActionLoading(null)
  }

  return (
    <div className="max-w-3xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-1">Reviews</h1>
        <p className="font-body text-gray-400 text-sm">
          Approve or remove consultant reviews
        </p>
      </div>

      {/* Tabs with live counts */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl p-1 mb-5 w-fit">
        {([
          { key: 'pending',  label: 'Pending',  count: pendingCount  },
          { key: 'approved', label: 'Approved', count: approvedCount },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 font-heading font-semibold text-xs px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.key ? 'bg-[#1B3060] text-white shadow-sm' : 'text-gray-500 hover:text-[#1B3060]'
            }`}>
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : tab.key === 'pending'
                    ? 'bg-[#C9A227] text-white'
                    : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(r => {
            const reviewerName = r.reviewer?.display_name || r.reviewer?.full_name || 'Anonymous'
            const consultantName = r.consultant?.display_name || 'Consultant'
            const reviewerInit = reviewerName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

            return (
              <div key={r.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all">
                <div className="flex items-start gap-4">

                  {/* Reviewer avatar */}
                  <div className="w-10 h-10 rounded-xl bg-[#EBF0F8] flex items-center justify-center font-heading font-bold text-[#1B3060] text-sm shrink-0">
                    {reviewerInit}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-body text-xs text-gray-400 mb-1">
                          Review for{' '}
                          <span className="font-semibold text-[#1B3060]">{consultantName}</span>
                          {r.consultant?.business_name && (
                            <span className="text-gray-400"> · {r.consultant.business_name}</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <StarRow rating={r.rating} />
                          <span className="font-heading font-bold text-[#1B3060] text-sm">{r.rating}</span>
                          <span className="text-gray-300 text-xs">·</span>
                          <span className="font-body text-xs font-semibold text-gray-600">{reviewerName}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!r.is_approved && (
                          <button onClick={() => handleApprove(r.id)}
                            disabled={actionLoading === r.id + '_approve'}
                            className="font-heading text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-60">
                            <CheckCircle size={12} />
                            {actionLoading === r.id + '_approve' ? '…' : 'Approve'}
                          </button>
                        )}
                        {r.is_approved && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
                            <CheckCircle size={10} className="fill-green-700" strokeWidth={0} /> Approved
                          </span>
                        )}
                        <button onClick={() => handleDelete(r.id)}
                          disabled={actionLoading === r.id + '_delete'}
                          className="font-heading text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-60">
                          <XCircle size={12} />
                          {actionLoading === r.id + '_delete' ? '…' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    {/* Comment */}
                    {r.comment && (
                      <p className="font-body text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl px-4 py-3 mt-2 border border-gray-100">
                        "{r.comment}"
                      </p>
                    )}

                    {/* Date */}
                    <p className="font-body text-gray-300 text-[11px] mt-2">
                      {new Date(r.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-14 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star size={26} className="text-gray-300" />
          </div>
          <p className="font-heading font-bold text-[#1B3060] text-base mb-1">
            {activeTab === 'pending' ? 'No pending reviews' : 'No approved reviews yet'}
          </p>
          <p className="font-body text-gray-400 text-sm">
            {activeTab === 'pending' ? 'All caught up! ✅' : 'Approved reviews will appear here'}
          </p>
        </div>
      )}
    </div>
  )
}