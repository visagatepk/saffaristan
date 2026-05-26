'use client'
// FILE: app/dashboard/editor/insights/page.tsx

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  PenSquare, Eye, Trash2, CheckCircle, XCircle,
  MessageSquare, FileText, Clock, Search, X,
  AlertCircle, Loader2, ToggleLeft, ToggleRight, ArrowRight,
} from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  is_published: boolean
  is_featured: boolean
  views: number
  created_at: string
  category: string
}

interface Comment {
  id: string
  content: string
  is_approved: boolean
  created_at: string
  article_id: string
  articles: { title: string; slug: string } | null
  profiles: { display_name: string } | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner component — uses useSearchParams (needs Suspense)
// ─────────────────────────────────────────────────────────────────────────────
function InsightsContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const activeTab    = (searchParams?.get('tab') || 'articles') as 'articles' | 'comments'

  const [articles, setArticles]   = useState<Article[]>([])
  const [comments, setComments]   = useState<Comment[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [actionMsg, setActionMsg] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (activeTab === 'articles') {
          const { data } = await supabase
            .from('articles')
            .select('id, title, slug, is_published, is_featured, views, created_at, category')
            .order('created_at', { ascending: false })
          setArticles((data || []) as Article[])
        } else {
          const { data } = await supabase
            .from('article_comments')
            .select('id, content, is_approved, created_at, article_id, articles(title, slug), profiles(display_name)')
            .order('created_at', { ascending: false })
            .limit(100)
          setComments((data || []) as unknown as Comment[])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const togglePublish = async (article: Article) => {
    await supabase.from('articles').update({ is_published: !article.is_published }).eq('id', article.id)
    setArticles(prev => prev.map(a => a.id === article.id ? { ...a, is_published: !a.is_published } : a))
    flash(article.is_published ? 'Article unpublished' : 'Article published ✓')
  }

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return
    await supabase.from('articles').delete().eq('id', id)
    setArticles(prev => prev.filter(a => a.id !== id))
    flash('Article deleted')
  }

  const approveComment = async (id: string) => {
    await supabase.from('article_comments').update({ is_approved: true }).eq('id', id)
    setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: true } : c))
    flash('Comment approved ✓')
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment permanently?')) return
    await supabase.from('article_comments').delete().eq('id', id)
    setComments(prev => prev.filter(c => c.id !== id))
    flash('Comment deleted')
  }

  const flash = (msg: string) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(''), 3000)
  }

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount  = comments.filter(c => !c.is_approved).length
  const approvedCount = comments.filter(c => c.is_approved).length

  return (
    <div className="max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {/* [FIX] was font-['Plus_Jakarta_Sans'] */}
          <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-1">Insights</h1>
          <p className="font-body text-gray-400 text-sm">Manage articles and moderate comments</p>
        </div>
        <div className="flex items-center gap-2.5">
          {actionMsg && (
            <span className="flex items-center gap-1.5 font-body text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              <CheckCircle size={13} /> {actionMsg}
            </span>
          )}
          <Link href="/dashboard/editor/insights/editor"
            className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
            <PenSquare size={14} /> New Article
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5 w-fit">
        {([
          { key: 'articles', label: 'Articles',  icon: FileText,      count: articles.length, badge: false },
          { key: 'comments', label: 'Comments',  icon: MessageSquare, count: pendingCount,    badge: true  },
        ] as const).map(tab => (
          <button key={tab.key}
            onClick={() => router.push(`/dashboard/editor/insights?tab=${tab.key}`)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-semibold text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-white text-[#1B3060] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon size={14} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab.badge && tab.count > 0
                  // [FIX] was orange — matches gold design system
                  ? 'bg-[#C9A227] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── ARTICLES TAB ── */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search articles by title or category…"
                className="font-body w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3060]/10 focus:border-[#1B3060] transition-all" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-[#1B3060]" size={26} />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText size={26} className="text-gray-300" />
              </div>
              <p className="font-heading font-bold text-[#1B3060] text-base mb-1">No articles found</p>
              <Link href="/dashboard/editor/insights/editor"
                className="font-body text-sm text-[#C9A227] hover:underline inline-flex items-center gap-1">
                Write your first article <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredArticles.map(article => (
                <div key={article.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-heading font-bold text-[#1B3060] text-sm truncate">
                        {article.title}
                      </p>
                      {article.is_featured && (
                        <span className="font-body text-[10px] font-bold bg-[#FBF5E0] text-[#C9A227] border border-[#C9A227]/30 px-1.5 py-0.5 rounded-full shrink-0">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-body text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={10} />{formatDate(article.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye size={10} />{(article.views || 0).toLocaleString()}</span>
                      <span className="bg-[#EBF0F8] text-[#1B3060] font-semibold px-2 py-0.5 rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Publish toggle */}
                    <button onClick={() => togglePublish(article)}
                      className={`flex items-center gap-1 font-heading text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        article.is_published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}>
                      {article.is_published ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                      {article.is_published ? 'Live' : 'Draft'}
                    </button>
                    <Link href={`/insights/${article.slug}`} target="_blank"
                      className="p-2 rounded-lg text-gray-400 hover:text-[#1B3060] hover:bg-gray-100 transition-colors">
                      <Eye size={14} />
                    </Link>
                    <Link href={`/dashboard/editor/insights/editor?id=${article.id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#1B3060] hover:bg-gray-100 transition-colors">
                      <PenSquare size={14} />
                    </Link>
                    <button onClick={() => deleteArticle(article.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── COMMENTS TAB ── */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <p className="font-heading font-black text-[#C9A227] text-3xl tracking-tight">{pendingCount}</p>
              <p className="font-body text-sm text-gray-400 mt-0.5">Pending Approval</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <p className="font-heading font-black text-green-600 text-3xl tracking-tight">{approvedCount}</p>
              <p className="font-body text-sm text-gray-400 mt-0.5">Approved</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <Loader2 className="animate-spin text-[#1B3060]" size={26} />
            </div>
          ) : comments.length === 0 ? (
            <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <MessageSquare size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="font-body text-gray-400 text-sm">No comments yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {pendingCount > 0 && (
                <div className="px-5 py-3 bg-[#FBF5E0] border-b border-[#C9A227]/20">
                  <p className="font-body text-sm font-semibold text-[#C9A227] flex items-center gap-2">
                    <AlertCircle size={13} />
                    {pendingCount} comment{pendingCount !== 1 ? 's' : ''} pending approval
                  </p>
                </div>
              )}
              <div className="divide-y divide-gray-50">
                {[...comments.filter(c => !c.is_approved), ...comments.filter(c => c.is_approved)].map(comment => (
                  <div key={comment.id}
                    className={`p-5 hover:bg-gray-50 transition-colors ${!comment.is_approved ? 'border-l-4 border-[#C9A227]' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-heading font-bold text-[#1B3060] text-sm">
                            {comment.profiles?.display_name || 'Anonymous'}
                          </span>
                          <span className="font-body text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                          <span className={`font-body text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            comment.is_approved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-[#FBF5E0] text-[#C9A227]'
                          }`}>
                            {comment.is_approved ? '✓ Approved' : '⏳ Pending'}
                          </span>
                        </div>
                        <p className="font-body text-gray-700 text-sm leading-relaxed mb-1.5">{comment.content}</p>
                        {comment.articles && (
                          <Link href={`/insights/${comment.articles.slug}`} target="_blank"
                            className="font-body text-xs text-[#C9A227] hover:underline inline-flex items-center gap-1">
                            <FileText size={10} /> {comment.articles.title}
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!comment.is_approved && (
                          <button onClick={() => approveComment(comment.id)}
                            className="font-heading flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition-colors">
                            <CheckCircle size={12} /> Approve
                          </button>
                        )}
                        <button onClick={() => deleteComment(comment.id)}
                          className="font-heading flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors">
                          <XCircle size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function EditorInsightsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-[#1B3060]" size={26} />
      </div>
    }>
      <InsightsContent />
    </Suspense>
  )
}