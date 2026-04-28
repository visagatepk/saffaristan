'use client'
// FILE: app/dashboard/editor/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { FileText, MessageSquare, Eye, PenSquare, TrendingUp, Clock } from 'lucide-react'

export default function EditorOverviewPage() {
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, views: 0, pending: 0 })
  const [recent, setRecent] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', session.user.id)
        .single()
      setName(profile?.display_name || 'Editor')

      const [{ data: arts }, { data: comms }] = await Promise.all([
        supabase.from('articles').select('id, is_published, views'),
        supabase.from('article_comments').select('id, is_approved').eq('is_approved', false)
      ])

      const { data: recentArts } = await supabase
        .from('articles')
        .select('id, title, is_published, views, created_at, category')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        total: arts?.length || 0,
        published: arts?.filter(a => a.is_published).length || 0,
        drafts: arts?.filter(a => !a.is_published).length || 0,
        views: arts?.reduce((s, a) => s + (a.views || 0), 0) || 0,
        pending: comms?.length || 0,
      })
      setRecent(recentArts || [])
      setLoading(false)
    }
    load()
  }, [])

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })

  return (
    <div className="max-w-4xl">
      {/* Welcome */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans']">
          Welcome back, {name}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your Insights overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total Articles', value: stats.total, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Published', value: stats.published, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Total Views', value: stats.views.toLocaleString(), icon: Eye, color: 'text-purple-600 bg-purple-50' },
          { label: 'Pending Comments', value: stats.pending, icon: MessageSquare, color: stats.pending > 0 ? 'text-orange-600 bg-orange-50' : 'text-gray-500 bg-gray-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div className="text-2xl font-bold text-[#1B3060]">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        <Link href="/dashboard/editor/insights/editor" className="flex items-center gap-3 bg-[#C9A227] text-white p-4 rounded-2xl hover:bg-[#b8911f] transition-colors group">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <PenSquare size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm">Write New Article</div>
            <div className="text-white/70 text-xs">Create and publish</div>
          </div>
        </Link>
        <Link href="/dashboard/editor/insights?tab=comments" className="flex items-center gap-3 bg-[#1B3060] text-white p-4 rounded-2xl hover:bg-[#243d7a] transition-colors">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm">Moderate Comments</div>
            <div className="text-white/70 text-xs">{stats.pending} pending review</div>
          </div>
        </Link>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#1B3060] text-sm">Recent Articles</h2>
          <Link href="/dashboard/editor/insights" className="text-xs text-[#C9A227] font-medium hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No articles yet. <Link href="/dashboard/editor/insights/editor" className="text-[#C9A227] hover:underline">Write your first one →</Link></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(art => (
              <div key={art.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#1B3060] line-clamp-1">{art.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{formatDate(art.created_at)}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={10} />{art.views || 0} views</span>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${art.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {art.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}