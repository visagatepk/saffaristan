'use client'
// FILE: app/insights/[slug]/ArticleClient.tsx

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Clock, Eye, Tag, ArrowLeft, Share2, MessageSquare,
  ChevronRight, User, Send, CheckCircle, AlertCircle,
  Heart, Link2, BookOpen,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image_url: string | null
  category: string
  tags: string[]
  author_name: string
  read_time: number
  views: number
  likes_count: number
  created_at: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { display_name: string; avatar_url: string | null } | null
}

interface RelatedArticle {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  category: string
  read_time: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown renderer
// ─────────────────────────────────────────────────────────────────────────────
function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.15rem;font-weight:700;color:#1B3060;margin:2rem 0 0.5rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 id="$1" style="font-size:1.4rem;font-weight:700;color:#1B3060;margin:2.5rem 0 0.75rem;scroll-margin-top:80px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.7rem;font-weight:700;color:#1B3060;margin:2rem 0 1rem">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:#1B3060">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#f3f4f6;color:#1B3060;padding:2px 6px;border-radius:4px;font-size:0.875rem;font-family:monospace">$1</code>')
    .replace(/^\> (.+)$/gm, '<blockquote style="border-left:4px solid #C9A227;padding:8px 16px;background:#fefce8;margin:16px 0;border-radius:0 8px 8px 0;color:#555;font-style:italic">$1</blockquote>')
    .replace(/^\- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px;display:flex;gap:8px"><span style="color:#C9A227;margin-top:6px;flex-shrink:0">•</span><span>$1</span></li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin:16px 0">$&</ul>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#1B3060;font-weight:500;text-decoration:underline" target="_blank">$1</a>')
    .replace(/\n\n/g, '</p><p style="margin-bottom:1rem;color:#374151;line-height:1.8">')
}

function extractHeadings(content: string) {
  return [...content.matchAll(/^## (.+)$/gm)].map(m => ({ id: m[1], text: m[1] }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ArticleClient() {
  const params  = useParams()
  const slug    = params?.slug as string

  const [article, setArticle]           = useState<Article | null>(null)
  const [related, setRelated]           = useState<RelatedArticle[]>([])
  const [comments, setComments]         = useState<Comment[]>([])
  const [loading, setLoading]           = useState(true)
  const [commentText, setCommentText]   = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [commentStatus, setCommentStatus] = useState<'idle' | 'success' | 'error' | 'login'>('idle')
  const [session, setSession]           = useState<any>(null)
  const [liked, setLiked]               = useState(false)
  const [likeCount, setLikeCount]       = useState(0)
  const [likeLoading, setLikeLoading]   = useState(false)
  const [shareOpen, setShareOpen]       = useState(false)
  const [copied, setCopied]             = useState(false)

  useEffect(() => {
    if (!slug) return
    const supabase = createClient()

    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession()
      setSession(s)

      const { data: art } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (!art) { setLoading(false); return }
      setArticle(art as Article)
      setLikeCount(art.likes_count || 0)

      // Increment view count
      await supabase
        .from('articles')
        .update({ views: (art.views || 0) + 1 })
        .eq('id', art.id)

      // Check if current user has liked
      if (s) {
        const { data: like } = await supabase
          .from('article_likes')
          .select('id')
          .eq('article_id', art.id)
          .eq('user_id', s.user.id)
          .maybeSingle()
        setLiked(!!like)
      }

      // Related articles
      const { data: rel } = await supabase
        .from('articles')
        .select('id, title, slug, cover_image_url, category, read_time')
        .eq('is_published', true)
        .eq('category', art.category)
        .neq('id', art.id)
        .limit(3)
      setRelated((rel || []) as RelatedArticle[])

      // ─────────────────────────────────────────────────────────────────
      // [FIX] Comments: removed .eq('is_approved', true) filter.
      // All published comments now load immediately — no admin gate.
      // ─────────────────────────────────────────────────────────────────
      const { data: comms } = await supabase
        .from('article_comments')
        .select('id, content, created_at, user_id, profiles(display_name, avatar_url)')
        .eq('article_id', art.id)
        .order('created_at', { ascending: true })
      setComments((comms || []) as unknown as Comment[])

      setLoading(false)
    }
    init()
  }, [slug])

  // ─────────────────────────────────────────────────────────────────────────
  // Like handler
  // ─────────────────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!session) { setCommentStatus('login'); return }
    if (!article || likeLoading) return
    setLikeLoading(true)
    const supabase = createClient()

    if (liked) {
      await supabase
        .from('article_likes')
        .delete()
        .eq('article_id', article.id)
        .eq('user_id', session.user.id)
      const n = Math.max(0, likeCount - 1)
      setLikeCount(n)
      await supabase.from('articles').update({ likes_count: n }).eq('id', article.id)
      setLiked(false)
    } else {
      await supabase
        .from('article_likes')
        .insert({ article_id: article.id, user_id: session.user.id })
      const n = likeCount + 1
      setLikeCount(n)
      await supabase.from('articles').update({ likes_count: n }).eq('id', article.id)
      setLiked(true)
    }
    setLikeLoading(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Comment handler — instant publish, optimistic UI update
  // ─────────────────────────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!session) { setCommentStatus('login'); return }
    if (!commentText.trim() || !article) return

    setSubmitting(true)
    const supabase = createClient()

    // [FIX 1] is_approved: true — comment is immediately live, no admin queue
    const { data: inserted, error } = await supabase
      .from('article_comments')
      .insert({
        article_id: article.id,
        user_id:    session.user.id,
        content:    commentText.trim(),
        is_approved: true,
      })
      .select('id, content, created_at, user_id')
      .single()

    setSubmitting(false)

    if (error) {
      setCommentStatus('error')
    } else {
      // [FIX 2] Optimistic update — comment appears in the list instantly
      // without waiting for a page refresh or re-fetch.
      const optimisticComment: Comment = {
        id:         inserted.id,
        content:    inserted.content,
        created_at: inserted.created_at,
        user_id:    inserted.user_id,
        profiles: {
          display_name:
            session.user.user_metadata?.display_name ||
            session.user.email?.split('@')[0] ||
            'You',
          avatar_url: session.user.user_metadata?.avatar_url || null,
        },
      }
      setComments(prev => [...prev, optimisticComment])
      setCommentText('')
      setCommentStatus('success')
    }

    setTimeout(() => setCommentStatus('idle'), 3000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })

  // ─────────────────────────────────────────────────────────────────────────
  // Loading skeleton
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-10 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-64 bg-gray-200 rounded-2xl mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 + (i * 7) % 30}%` }} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 404
  // ─────────────────────────────────────────────────────────────────────────
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-32 pb-10 text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Article Not Found</h1>
          <Link href="/insights" className="text-navy hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Insights
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const headings        = extractHeadings(article.content || '')
  const renderedContent = `<p style="margin-bottom:1rem;color:#374151;line-height:1.8">${renderMarkdown(article.content || '')}</p>`
  const pageUrl         = typeof window !== 'undefined'
    ? window.location.href
    : `https://visagate.pk/insights/${article.slug}`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════
          ARTICLE HERO — matches /consultants & /visa-categories pattern
          • pt-[calc(64px+2.5rem)] clears fixed navbar (no more mt-16)
          • White grid lines + gold corner glow always visible
          • Cover image shown at low opacity behind layers when available
          • Content centered in max-width container with badge pill
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-navy relative overflow-hidden pt-[calc(64px+2.5rem)] pb-12 px-6">

        {/* Layer 1 — cover image (when available) at low opacity */}
        {article.cover_image_url && (
          <div className="absolute inset-0">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}

        {/* Layer 2 — white grid lines at 4% opacity (same as all pages) */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Layer 3 — gold radial glow, top-right */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)',
            transform: 'translate(20%, -20%)',
          }}
        />

