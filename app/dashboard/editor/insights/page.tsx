'use client'
// FILE: app/dashboard/editor/insights/page.tsx

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  PenSquare, Eye, Trash2, CheckCircle, XCircle,
  MessageSquare, FileText, Clock, Search,
  AlertCircle, Loader2, ToggleLeft, ToggleRight
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

function InsightsContent() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const activeTab     = searchParams?.get('tab') || 'articles'

  const [articles, setArticles]   = useState<Article[]>([])
  const [comments, setComments]   = useState<Comment[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [actionMsg, setActionMsg] = useState('')

  const supabase = createClient()

  // ── Load data ──────────────────────────────────────────────────────────────
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
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeTab])

  // ── Article actions ────────────────────────────────────────────────────────
  const togglePublish = async (article: Article) => {
    await supabase
      .from('articles')
      .update({ is_published: !article.is_published })
      .eq('id', article.id)
    setArticles(prev => prev.map(a => a.id === article.id ? { ...a, is_published: !a.is_published } : a))
    flash(article.is_published ? 'Article unpublished' : 'Article published ✓')
  }

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return
    await supabase.from('articles').delete().eq('id', id)
    setArticles(prev => prev.filter(a => a.id !== id))
    flash('Article deleted')
  }

  // ── Comment actions ────────────────────────────────────────────────────────
  const approveComment = async (id: string) => {
    await supabase.from('article_comments').update({ is_approved: true }).eq('id', id)
    setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: true } : c))
    flash('Comment approved ✓')
  }

  const rejectComment = async (id: string) => {
    if (!confirm('Delete this comment permanently?')) return
    await supabase.from('article_comments').delete().eq('id', id)
    setComments(prev => prev.filter(c => c.id !== id))
    flash('Comment deleted')
  }

  const flash = (msg: string) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(''), 3000)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount  = comments.filter(c => !c.is_approved).length
  const approvedCount = comments.filter(c => c.is_approved).length

  return (
    <div className="max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans']">Insights</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage articles and moderate comments</p>
        </div>
        <div className="flex items-center gap-2">
          {actionMsg && (
            <span className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              <CheckCircle size={13} /> {actionMsg}
            </span>
          )}
          <Link href="/dashboard/editor/insights/editor"
            className="flex items-center gap-2 bg-[#C9A227] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#b8911f] transition-colors">
            <PenSquare size={15} /> New Article
          </Link>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
        {[
          { key: 'articles', label: 'Articles', icon: FileText, count: articles.length },
          { key: 'comments', label: 'Comments', icon: MessageSquare, count: pendingCount, badge: true },
        ].map(tab => (
          <button key={tab.key}
            onClick={() => router.push(`/dashboard/editor/insights?tab=${tab.key}`)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key ? 'bg-white text-[#1B3060] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon size={15} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                tab.badge && tab.count > 0
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── ARTICLES TAB ── */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3060]/20" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-[#1B3060]" size={28} />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400">No articles found</p>
              <Link href="/dashboard/editor/insights/editor"
                className="text-sm text-[#C9A227] hover:underline mt-2 inline-block">
                Write your first article →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredArticles.map(article => (
                <div key={article.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-[#1B3060] truncate">{article.title}</p>
                      {article.is_featured && (
                        <span className="text-[10px] font-bold bg-[#C9A227]/10 text-[#C9A227] px-2 py-0.5 rounded-full flex-shrink-0">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={10} />{formatDate(article.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye size={10} />{article.views || 0} views</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full">{article.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Published toggle */}
                    <button onClick={() => togglePublish(article)} title={article.is_published ? 'Unpublish' : 'Publish'}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        article.is_published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}>
                      {article.is_published ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {article.is_published ? 'Live' : 'Draft'}
                    </button>

                    {/* View */}
                    <Link href={`/insights/${article.slug}`} target="_blank"
                      className="p-2 rounded-lg text-gray-400 hover:text-[#1B3060] hover:bg-gray-100 transition-colors" title="View">
                      <Eye size={15} />
                    </Link>

                    {/* Edit */}
                    <Link href={`/dashboard/editor/insights/editor?id=${article.id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#1B3060] hover:bg-gray-100 transition-colors" title="Edit">
                      <PenSquare size={15} />
                    </Link>

                    {/* Delete */}
                    <button onClick={() => deleteArticle(article.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 size={15} />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
              <p className="text-sm text-gray-500">Pending Approval</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl">
              <Loader2 className="animate-spin text-[#1B3060]" size={28} />
            </div>
          ) : comments.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
              <MessageSquare size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400">No comments yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Pending first */}
              {pendingCount > 0 && (
                <div className="px-5 py-3 bg-orange-50 border-b border-orange-100">
                  <p className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                    <AlertCircle size={14} /> {pendingCount} comment{pendingCount !== 1 ? 's' : ''} pending approval
                  </p>
                </div>
              )}
              <div className="divide-y divide-gray-50">
                {[...comments.filter(c => !c.is_approved), ...comments.filter(c => c.is_approved)].map(comment => (
                  <div key={comment.id} className={`p-5 ${!comment.is_approved ? 'bg-orange-50/30' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Comment meta */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#1B3060]">
                            {comment.profiles?.display_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            comment.is_approved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-600'
                          }`}>
                            {comment.is_approved ? '✓ Approved' : '⏳ Pending'}
                          </span>
                        </div>

                        {/* Comment text */}
                        <p className="text-gray-700 text-sm leading-relaxed mb-2">{comment.content}</p>

                        {/* Article reference */}
                        {comment.articles && (
                          <Link href={`/insights/${comment.articles.slug}`} target="_blank"
                            className="text-xs text-[#C9A227] hover:underline flex items-center gap-1">
                            <FileText size={10} /> {comment.articles.title}
                          </Link>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!comment.is_approved && (
                          <button onClick={() => approveComment(comment.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-2 rounded-xl transition-colors">
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        <button onClick={() => rejectComment(comment.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors">
                          <XCircle size={13} /> Delete
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
        <Loader2 className="animate-spin text-[#1B3060]" size={28} />
      </div>
    }>
      <InsightsContent />
    </Suspense>
  )
}