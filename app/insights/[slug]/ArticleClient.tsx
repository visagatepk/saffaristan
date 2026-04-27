'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Eye, ArrowLeft, Tag, Share2, MessageSquare, Send, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

const CATEGORY_COLORS: Record<string, string> = {
  'Visa Tips': 'bg-blue-100 text-blue-700',
  'Country Guides': 'bg-green-100 text-green-700',
  'Immigration News': 'bg-red-100 text-red-700',
  'Success Stories': 'bg-purple-100 text-purple-700',
  'Consultant Advice': 'bg-orange-100 text-orange-700',
  'Policy Updates': 'bg-teal-100 text-teal-700',
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  category: string
  tags: string[]
  author_name: string
  author_avatar: string | null
  read_time: number
  views: number
  is_featured: boolean
  published_at: string
  created_at: string
}

interface Comment {
  id: string
  commenter_name: string
  commenter_city: string
  content: string
  created_at: string
}

interface RelatedArticle {
  id: string
  title: string
  slug: string
  cover_image: string | null
  category: string
  read_time: number
  created_at: string
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1rem;font-weight:700;color:#1B3060;margin:1.5rem 0 0.5rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.35rem;font-weight:800;color:#1B3060;margin:2rem 0 0.75rem">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.6rem;font-weight:800;color:#1B3060;margin:2rem 0 0.75rem">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:#111827">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#F3F4F6;color:#1B3060;padding:2px 6px;border-radius:4px;font-size:0.85em;font-family:monospace">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:4px solid #C9A227;padding:0.75rem 1rem;margin:1.5rem 0;background:#FFFBEB;color:#6B7280;font-style:italic;border-radius:0 8px 8px 0">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li style="margin:0.35rem 0;padding-left:0.5rem;color:#374151">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#1B3060;text-decoration:underline;font-weight:500" target="_blank">$1</a>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="list-style:disc;padding-left:1.5rem;margin:1rem 0">$&</ul>')
    .replace(/\n\n/g, '</p><p style="color:#374151;line-height:1.85;margin-bottom:1.25rem">')
    .replace(/\n/g, '<br/>')
}

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const supabase = createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [related, setRelated] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [commentForm, setCommentForm] = useState({ name: '', city: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      const { data: art } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (!art) { router.push('/insights'); return }
      setArticle(art)

      // Increment view count
      await supabase.from('articles').update({ views: (art.views || 0) + 1 }).eq('id', art.id)

      // Load approved comments
      const { data: comms } = await supabase
        .from('article_comments')
        .select('id, commenter_name, commenter_city, content, created_at')
        .eq('article_id', art.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
      setComments(comms || [])

      // Load related articles
      const { data: rel } = await supabase
        .from('articles')
        .select('id, title, slug, cover_image, category, read_time, created_at')
        .eq('is_published', true)
        .eq('category', art.category)
        .neq('id', art.id)
        .limit(3)
      setRelated(rel || [])

      setLoading(false)
    }
    load()
  }, [slug])

  const handleComment = async () => {
    if (!commentForm.name.trim() || !commentForm.content.trim()) return
    if (!session) return
    setSubmitting(true)
    const { error } = await supabase.from('article_comments').insert({
      article_id: article!.id,
      user_id: session.user.id,
      commenter_name: commentForm.name.trim(),
      commenter_city: commentForm.city.trim(),
      content: commentForm.content.trim(),
      is_approved: true,
    })
    if (!error) {
      setSubmitted(true)
      setCommentForm({ name: '', city: '', content: '' })
      const { data: comms } = await supabase
        .from('article_comments')
        .select('id, commenter_name, commenter_city, content, created_at')
        .eq('article_id', article!.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
      setComments(comms || [])
    }
    setSubmitting(false)
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded-full" />
          <div className="h-8 w-full bg-gray-200 rounded-full" />
          <div className="h-6 w-2/3 bg-gray-200 rounded-full" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={`h-4 bg-gray-100 rounded-full ${i % 3 === 0 ? 'w-3/4' : 'w-full'}`} />)}
          </div>
        </div>
      </div>
    )
  }

  if (!article) return null

  const coverSrc = article.cover_image ? `${supabaseUrl}/storage/v1/object/public/articles/${article.cover_image}` : null

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <Navbar />

      {/* Cover Image */}
      {coverSrc && (
        <div className="w-full h-72 lg:h-96 overflow-hidden">
          <img src={coverSrc} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-10">

        {/* Article */}
        <article className="flex-1 min-w-0">

          {/* Back */}
          <Link href="/insights" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1B3060] mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Insights
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-600'}`}>
              {article.category}
            </span>
            {article.is_featured && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#C9A227]/15 text-[#C9A227]">Featured</span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading font-extrabold text-[#1B3060] text-2xl lg:text-3xl xl:text-4xl leading-tight mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-gray-500 text-base leading-relaxed mb-6 border-l-4 border-[#C9A227] pl-4 bg-[#C9A227]/5 py-3 rounded-r-xl">
              {article.excerpt}
            </p>
          )}

          {/* Author + Meta row */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-200 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1B3060] flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {article.author_name?.charAt(0) || 'V'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{article.author_name}</p>
                <p className="text-xs text-gray-400">{formatDate(article.published_at || article.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 ml-auto">
              <span className="flex items-center gap-1"><Clock size={12} /> {article.read_time || 1} min read</span>
              <span className="flex items-center gap-1"><Eye size={12} /> {((article.views || 0) + 1).toLocaleString()} views</span>
              <span className="flex items-center gap-1"><MessageSquare size={12} /> {comments.length} comments</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose-content mb-8">
            <div
              style={{ color: '#374151', lineHeight: '1.85', fontSize: '1rem' }}
              dangerouslySetInnerHTML={{
                __html: '<p style="color:#374151;line-height:1.85;margin-bottom:1.25rem">' + renderMarkdown(article.content || '') + '</p>'
              }}
            />
          </div>

          {/* Tags */}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-8 pb-8 border-b border-gray-200">
              <Tag size={14} className="text-gray-400" />
              {article.tags.map(tag => (
                <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-[#1B3060]/10 hover:text-[#1B3060] transition cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="bg-[#1B3060]/5 rounded-2xl p-5 flex items-center justify-between mb-8 border border-[#1B3060]/10">
            <div>
              <p className="font-bold text-[#1B3060] text-sm">Found this helpful?</p>
              <p className="text-xs text-gray-500 mt-0.5">Share it with someone planning a visa application</p>
            </div>
            <button
              onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
              className="flex items-center gap-2 bg-[#1B3060] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#162550] transition">
              <Share2 size={14} /> Share
            </button>
          </div>

          {/* Comments Section */}
          <div id="comments">
            <h2 className="font-heading font-bold text-[#1B3060] text-xl mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            {session ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">Leave a Comment</h3>
                {submitted && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-700 font-medium">
                    Your comment has been posted successfully!
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Your Name *</label>
                    <input
                      value={commentForm.name}
                      onChange={e => setCommentForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ahmad Hassan"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1B3060]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">City</label>
                    <input
                      value={commentForm.city}
                      onChange={e => setCommentForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="Islamabad"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1B3060]/20"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Comment *</label>
                  <textarea
                    value={commentForm.content}
                    onChange={e => setCommentForm(p => ({ ...p, content: e.target.value }))}
                    rows={3}
                    placeholder="Share your thoughts or questions..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1B3060]/20 resize-none"
                  />
                </div>
                <button
                  onClick={handleComment}
                  disabled={submitting || !commentForm.name.trim() || !commentForm.content.trim()}
                  className="flex items-center gap-2 bg-[#1B3060] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#162550] transition disabled:opacity-50">
                  <Send size={14} />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6 text-center">
                <p className="text-sm text-gray-500 mb-3">Please log in to leave a comment</p>
                <Link href="/login" className="inline-flex items-center gap-1.5 bg-[#1B3060] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#162550] transition">
                  Log In to Comment
                </Link>
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                <MessageSquare size={30} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1B3060]/10 flex items-center justify-center shrink-0">
                        <span className="text-[#1B3060] text-xs font-bold">{comment.commenter_name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">{comment.commenter_name}</span>
                          {comment.commenter_city && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{comment.commenter_city}</span>
                          )}
                          <span className="text-xs text-gray-400 ml-auto">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0 space-y-5">

          {/* Table of Contents (auto-generated from H2s) */}
          {article.content.includes('## ') && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
              <h3 className="font-bold text-[#1B3060] text-sm mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                In This Article
              </h3>
              <div className="space-y-2">
                {article.content.split('\n')
                  .filter(line => line.startsWith('## '))
                  .map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600 hover:text-[#1B3060] cursor-pointer transition-colors">
                      <ChevronRight size={12} className="text-[#C9A227] mt-0.5 shrink-0" />
                      {line.replace('## ', '')}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-[#1B3060] text-sm mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Related Articles
              </h3>
              <div className="space-y-4">
                {related.map(rel => {
                  const relSrc = rel.cover_image ? `${supabaseUrl}/storage/v1/object/public/articles/${rel.cover_image}` : null
                  return (
                    <Link key={rel.id} href={`/insights/${rel.slug}`} className="group flex gap-3 items-start">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#1B3060]/10 shrink-0">
                        {relSrc ? <img src={relSrc} alt={rel.title} className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1B3060] to-blue-800" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#1B3060] transition-colors">{rel.title}</p>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={9} /> {rel.read_time || 1} min read</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-[#1B3060] rounded-2xl p-5 text-center">
            <p className="font-bold text-white text-sm mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Need Visa Help?
            </p>
            <p className="text-white/60 text-xs mb-4">Connect with a verified consultant today</p>
            <Link href="/consultants"
              className="block bg-[#C9A227] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#b8901f] transition">
              Find a Consultant
            </Link>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  )
}
