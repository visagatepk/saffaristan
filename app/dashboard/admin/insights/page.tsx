'use client'
// FILE: app/dashboard/admin/insights/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus, Eye, Edit, Trash2, Star, StarOff, Globe, EyeOff,
  MessageSquare, CheckCircle, BarChart2, FileText,
  BookOpen, AlertCircle
} from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  cover_image: string | null        // ✅ correct column name
  category: string
  is_published: boolean
  is_featured: boolean
  views: number
  created_at: string
  author_name: string
}

interface Comment {
  id: string
  content: string
  is_approved: boolean
  created_at: string
  article_id: string
  user_id: string
  profiles: { display_name: string } | null
  articles: { title: string } | null
}

type Tab = 'articles' | 'comments'

export default function AdminInsightsPage() {
  const [articles, setArticles]         = useState<Article[]>([])
  const [comments, setComments]         = useState<Comment[]>([])
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState<Tab>('articles')
  const [deleteId, setDeleteId]         = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: arts }, { data: comms }] = await Promise.all([
      supabase
        .from('articles')
        // ✅ cover_image — correct column name
        .select('id, title, slug, cover_image, category, is_published, is_featured, views, created_at, author_name')
        .order('created_at', { ascending: false }),
      supabase
        .from('article_comments')
        .select('id, content, is_approved, created_at, article_id, user_id, profiles(display_name), articles(title)')
        .order('created_at', { ascending: false }),
    ])
    setArticles((arts || []) as Article[])
    setComments((comms || []) as unknown as Comment[])
    setLoading(false)
  }

  const togglePublish = async (id: string, current: boolean) => {
    setActionLoading(id + '_pub')
    await supabase.from('articles').update({ is_published: !current }).eq('id', id)
    setArticles(prev => prev.map(a => a.id === id ? { ...a, is_published: !current } : a))
    setActionLoading(null)
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    setActionLoading(id + '_feat')
    if (!current) await supabase.from('articles').update({ is_featured: false }).neq('id', id)
    await supabase.from('articles').update({ is_featured: !current }).eq('id', id)
    setArticles(prev => prev.map(a =>
      a.id === id ? { ...a, is_featured: !current } : { ...a, is_featured: current ? false : a.is_featured }
    ))
    setActionLoading(null)
  }

  const deleteArticle = async (id: string) => {
    await supabase.from('articles').delete().eq('id', id)
    setArticles(prev => prev.filter(a => a.id !== id))
    setDeleteId(null)
  }

  const updateComment = async (id: string, action: 'approve' | 'hide' | 'delete') => {
    setActionLoading(id)
    if (action === 'delete') {
      await supabase.from('article_comments').delete().eq('id', id)
      setComments(prev => prev.filter(c => c.id !== id))
    } else {
      const val = action === 'approve'
      await supabase.from('article_comments').update({ is_approved: val }).eq('id', id)
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: val } : c))
    }
    setActionLoading(null)
  }

  const stats = {
    total:           articles.length,
    published:       articles.filter(a => a.is_published).length,
    drafts:          articles.filter(a => !a.is_published).length,
    totalViews:      articles.reduce((sum, a) => sum + (a.views || 0), 0),
    pendingComments: comments.filter(c => !c.is_approved).length,
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="p-6 max-w-7xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans']">Insights Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Manage articles and moderate comments</p>
        </div>
        <Link href="/dashboard/admin/insights/editor"
          className="flex items-center gap-2 bg-[#C9A227] text-white px-4 py-2.5 rounded-xl hover:bg-[#b8911f] transition-colors text-sm font-semibold">
          <Plus size={16} /> New Article
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Articles',    value: stats.total,                      icon: FileText,     color: 'text-blue-600 bg-blue-50' },
          { label: 'Published',         value: stats.published,                  icon: Globe,        color: 'text-green-600 bg-green-50' },
          { label: 'Drafts',            value: stats.drafts,                     icon: EyeOff,       color: 'text-gray-600 bg-gray-100' },
          { label: 'Total Views',       value: stats.totalViews.toLocaleString(), icon: BarChart2,   color: 'text-purple-600 bg-purple-50' },
          { label: 'Pending Comments',  value: stats.pendingComments,            icon: MessageSquare, color: stats.pendingComments > 0 ? 'text-orange-600 bg-orange-50' : 'text-gray-500 bg-gray-100' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div className="text-2xl font-bold text-[#1B3060]">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-5">
        {(['articles', 'comments'] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-[#1B3060] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}>
            {tab}
            {tab === 'comments' && stats.pendingComments > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {stats.pendingComments}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Articles Table ── */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="p-16 text-center">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No articles yet.</p>
              <Link href="/dashboard/admin/insights/editor"
                className="text-[#C9A227] text-sm font-medium hover:underline mt-1 inline-block">
                Create your first article →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Article</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Featured</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Views</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {articles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {/* ✅ article.cover_image — correct */}
                            {article.cover_image ? (
                              <Image src={article.cover_image} alt="" fill className="object-cover" />
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <BookOpen size={14} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1B3060] line-clamp-1">{article.title}</p>
                            <p className="text-xs text-gray-400">by {article.author_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{article.category}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => togglePublish(article.id, article.is_published)}
                          disabled={actionLoading === article.id + '_pub'}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                            article.is_published
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                          {article.is_published ? '● Published' : '○ Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleFeatured(article.id, article.is_featured)}
                          disabled={actionLoading === article.id + '_feat'}
                          title={article.is_featured ? 'Remove featured' : 'Set as featured'}>
                          {article.is_featured
                            ? <Star size={17} className="text-[#C9A227] fill-[#C9A227]" />
                            : <StarOff size={17} className="text-gray-300 hover:text-[#C9A227]" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-sm text-gray-600">
                          <Eye size={13} className="text-gray-400" />{article.views || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-400">{formatDate(article.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/admin/insights/editor?id=${article.id}`}
                            className="p-2 text-gray-500 hover:text-[#1B3060] hover:bg-gray-100 rounded-lg transition-all" title="Edit">
                            <Edit size={15} />
                          </Link>
                          <Link href={`/insights/${article.slug}`} target="_blank"
                            className="p-2 text-gray-500 hover:text-[#1B3060] hover:bg-gray-100 rounded-lg transition-all" title="View public">
                            <Eye size={15} />
                          </Link>
                          <button onClick={() => setDeleteId(article.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Comments Tab ── */}
      {activeTab === 'comments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="p-16 text-center">
              <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No comments yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Pending first */}
              {[...comments.filter(c => !c.is_approved), ...comments.filter(c => c.is_approved)].map(comment => (
                <div key={comment.id}
                  className={`p-5 hover:bg-gray-50 transition-colors ${!comment.is_approved ? 'border-l-4 border-orange-400' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-[#1B3060]">
                          {comment.profiles?.display_name || 'User'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          comment.is_approved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {comment.is_approved ? 'Approved' : 'Pending'}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{comment.content}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <BookOpen size={10} />
                        On: {(comment.articles as any)?.title || 'Unknown article'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!comment.is_approved && (
                        <button onClick={() => updateComment(comment.id, 'approve')}
                          disabled={actionLoading === comment.id}
                          className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors font-medium">
                          <CheckCircle size={13} /> Approve
                        </button>
                      )}
                      {comment.is_approved && (
                        <button onClick={() => updateComment(comment.id, 'hide')}
                          disabled={actionLoading === comment.id}
                          className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          <EyeOff size={13} /> Hide
                        </button>
                      )}
                      <button onClick={() => updateComment(comment.id, 'delete')}
                        disabled={actionLoading === comment.id}
                        className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1B3060]">Delete Article?</h3>
                <p className="text-gray-500 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => deleteArticle(deleteId)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}