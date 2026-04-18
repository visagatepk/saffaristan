'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle, XCircle, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [activeTab])

  const load = async () => {
    setLoading(true)
    const supabase = createClient()
    const q = supabase
      .from('reviews')
      .select(`
        *,
        consultant:consultant_id(display_name, business_name),
        reviewer:reviewer_id(display_name, full_name)
      `)
      .order('created_at', { ascending: false })

    const { data } = activeTab === 'pending'
      ? await q.eq('is_approved', false)
      : await q.eq('is_approved', true)

    setReviews(data || [])
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id + '_approve')
    const supabase = createClient()
    await supabase.from('reviews').update({ is_approved: true }).eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return
    setActionLoading(id + '_delete')
    const supabase = createClient()
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
    setActionLoading(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-navy text-xl mb-1">Reviews</h1>
        <p className="font-body text-gray-500 text-sm">Approve or remove consultant reviews</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-5 w-fit">
        {['pending', 'approved'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`font-heading font-semibold text-sm px-4 py-2 rounded-lg transition-all capitalize ${
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
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-body text-xs text-gray-400 mb-1">
                    Review for{' '}
                    <span className="font-semibold text-navy">
                      {r.consultant?.display_name || 'Consultant'}
                    </span>
                    {' '}by{' '}
                    <span className="font-semibold text-navy">
                      {r.reviewer?.display_name || r.reviewer?.full_name || 'User'}
                    </span>
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={13}
                        className={i <= r.rating ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'} />
                    ))}
                    <span className="font-heading font-bold text-navy text-sm ml-1">{r.rating}</span>
                  </div>
                  {r.comment && (
                    <p className="font-body text-gray-600 text-sm leading-relaxed">"{r.comment}"</p>
                  )}
                  <p className="font-body text-gray-300 text-xs mt-2">
                    {new Date(r.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!r.is_approved && (
                    <button onClick={() => handleApprove(r.id)}
                      disabled={actionLoading === r.id + '_approve'}
                      className="font-heading text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-60">
                      <CheckCircle size={12} />
                      {actionLoading === r.id + '_approve' ? '...' : 'Approve'}
                    </button>
                  )}
                  <button onClick={() => handleDelete(r.id)}
                    disabled={actionLoading === r.id + '_delete'}
                    className="font-heading text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-60">
                    <XCircle size={12} />
                    {actionLoading === r.id + '_delete' ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Star size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-heading font-bold text-navy text-base mb-1">
            {activeTab === 'pending' ? 'No pending reviews' : 'No approved reviews'}
          </p>
          <p className="font-body text-gray-400 text-sm">All caught up! ✅</p>
        </div>
      )}
    </div>
  )
}