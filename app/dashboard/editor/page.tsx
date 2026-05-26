'use client'
// FILE: app/dashboard/editor/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  FileText, MessageSquare, Eye, PenSquare,
  TrendingUp, Clock, ArrowRight, ChevronRight,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 60, h = 28
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`
  ).join(' ')
  const line = pts.split(' ').join('L')
  const area = `M${line} L${w},${h} L0,${h} Z`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={`M${line}`} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d={area} fill={color} fillOpacity="0.12" />
    </svg>
  )
}

export default function EditorOverviewPage() {
  const [stats, setStats]   = useState({ total: 0, published: 0, drafts: 0, views: 0, pending: 0 })
  const [recent, setRecent] = useState<any[]>([])
  const [name, setName]     = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('user_id', session.user.id)
        .single()
      setName(profile?.display_name || profile?.full_name || 'Editor')

      const [{ data: arts }, { data: comms }, { data: recentArts }] = await Promise.all([
        supabase.from('articles').select('id, is_published, views'),
        supabase.from('article_comments').select('id').eq('is_approved', false),
        supabase
          .from('articles')
          .select('id, title, is_published, views, created_at, category')
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      setStats({
        total:     arts?.length || 0,
        published: arts?.filter(a => a.is_published).length || 0,
        drafts:    arts?.filter(a => !a.is_published).length || 0,
        views:     arts?.reduce((s, a) => s + (a.views || 0), 0) || 0,
        pending:   comms?.length || 0,
      })
      setRecent(recentArts || [])
      setLoading(false)
    }
    load()
  }, [])

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })

  const firstName = name.split(' ')[0]

  return (
    <div className="max-w-[900px]">

      {/* ── Welcome banner ── */}
      <div className="bg-[#1B3060] rounded-2xl p-7 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 right-0 w-72 h-72 opacity-[0.18] pointer-events-none"
          style={{ background: 'radial-gradient(circle,#C9A227 0%,transparent 70%)', transform: 'translate(30%,-30%)' }}
        />
        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div>
            {/* [FIX] was font-['Plus_Jakarta_Sans'] */}
            <h1 className="font-heading font-black text-white text-2xl tracking-tight mb-1">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="font-body text-white/50 text-sm">Here's your Insights overview for today.</p>
          </div>
          <Link href="/dashboard/editor/insights/editor"
            className="inline-flex items-center gap-2 font-heading font-bold text-sm text-[#1B3060] px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shrink-0"
            style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
            <PenSquare size={15} /> Write New Article
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        {[
          { label: 'Total Articles',   value: stats.total,                       color: '#2563eb', spark: [2,3,4,3,5,4,stats.total]          },
          { label: 'Published',        value: stats.published,                   color: '#059669', spark: [1,2,2,3,3,4,stats.published]       },
          { label: 'Total Views',      value: stats.views.toLocaleString(),      color: '#7c3aed', spark: [10,20,30,28,40,50,stats.views]      },
          { label: 'Pending Comments', value: stats.pending,                     color: stats.pending > 0 ? '#f59e0b' : '#9ca3af',
            spark: [1,2,1,3,2,2,stats.pending], alert: stats.pending > 0 },
        ].map(s => (
          <div key={s.label}
            className={`bg-white rounded-2xl border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${
              s.alert ? 'border-amber-200' : 'border-gray-100'
            }`}>
            <p className="font-body text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">{s.label}</p>
            <div className="flex items-end justify-between">
              <p className="font-heading font-black text-[#1B3060] text-3xl tracking-tight leading-none">{s.value}</p>
              <Sparkline data={s.spark} color={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="grid sm:grid-cols-2 gap-3.5 mb-6">
        <Link href="/dashboard/editor/insights/editor"
          className="flex items-center gap-4 p-5 rounded-2xl relative overflow-hidden hover:opacity-95 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <PenSquare size={22} className="text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-white text-sm">Write New Article</p>
            <p className="font-body text-white/70 text-xs mt-0.5">Create, format and publish</p>
          </div>
          <ChevronRight size={16} className="text-white/40 ml-auto" />
        </Link>

        <Link href="/dashboard/editor/insights"
          className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-[#C9A227]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all group">
          <div className="w-12 h-12 bg-[#EBF0F8] rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare size={20} className="text-[#1B3060]" />
          </div>
          <div>
            <p className="font-heading font-bold text-[#1B3060] text-sm">Moderate Comments</p>
            <p className="font-body text-gray-400 text-xs mt-0.5">
              {stats.pending > 0
                ? <><span className="text-amber-500 font-semibold">{stats.pending}</span> pending review</>
                : 'All caught up ✅'}
            </p>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 ml-auto transition-colors" />
        </Link>
      </div>

      {/* ── Recent articles ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-[#1B3060] text-[15px]">Recent Articles</h2>
          <Link href="/dashboard/editor/insights"
            className="font-body text-xs font-semibold text-[#C9A227] hover:text-[#a8861f] transition-colors flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="font-body text-gray-400 text-sm mb-2">No articles yet.</p>
            <Link href="/dashboard/editor/insights/editor"
              className="font-body text-sm text-[#C9A227] hover:underline inline-flex items-center gap-1">
              Write your first one <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(art => (
              <div key={art.id}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold text-[#1B3060] text-sm line-clamp-1 mb-0.5">
                    {art.title}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} />{formatDate(art.created_at)}
                    </span>
                    <span className="font-body text-xs text-gray-400 flex items-center gap-1">
                      <Eye size={10} />{(art.views || 0).toLocaleString()}
                    </span>
                    {art.category && (
                      <span className="font-body text-[10px] font-semibold bg-[#EBF0F8] text-[#1B3060] px-2 py-0.5 rounded-full">
                        {art.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className={`font-body text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    art.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {art.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Link href={`/dashboard/editor/insights/editor?id=${art.id}`}
                    className="font-heading text-xs font-semibold text-[#1B3060] bg-[#EBF0F8] px-3 py-1 rounded-lg hover:bg-[#1B3060] hover:text-white transition-colors">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}