        {/* Layer 4 — bottom fade so content always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent pointer-events-none" />

        {/* Hero content — left aligned, full width */}
        <div className="relative max-w-5xl mx-auto">

          {/* Row 1: Back to Insights · Category pill — side by side on the left */}
          <div className="flex items-center gap-3 mb-5">
            <Link
              href="/insights"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors shrink-0"
            >
              <ArrowLeft size={14} /> Back to Insights
            </Link>
            <span className="text-white/20">·</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-gold/30 bg-gold/10">
              <span className="font-body text-xs font-semibold text-gold tracking-wide">
                {article.category}
              </span>
            </span>
          </div>

          {/* Row 2: Title — left aligned, max 2 lines, full stretch */}
          <h1 className="font-heading font-bold text-white text-2xl md:text-3xl text-4xl md:text-5xl  leading-tight mb-5 line-clamp-2">
            {article.title}
          </h1>

          {/* Row 3: Meta — left aligned */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-gold/70" />
              {article.author_name}
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-gold/70" />
              {article.read_time} min read
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5">
              <Eye size={13} className="text-gold/70" />
              {article.views} views
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5">
              <Heart size={13} className="text-gold/70" />
              {likeCount} likes
            </span>
            <span className="text-white/20">·</span>
            <span>{formatDate(article.created_at)}</span>
          </div>
        </div>
      </div>
      {/* ══════════════════════════════════════════════════════════════════ */}

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    <Tag size={10} />{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Article body */}
            <article className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mb-6">
              <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
            </article>

            {/* Like + Share bar */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all border ${
                    liked
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 border-transparent'
                  }`}
                >
                  <Heart size={16} className={liked ? 'fill-red-500' : ''} />
                  {liked ? 'Liked' : 'Like'}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    liked ? 'bg-red-100 text-red-500' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {likeCount}
                  </span>
                </button>

                <a
                  href="#comments"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-navy text-sm font-medium transition-all"
                >
                  <MessageSquare size={16} />
                  {comments.length} Comments
                </a>
              </div>

              {/* Share dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className="flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-xl hover:bg-navy/80 transition-colors text-sm font-medium"
                >
                  <Share2 size={15} /> Share
                </button>

                {shareOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-52 z-20">
                    <p className="text-xs text-gray-400 font-semibold px-2 mb-2 uppercase tracking-wider">Share via</p>

                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(pageUrl)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                      onClick={() => setShareOpen(false)}>
                      <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">𝕏</span>
                      </div>
                      Twitter / X
                    </a>

                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                      onClick={() => setShareOpen(false)}>
                      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">f</span>
                      </div>
                      Facebook
                    </a>

                    <a href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + pageUrl)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                      onClick={() => setShareOpen(false)}>
                      <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">W</span>
                      </div>
                      WhatsApp
                    </a>

                    <button
                      onClick={() => { handleCopyLink(); setShareOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                      <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {copied
                          ? <CheckCircle size={14} className="text-green-600" />
                          : <Link2 size={14} className="text-gray-600" />
                        }
                      </div>
                      {copied ? 'Link Copied!' : 'Copy Link'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Comments section ── */}
            <div id="comments" className="bg-white rounded-2xl shadow-sm p-6 md:p-8 scroll-mt-20">
              <h3 className="font-heading text-lg font-bold text-navy mb-6 flex items-center gap-2">
                <MessageSquare size={20} /> Comments ({comments.length})
              </h3>

              {/* Comment form */}
              <div className="mb-8 bg-gray-50 rounded-2xl p-4">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={session ? 'Share your thoughts...' : 'Log in to join the discussion'}
                  disabled={!session}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy resize-none disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                />

                {/* Status messages */}
                {commentStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                    <CheckCircle size={14} />
                    {/* [FIX] Removed "will appear after approval" — comments are instant now */}
                    Comment posted successfully!
                  </div>
                )}
                {commentStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                    <AlertCircle size={14} /> Something went wrong. Please try again.
                  </div>
                )}
                {commentStatus === 'login' && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                    <AlertCircle size={14} />
                    <Link href="/login" className="underline font-medium">Please log in</Link> to interact.
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  {!session && (
                    <Link
                      href="/login"
                      className="text-sm text-navy font-semibold hover:underline flex items-center gap-1"
                    >
                      <User size={14} /> Log in to comment
                    </Link>
                  )}
                  <div className="ml-auto">
                    <button
                      onClick={handleComment}
                      disabled={submitting || !commentText.trim() || !session}
                      className="flex items-center gap-2 bg-gold text-white px-5 py-2.5 rounded-xl hover:bg-gold/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={14} />
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments list */}
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-9 h-9 bg-navy rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {comment.profiles?.avatar_url ? (
                          <Image
                            src={comment.profiles.avatar_url}
                            alt="avatar"
                            width={36}
                            height={36}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {comment.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-navy">
                            {comment.profiles?.display_name || 'User'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString('en-PK', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:w-72 space-y-6 flex-shrink-0">

            {/* Table of contents */}
            {headings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-20">
                <h4 className="font-heading text-sm font-bold text-navy uppercase tracking-wider mb-3">
                  In This Article
                </h4>
                <ul className="space-y-2">
                  {headings.map(h => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="flex items-start gap-2 text-sm text-gray-600 hover:text-gold transition-colors"
                      >
                        <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h4 className="font-heading text-sm font-bold text-navy uppercase tracking-wider mb-4">Stats</h4>
              <div className="space-y-3">
                {[
                  { label: 'Views',     value: article.views,          icon: Eye },
                  { label: 'Likes',     value: likeCount,              icon: Heart },
                  { label: 'Comments',  value: comments.length,        icon: MessageSquare },
                  { label: 'Read Time', value: `${article.read_time} min`, icon: Clock },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <s.icon size={14} />{s.label}
                    </span>
                    <span className="font-semibold text-navy">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h4 className="font-heading text-sm font-bold text-navy uppercase tracking-wider mb-4">
                  Related Articles
                </h4>
                <div className="space-y-4">
                  {related.map(rel => (
                    <Link key={rel.id} href={`/insights/${rel.slug}`} className="flex gap-3 group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        {rel.cover_image_url
                          ? <Image src={rel.cover_image_url} alt={rel.title} fill className="object-cover group-hover:scale-110 transition-transform" />
                          : <div className="h-full flex items-center justify-center"><BookOpen size={16} className="text-gray-300" /></div>
                        }
                      </div>
                      <div>
                        <p className="text-xs text-gold font-medium mb-1">{rel.category}</p>
                        <p className="text-sm font-semibold text-navy group-hover:text-gold transition-colors line-clamp-2">
                          {rel.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock size={10} />{rel.read_time} min
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-navy rounded-2xl p-5 text-white">
              <h4 className="font-heading font-bold text-base mb-2">Need Visa Help?</h4>
              <p className="text-white/70 text-sm mb-4">Connect with a verified consultant.</p>
              <Link
                href="/consultants"
                className="block text-center bg-gold text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gold/90 transition-colors"
              >
                Find Consultants →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}