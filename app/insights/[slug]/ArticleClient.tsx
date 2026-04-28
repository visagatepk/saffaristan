'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Clock, Eye, Tag, ArrowLeft, Share2, MessageSquare,
  ChevronRight, User, Send, CheckCircle, AlertCircle
} from 'lucide-react'

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
  created_at: string
  updated_at: string
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

// Simple markdown renderer
function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-[#1B3060] mt-8 mb-3 font-[\'Plus_Jakarta_Sans\']">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 id="$1" class="text-2xl font-bold text-[#1B3060] mt-10 mb-4 font-[\'Plus_Jakarta_Sans\'] scroll-mt-20">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-[#1B3060] mt-10 mb-4 font-[\'Plus_Jakarta_Sans\']">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#1B3060]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-[#1B3060] px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^\> (.+)$/gm, '<blockquote class="border-l-4 border-[#C9A227] pl-4 py-1 my-4 text-gray-600 italic bg-amber-50 rounded-r-lg">$1</blockquote>')
    .replace(/^\- (.+)$/gm, '<li class="flex items-start gap-2 mb-1"><span class="text-[#C9A227] mt-1.5 flex-shrink-0">•</span><span>$1</span></li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li class="mb-1 ml-4 list-decimal">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#1B3060] font-medium underline hover:text-[#C9A227]" target="_blank">$1</a>')
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
    .replace(/^(?!<[h|u|b|l|a])/gm, '')
}

function extractHeadings(content: string): { id: string; text: string }[] {
  const matches = [...content.matchAll(/^## (.+)$/gm)]
  return matches.map(m => ({ id: m[1], text: m[1] }))
}

export default function ArticleClient() {
  const params = useParams()
  const slug = params?.slug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<RelatedArticle[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentStatus, setCommentStatus] = useState<'idle' | 'success' | 'error' | 'login'>('idle')
  const [session, setSession] = useState<any>(null)

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

      // Increment view count
      await supabase.from('articles').update({ views: (art.views || 0) + 1 }).eq('id', art.id)

      // Related articles (same category)
      const { data: rel } = await supabase
        .from('articles')
        .select('id, title, slug, cover_image_url, category, read_time')
        .eq('is_published', true)
        .eq('category', art.category)
        .neq('id', art.id)
        .limit(3)
      setRelated((rel || []) as RelatedArticle[])

      // Comments (approved only)
      const { data: comms } = await supabase
        .from('article_comments')
        .select('id, content, created_at, user_id, profiles(display_name, avatar_url)')
        .eq('article_id', art.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: true })
      setComments((comms || []) as unknown as Comment[])

      setLoading(false)
    }
    init()
  }, [slug])

  const handleComment = async () => {
    if (!session) { setCommentStatus('login'); return }
    if (!commentText.trim() || !article) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('article_comments').insert({
      article_id: article.id,
      user_id: session.user.id,
      content: commentText.trim(),
      is_approved: false,
    })
    setSubmitting(false)
    if (error) { setCommentStatus('error') }
    else { setCommentStatus('success'); setCommentText('') }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied!')
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-10 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-64 bg-gray-200 rounded-2xl mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />)}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-32 pb-10 text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Article Not Found</h1>
          <Link href="/insights" className="text-[#1B3060] hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Insights
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const headings = extractHeadings(article.content || '')
  const renderedContent = `<p class="text-gray-700 leading-relaxed mb-4">${renderMarkdown(article.content || '')}</p>`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Cover Image */}
      <div className="relative h-72 md:h-[440px] bg-[#1B3060] mt-16">
        {article.cover_image_url ? (
          <Image src={article.cover_image_url} alt={article.title} fill className="object-cover opacity-60" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 pb-8">
          <Link href="/insights" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to Insights
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#C9A227] text-white text-xs font-bold px-3 py-1 rounded-full">{article.category}</span>
          </div>
          <h1 className="text-white text-2xl md:text-4xl font-bold font-['Plus_Jakarta_Sans'] leading-tight mb-3">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1"><User size={13} />{article.author_name}</span>
            <span className="flex items-center gap-1"><Clock size={13} />{article.read_time} min read</span>
            <span className="flex items-center gap-1"><Eye size={13} />{article.views} views</span>
            <span>{formatDate(article.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main Content */}
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

            {/* Article Body */}
            <article className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mb-8">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </article>

            {/* Share Button */}
            <div className="flex items-center gap-4 mb-10">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-[#1B3060] text-white px-5 py-2.5 rounded-xl hover:bg-[#243d7a] transition-colors text-sm font-medium"
              >
                <Share2 size={15} /> Share Article
              </button>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-bold text-[#1B3060] font-['Plus_Jakarta_Sans'] mb-6 flex items-center gap-2">
                <MessageSquare size={20} /> Comments ({comments.length})
              </h3>

              {/* Comment Form */}
              <div className="mb-8">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={session ? "Share your thoughts..." : "Please log in to comment"}
                  disabled={!session}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060] resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                />

                {commentStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                    <CheckCircle size={14} /> Comment submitted! It will appear after approval.
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
                    <Link href="/login" className="underline">Please log in</Link> to post a comment.
                  </div>
                )}

                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleComment}
                    disabled={submitting || !commentText.trim()}
                    className="flex items-center gap-2 bg-[#C9A227] text-white px-5 py-2.5 rounded-xl hover:bg-[#b8911f] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={14} /> {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 bg-[#1B3060] rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.profiles?.avatar_url ? (
                          <Image src={comment.profiles.avatar_url} alt="avatar" width={36} height={36} className="rounded-full object-cover" />
                        ) : (
                          <User size={16} className="text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#1B3060]">
                            {comment.profiles?.display_name || 'User'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
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

          {/* Sidebar */}
          <div className="lg:w-72 space-y-6 flex-shrink-0">

            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-20">
                <h4 className="text-sm font-bold text-[#1B3060] uppercase tracking-wider mb-3">In This Article</h4>
                <ul className="space-y-2">
                  {headings.map(h => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="flex items-start gap-2 text-sm text-gray-600 hover:text-[#C9A227] transition-colors">
                        <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Articles */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h4 className="text-sm font-bold text-[#1B3060] uppercase tracking-wider mb-4">Related Articles</h4>
                <div className="space-y-4">
                  {related.map(rel => (
                    <Link key={rel.id} href={`/insights/${rel.slug}`} className="flex gap-3 group">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {rel.cover_image_url ? (
                          <Image src={rel.cover_image_url} alt={rel.title} fill className="object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <div className="h-full bg-[#1B3060]/10 flex items-center justify-center">
                            <MessageSquare size={16} className="text-[#1B3060]/30" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#C9A227] font-medium mb-1">{rel.category}</p>
                        <p className="text-sm font-semibold text-[#1B3060] group-hover:text-[#C9A227] transition-colors leading-snug line-clamp-2">
                          {rel.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={10} />{rel.read_time} min</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Find a Consultant CTA */}
            <div className="bg-[#1B3060] rounded-2xl p-5 text-white">
              <h4 className="font-bold text-base mb-2 font-['Plus_Jakarta_Sans']">Need Visa Help?</h4>
              <p className="text-white/70 text-sm mb-4">Connect with a verified consultant who specializes in your destination.</p>
              <Link href="/consultants" className="block text-center bg-[#C9A227] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#b8911f] transition-colors">
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