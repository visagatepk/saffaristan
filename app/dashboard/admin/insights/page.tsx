'use client'
// FILE: app/dashboard/admin/insights/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus, Eye, Edit, Trash2, Star, StarOff, Globe, EyeOff,
  MessageSquare, CheckCircle, BarChart2, FileText,
  BookOpen, AlertCircle, ArrowRight,
} from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  cover_image: string | null
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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminInsightsPage() {
  const [articles, setArticles]           = useState<Article[]>([])
  const [comments, setComments]           = useState<Comment[]>([])
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState<Tab>('articles')
  const [deleteId, setDeleteId]           = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: arts }, { data: comms }] = await Promise.all([
      supabase
        .from('articles')
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
      a.id === id
        ? { ...a, is_featured: !current }
        : { ...a, is_featured: current ? false : a.is_featured }
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

  return (
    <div className="max-w-[1000px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {/* [FIX] was font-['Plus_Jakarta_Sans'] */}
          <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-1">Insights Manager</h1>
          <p className="font-body text-gray-400 text-sm">Manage articles and moderate comments</p>
        </div>
        <Link href="/dashboard/admin/insights/editor"
          className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
          <Plus size={15} /> New Article
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Articles',   value: stats.total,                       icon: FileText,      color: 'bg-blue-50 text-blue-600' },
          { label: 'Published',        value: stats.published,                   icon: Globe,         color: 'bg-green-50 text-green-600' },
          { label: 'Drafts',           value: stats.drafts,                      icon: EyeOff,        color: 'bg-gray-100 text-gray-600' },
          { label: 'Total Views',      value: stats.totalViews.toLocaleString(), icon: BarChart2,     color: 'bg-purple-50 text-purple-600' },
          { label: 'Pending Comments', value: stats.pendingComments,             icon: MessageSquare, color: stats.pendingComments > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={16} />
            </div>
            <div className="font-heading font-black text-[#1B3060] text-2xl tracking-tight">{stat.value}</div>
            <div className="font-body text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5">
        {(['articles', 'comments'] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`font-heading font-semibold px-5 py-2 rounded-lg text-sm capitalize transition-all ${
              activeTab === tab
                ? 'bg-[#1B3060] text-white shadow-sm'
                : 'bg-white text-gray-500 hover:text-[#1B3060] border border-gray-200'
            }`}>
            {tab}
            {tab === 'comments' && stats.pendingComments > 0 && (
              <span className="ml-2 bg-[#C9A227] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {stats.pendingComments}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Articles Tab ── */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="p-16 text-center">
              <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="font-heading font-bold text-[#1B3060] text-base mb-1">No articles yet</p>
              <Link href="/dashboard/admin/insights/editor"
                className="font-body text-sm text-[#C9A227] hover:underline mt-1 inline-flex items-center gap-1">
                Create your first article <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Article', 'Category', 'Status', 'Featured', 'Views', 'Date', 'Actions'].map(h => (
                      <th key={h} className="font-heading font-bold text-[#1B3060] text-xs px-4 py-3 text-left uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {articles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      {/* Article */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {article.cover_image ? (
                              <Image src={article.cover_image} alt="" fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <BookOpen size={13} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-[#1B3060] text-sm line-clamp-1 max-w-[200px]">
                              {article.title}
                            </p>
                            <p className="font-body text-gray-400 text-xs">by {article.author_name}</p>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="font-body text-xs bg-[#EBF0F8] text-[#1B3060] font-semibold px-2.5 py-1 rounded-full">
                          {article.category}
                        </span>
                      </td>
                      {/* Status toggle */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => togglePublish(article.id, article.is_published)}
                          disabled={actionLoading === article.id + '_pub'}
                          className={`font-body text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                            article.is_published
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}>
                          {article.is_published ? '● Published' : '○ Draft'}
                        </button>
                      </td>
                      {/* Featured toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleFeatured(article.id, article.is_featured)}
                          disabled={actionLoading === article.id + '_feat'}
                          title={article.is_featured ? 'Remove featured' : 'Set as featured'}>
                          {article.is_featured
                            ? <Star size={16} className="text-[#C9A227] fill-[#C9A227]" />
                            : <StarOff size={16} className="text-gray-300 hover:text-[#C9A227] transition-colors" />
                          }
                        </button>
                      </td>
                      {/* Views */}
                      <td className="px-4 py-4 text-center">
                        <span className="flex items-center justify-center gap-1 font-body text-sm text-gray-500">
                          <Eye size={12} className="text-gray-400" />
                          {(article.views || 0).toLocaleString()}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-4">
                        <span className="font-body text-xs text-gray-400">{formatDate(article.created_at)}</span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/dashboard/admin/insights/editor?id=${article.id}`}
                            className="p-2 text-gray-400 hover:text-[#1B3060] hover:bg-gray-100 rounded-lg transition-all"
                            title="Edit">
                            <Edit size={14} />
                          </Link>
                          <Link href={`/insights/${article.slug}`} target="_blank"
                            className="p-2 text-gray-400 hover:text-[#1B3060] hover:bg-gray-100 rounded-lg transition-all"
                            title="View public">
                            <Eye size={14} />
                          </Link>
                          <button onClick={() => setDeleteId(article.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete">
                            <Trash2 size={14} />
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="p-16 text-center">
              <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="font-body text-gray-400 text-sm">No comments yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Pending first */}
              {[...comments.filter(c => !c.is_approved), ...comments.filter(c => c.is_approved)].map(comment => (
                <div key={comment.id}
                  className={`p-5 hover:bg-gray-50 transition-colors ${!comment.is_approved ? 'border-l-4 border-[#C9A227]' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-heading font-bold text-[#1B3060] text-sm">
                          {comment.profiles?.display_name || 'User'}
                        </span>
                        <span className={`font-body text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          comment.is_approved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {comment.is_approved ? 'Approved' : 'Pending'}
                        </span>
                        <span className="font-body text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="font-body text-sm text-gray-700 mb-1.5">{comment.content}</p>
                      <p className="font-body text-xs text-gray-400 flex items-center gap-1">
                        <BookOpen size={10} />
                        {(comment.articles as any)?.title || 'Unknown article'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!comment.is_approved && (
                        <button onClick={() => updateComment(comment.id, 'approve')}
                          disabled={actionLoading === comment.id}
                          className="font-heading flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                          <CheckCircle size={12} /> Approve
                        </button>
                      )}
                      {comment.is_approved && (
                        <button onClick={() => updateComment(comment.id, 'hide')}
                          disabled={actionLoading === comment.id}
                          className="font-heading flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                          <EyeOff size={12} /> Hide
                        </button>
                      )}
                      <button onClick={() => updateComment(comment.id, 'delete')}
                        disabled={actionLoading === comment.id}
                        className="font-heading flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={19} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[#1B3060]">Delete Article?</h3>
                <p className="font-body text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 font-heading font-bold text-sm py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteArticle(deleteId)}
                className="flex-1 font-heading font-bold text-sm py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}