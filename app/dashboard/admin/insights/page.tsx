'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  PenSquare, Trash2, Eye, EyeOff, Star, StarOff,
  MessageSquare, Search, Plus, BarChart2, FileText,
  CheckCircle, XCircle, AlertTriangle
} from 'lucide-react'

const CATEGORIES = ['Visa Tips', 'Country Guides', 'Immigration News', 'Success Stories', 'Consultant Advice', 'Policy Updates']

interface Article {
  id: string
  title: string
  slug: string
  category: string
  cover_image: string | null
  is_published: boolean
  is_featured: boolean
  views: number
  created_at: string
  updated_at: string | null
  comment_count?: number
}

interface Comment {
  id: string
  article_id: string
  commenter_name: string
  commenter_city: string
  content: string
  is_approved: boolean
  created_at: string
  article_title?: string
}

interface Stats {
  total: number
  published: number
  drafts: number
  totalViews: number
  pendingComments: number
}

export default function AdminInsightsPage() {
  const router = useRouter()
  const supabase = createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  const [tab, setTab] = useState<'articles' | 'comments'>('articles')
  const [articles, setArticles] = useState<Article[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, drafts: 0, totalViews: 0, pendingComments: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', session.user.id).single()
      if (profile?.role !== 'admin') { router.push('/login'); return }
      await loadData()
    }
    check()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: arts } = await supabase
      .from('articles')
      .select('id, title, slug, category, cover_image, is_published, is_featured, views, created_at, updated_at')
      .order('created_at', { ascending: false })

    const { data: comms } = await supabase
      .from('article_comments')
      .select('id, article_id, commenter_name, commenter_city, content, is_approved, created_at')
      .order('created_at', { ascending: false })

    const { data: artTitles } = await supabase.from('articles').select('id, title')

    const titleMap: Record<string, string> = {}
    artTitles?.forEach(a => { titleMap[a.id] = a.title })

    const enrichedComments = (comms || []).map(c => ({ ...c, article_title: titleMap[c.article_id] || 'Unknown' }))
    const enrichedArticles = (arts || []).map(a => ({
      ...a,
      comment_count: (comms || []).filter(c => c.article_id === a.id).length
    }))

    const totalViews = (arts || []).reduce((sum, a) => sum + (a.views || 0), 0)
    const pendingComments = (comms || []).filter(c => !c.is_approved).length

    setArticles(enrichedArticles)
    setComments(enrichedComments)
    setStats({
      total: arts?.length || 0,
      published: arts?.filter(a => a.is_published).length || 0,
      drafts: arts?.filter(a => !a.is_published).length || 0,
      totalViews,
      pendingComments,
    })
    setLoading(false)
  }

  const togglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from('articles')
      .update({ is_published: !current, published_at: !current ? new Date().toISOString() : null })
      .eq('id', id)
    if (!error) {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_published: !current } : a))
      setStats(prev => ({
        ...prev,
        published: prev.published + (!current ? 1 : -1),
        drafts: prev.drafts + (!current ? -1 : 1),
      }))
      showToast(!current ? 'Article published' : 'Moved to draft')
    }
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('articles').update({ is_featured: !current }).eq('id', id)
    if (!error) {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: !current } : a))
      showToast(!current ? 'Marked as featured' : 'Removed from featured')
    }
  }

  const deleteArticle = async (id: string) => {
    setDeleting(true)
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (!error) {
      setArticles(prev => prev.filter(a => a.id !== id))
      setStats(prev => ({ ...prev, total: prev.total - 1 }))
      showToast('Article deleted')
    }
    setDeleteModal(null)
    setDeleting(false)
  }

  const toggleApproveComment = async (id: string, current: boolean) => {
    const { error } = await supabase.from('article_comments').update({ is_approved: !current }).eq('id', id)
    if (!error) {
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: !current } : c))
      showToast(!current ? 'Comment approved' : 'Comment hidden')
    }
  }

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('article_comments').delete().eq('id', id)
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== id))
      showToast('Comment deleted')
    }
  }

  const filteredArticles = articles.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || a.category === catFilter
    return matchSearch && matchCat
  })

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#F5F6FA] p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg text-center mb-2">Delete Article?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">This will permanently delete the article and all its comments. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
              <button onClick={() => deleteArticle(deleteModal)} disabled={deleting} className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition text-sm disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3060]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Insights Manager</h1>
          <p className="text-gray-400 text-sm mt-0.5">Create, manage and moderate your blog content</p>
        </div>
        <Link href="/dashboard/admin/insights/editor"
          className="flex items-center gap-2 bg-[#1B3060] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#162550] transition shadow-sm">
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
        {[
          { label: 'Total Articles', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Published', value: stats.published, icon: Eye, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Drafts', value: stats.drafts, icon: EyeOff, color: 'text-gray-500', bg: 'bg-gray-100' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending Comments', value: stats.pendingComments, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-extrabold text-[#1B3060]">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 border border-gray-100 shadow-sm inline-flex mb-6">
        {(['articles', 'comments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-[#1B3060] text-white' : 'text-gray-500 hover:text-[#1B3060]'}`}>
            {t} {t === 'comments' && stats.pendingComments > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingComments}</span>
            )}
          </button>
        ))}
      </div>

      {/* Articles Tab */}
      {tab === 'articles' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 p-4 border-b border-gray-100">
            <div className="flex-1 min-w-48 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none bg-white">
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-600">No articles found</p>
              <p className="text-gray-400 text-sm mt-1">Create your first article to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Article</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Views</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Comments</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredArticles.map(article => {
                    const imgSrc = article.cover_image ? `${supabaseUrl}/storage/v1/object/public/articles/${article.cover_image}` : null
                    return (
                      <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-9 rounded-lg overflow-hidden bg-[#1B3060]/10 shrink-0">
                              {imgSrc ? <img src={imgSrc} alt="" className="w-full h-full object-cover" /> : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText size={14} className="text-[#1B3060]/30" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 line-clamp-1 max-w-48">{article.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">/{article.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-[#1B3060] bg-[#1B3060]/10 px-2.5 py-1 rounded-full">
                            {article.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${article.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {article.is_published ? 'Published' : 'Draft'}
                            </span>
                            {article.is_featured && (
                              <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#C9A227]/15 text-[#C9A227]">Featured</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-700">{(article.views || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-500">{article.comment_count || 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-400">{formatDate(article.created_at)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/dashboard/admin/insights/editor?id=${article.id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500 transition" title="Edit">
                              <PenSquare size={14} />
                            </Link>
                            <button onClick={() => togglePublish(article.id, article.is_published)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${article.is_published ? 'hover:bg-orange-50 text-orange-500' : 'hover:bg-green-50 text-green-500'}`}
                              title={article.is_published ? 'Unpublish' : 'Publish'}>
                              {article.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => toggleFeatured(article.id, article.is_featured)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${article.is_featured ? 'hover:bg-yellow-50 text-[#C9A227]' : 'hover:bg-gray-100 text-gray-400'}`}
                              title={article.is_featured ? 'Remove featured' : 'Mark featured'}>
                              {article.is_featured ? <Star size={14} className="fill-[#C9A227]" /> : <StarOff size={14} />}
                            </button>
                            <button onClick={() => setDeleteModal(article.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Comments Tab */}
      {tab === 'comments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {comments.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-600">No comments yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {comments.map(comment => (
                <div key={comment.id} className={`p-4 ${!comment.is_approved ? 'bg-orange-50/40' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">{comment.commenter_name}</span>
                        {comment.commenter_city && <span className="text-xs text-gray-400">{comment.commenter_city}</span>}
                        {!comment.is_approved && (
                          <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Pending</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{comment.content}</p>
                      <p className="text-xs text-gray-400">On: <span className="font-medium text-[#1B3060]">{comment.article_title}</span> · {formatDate(comment.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleApproveComment(comment.id, comment.is_approved)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${comment.is_approved ? 'hover:bg-orange-50 text-orange-500' : 'hover:bg-green-50 text-green-500'}`}
                        title={comment.is_approved ? 'Hide' : 'Approve'}>
                        {comment.is_approved ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                      <button onClick={() => deleteComment(comment.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}