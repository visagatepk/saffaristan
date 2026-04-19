'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Clock, Eye, Share2, MessageSquare,
  ThumbsUp, ChevronRight, Copy, CheckCircle,
  Phone, BookOpen, Tag, Link2
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

const COVER_GRADIENTS = [
  'from-blue-900 to-blue-700',
  'from-[#1B3060] to-blue-800',
  'from-slate-800 to-indigo-900',
]

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`
  return new Date(dateStr).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Sample article content ──
const SAMPLE_CONTENT = `
## Introduction

Applying for a UK student visa can feel overwhelming, but with the right preparation, the process is straightforward. This guide covers everything Pakistani students need to know for 2026.

## Who Needs a UK Student Visa?

All Pakistani nationals studying in the UK for more than 6 months require a Student visa (formerly Tier 4). This includes university courses, foundation programs, and postgraduate studies.

## Key Requirements

Before applying, ensure you have:

- **Confirmation of Acceptance for Studies (CAS)** from your UK university
- **English language test results** (IELTS, TOEFL, or equivalent)
- **Proof of funds** — bank statements showing sufficient funds
- **Valid passport** with at least 6 months validity beyond your course end date

> **Tip:** Apply at least 3 months before your course start date. Processing can take 3–8 weeks.

## Step-by-Step Application Process

**Step 1:** Receive your CAS number from your university

**Step 2:** Create a UKVI account and complete the online application

**Step 3:** Pay the visa application fee (£490 for students outside the UK)

**Step 4:** Pay the Immigration Health Surcharge

**Step 5:** Book and attend your biometrics appointment

**Step 6:** Submit supporting documents

**Step 7:** Wait for a decision (typically 3 weeks)

## Financial Requirements

You must show you can cover:
- Your course fees for the first year
- Living costs: £1,334 per month (London) or £1,023 per month (outside London)
- These funds must be held in your account for 28 consecutive days

## Common Rejection Reasons

1. Insufficient funds or funds not held for 28 days
2. Unclear study intentions
3. Weak ties to home country
4. Incomplete documentation
5. Previous visa refusals not declared

> **Warning:** Never provide false information. It results in an automatic ban.

## Tips for a Strong Application

- Write a clear personal statement explaining your study plans
- Show strong ties to Pakistan (family, property, job offer after studies)
- Have all documents translated by a certified translator
- Double-check every detail before submission
`

export default function ArticleClient({
  article,
  comments: initialComments,
  related,
}: {
  article: any
  comments: any[]
  related: any[]
}) {
  const [readProgress, setReadProgress] = useState(0)
  const [comments, setComments] = useState(initialComments)
  const [commentText, setCommentText] = useState('')
  const [commenterName, setCommenterName] = useState('')
  const [commenterCity, setCommenterCity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [likedComments, setLikedComments] = useState<string[]>([])
  const articleRef = useRef<HTMLDivElement>(null)

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const el = articleRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      setReadProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !commenterName.trim()) return
    setSubmitting(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('article_comments')
      .insert({
        article_id: article.id,
        commenter_name: commenterName,
        commenter_city: commenterCity,
        content: commentText,
      })
      .select()
      .single()

    if (!error && data) {
      setComments(prev => [data, ...prev])
      setCommentText('')
    }
    setSubmitting(false)
  }

  const handleLike = (id: string) => {
    setLikedComments(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const content = article.content || SAMPLE_CONTENT

  // Parse simple markdown-ish content
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="font-heading font-bold text-navy text-2xl mt-10 mb-4">{line.slice(3)}</h2>
      if (line.startsWith('> **Warning:**')) return (
        <div key={i} className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-4 my-5">
          <p className="font-body text-red-700 text-sm leading-relaxed">{line.slice(2)}</p>
        </div>
      )
      if (line.startsWith('> **Tip:**')) return (
        <div key={i} className="bg-gold-light border-l-4 border-gold rounded-r-xl p-4 my-5">
          <p className="font-body text-amber-800 text-sm leading-relaxed">{line.slice(2)}</p>
        </div>
      )
      if (line.startsWith('> ')) return (
        <div key={i} className="bg-navy-light border-l-4 border-navy rounded-r-xl p-4 my-5">
          <p className="font-body text-navy text-sm leading-relaxed">{line.slice(2)}</p>
        </div>
      )
      if (line.startsWith('**Step')) {
        const [step, ...rest] = line.split(':')
        return (
          <div key={i} className="flex items-start gap-3 my-3">
            <span className="font-heading font-bold text-xs text-white bg-navy px-2.5 py-1 rounded-full shrink-0 mt-0.5">{step.replace(/\*\*/g, '')}</span>
            <p className="font-body text-gray-600 text-sm leading-relaxed">{rest.join(':').replace(/\*\*/g, '').trim()}</p>
          </div>
        )
      }
      if (line.match(/^\d\./)) return <li key={i} className="font-body text-gray-600 text-sm leading-relaxed ml-4 mb-1 list-decimal">{line.slice(2).replace(/\*\*/g, '')}</li>
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*(.*)/)
        if (match) return <li key={i} className="font-body text-gray-600 text-sm leading-relaxed ml-4 mb-1 list-disc"><strong className="text-navy">{match[1]}</strong>{match[2]}</li>
      }
      if (line.startsWith('- ')) return <li key={i} className="font-body text-gray-600 text-sm leading-relaxed ml-4 mb-1 list-disc">{line.slice(2)}</li>
      if (line.trim() === '') return <div key={i} className="h-2" />
      return <p key={i} className="font-body text-gray-600 text-base leading-relaxed mb-3">{line.replace(/\*\*(.*?)\*\*/g, '**$1**')}</p>
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-gray-200">
        <div className="h-full bg-gold transition-all duration-100"
          style={{ width: `${readProgress}%` }} />
      </div>

      <Navbar />

      {/* ── Article Hero ── */}
      <div className={`bg-gradient-to-br ${COVER_GRADIENTS[0]} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 right-12 w-32 h-32 rounded-full border-2 border-white" />
          <div className="absolute bottom-6 left-12 w-20 h-20 rounded-full border border-white" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-body text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/insights" className="hover:text-white transition-colors">Insights</Link>
            <ChevronRight size={12} />
            <span className="text-white/80 line-clamp-1">{article.title}</span>
          </div>

          {/* Category + read time */}
          <div className="flex items-center gap-3 mb-5">
            <span className="font-body text-xs font-semibold bg-gold/20 border border-gold/30 text-gold px-3 py-1 rounded-full">
              {article.category}
            </span>
            <span className="font-body text-xs text-white/50 flex items-center gap-1">
              <Clock size={12} /> {article.read_time} min read
            </span>
            <span className="font-body text-xs text-white/50 flex items-center gap-1">
              <Eye size={12} /> {article.views?.toLocaleString()} views
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl leading-tight mb-6">
            {article.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center text-white font-heading font-bold text-sm">
              {article.author_name?.[0] || 'V'}
            </div>
            <div>
              <p className="font-heading font-semibold text-white text-sm">{article.author_name}</p>
              <p className="font-body text-white/50 text-xs">{timeAgo(article.published_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── Social Share Sidebar (desktop) ── */}
          <div className="hidden lg:flex flex-col items-center gap-3 sticky top-24 h-fit">
            <p className="font-body text-xs text-gray-400 rotate-[-90deg] whitespace-nowrap mb-2">Share</p>
         {[
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
    label: 'WhatsApp', color: '#25D366',
    href: `https://wa.me/?text=${encodeURIComponent(article.title)}`
  },
  { icon: <Share2 size={16} />, label: 'Facebook', color: '#1877F2', href: '#' },
  { icon: <Link2 size={16} />, label: 'Twitter', color: '#1DA1F2', href: '#' },
  { icon: <MessageSquare size={16} />, label: 'LinkedIn', color: '#0A66C2', href: '#' },
].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                className="group w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-white hover:border-transparent transition-all duration-200"
                style={{ '--hover-bg': s.color } as any}
                onMouseEnter={e => (e.currentTarget.style.background = s.color)}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                {s.icon}
              </a>
            ))}
            <button onClick={handleCopyLink} title="Copy link"
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-navy hover:text-navy transition-all duration-200">
              {copied ? <CheckCircle size={15} className="text-green-500" /> : <Copy size={15} />}
            </button>
          </div>

          {/* ── Article Content ── */}
          <div className="flex-1 min-w-0 max-w-3xl" ref={articleRef}>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="bg-navy-light border-l-4 border-navy rounded-r-2xl p-5 mb-8">
                <p className="font-body text-navy text-base leading-relaxed font-medium">{article.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div className="prose-custom mb-10">
              {renderContent(content)}
            </div>

            {/* Tags */}
            {article.tags && (
              <div className="flex flex-wrap gap-2 mb-10 pt-6 border-t border-gray-100">
                <span className="font-body text-xs text-gray-400 flex items-center gap-1"><Link2 size={12} /> Tags:</span>
                {article.tags.map((tag: string) => (
                  <Link key={tag} href={`/insights?category=${tag}`}
                    className="font-body text-xs bg-gray-50 border border-gray-200 text-gray-500 hover:border-navy hover:text-navy px-3 py-1 rounded-full transition-colors">
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Inline CTA */}
            <div className="bg-navy rounded-2xl p-6 mb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-heading font-bold text-white text-base mb-1">
                    Ready to start your visa journey?
                  </p>
                  <p className="font-body text-white/60 text-sm">
                    Find verified consultants specialized in {article.category}
                  </p>
                </div>
                <Link href="/consultants"
                  className="font-heading font-bold text-sm text-white px-6 py-3 rounded-xl transition-all duration-200 hover:opacity-90 shrink-0 whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                  Find Consultants →
                </Link>
              </div>
            </div>

            {/* Author bio */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center text-white font-heading font-bold text-xl shrink-0">
                {article.author_name?.[0] || 'V'}
              </div>
              <div>
                <p className="font-heading font-bold text-navy text-base mb-1">{article.author_name}</p>
                <p className="font-body text-xs text-gold font-semibold mb-2">VisaGate.pk Expert</p>
                <p className="font-body text-gray-500 text-sm leading-relaxed">
                  Experienced immigration advisor with deep knowledge of Pakistani visa applications, overseas education, and work permit processes.
                </p>
              </div>
            </div>

            {/* Mobile share */}
            <div className="flex items-center gap-2 mb-10 lg:hidden">
              <span className="font-body text-xs text-gray-400">Share:</span>
              {['WhatsApp', 'Facebook', 'Copy Link'].map(s => (
                <button key={s} onClick={s === 'Copy Link' ? handleCopyLink : undefined}
                  className="font-body text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-navy hover:text-navy transition-colors">
                  {s}
                </button>
              ))}
            </div>

            {/* ── Comments ── */}
            <div id="comments">
              <h3 className="font-heading font-bold text-navy text-xl mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-navy" />
                Comments ({comments.length})
              </h3>

              {/* Add comment */}
              <form onSubmit={handleComment} className="bg-gray-50 rounded-2xl p-5 mb-8">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">Name *</label>
                    <input type="text" value={commenterName} onChange={e => setCommenterName(e.target.value)}
                      placeholder="Muhammad Ali" required
                      className="font-body w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all" />
                  </div>
                  <div>
                    <label className="font-body text-xs font-medium text-gray-700 block mb-1.5">City</label>
                    <input type="text" value={commenterCity} onChange={e => setCommenterCity(e.target.value)}
                      placeholder="Lahore"
                      className="font-body w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all" />
                  </div>
                </div>
                <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your experience or ask a question…"
                  rows={3} required
                  className="font-body w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all resize-none mb-3" />
                <button type="submit" disabled={submitting}
                  className="font-heading font-bold text-sm text-white px-6 py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                  {submitting ? 'Posting...' : '💬 Post Comment'}
                </button>
              </form>

              {/* Comment list */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(c => (
                    <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-navy-light flex items-center justify-center text-navy font-heading font-bold text-sm shrink-0">
                          {c.commenter_name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-heading font-bold text-navy text-sm">{c.commenter_name}</p>
                            {c.commenter_city && (
                              <span className="font-body text-xs text-gray-400">{c.commenter_city}</span>
                            )}
                            <span className="font-body text-xs text-gray-300 ml-auto">{timeAgo(c.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-body text-gray-600 text-sm leading-relaxed mb-3">{c.content}</p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleLike(c.id)}
                          className={`flex items-center gap-1.5 font-body text-xs transition-colors ${likedComments.includes(c.id) ? 'text-navy font-semibold' : 'text-gray-400 hover:text-navy'}`}>
                          <ThumbsUp size={12} className={likedComments.includes(c.id) ? 'fill-navy' : ''} />
                          {(c.likes || 0) + (likedComments.includes(c.id) ? 1 : 0)} Helpful
                        </button>
                        <button className="font-body text-xs text-gray-400 hover:text-navy transition-colors">Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl">
                  <MessageSquare size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="font-body text-gray-400 text-sm">Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-5">

              {/* Table of contents */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h4 className="font-heading font-bold text-navy text-sm mb-4 flex items-center gap-2">
                  <BookOpen size={15} className="text-gold" /> In This Article
                </h4>
                <div className="space-y-2">
                  {['Introduction', 'Who Needs a Visa?', 'Key Requirements', 'Application Process', 'Financial Requirements', 'Common Mistakes', 'Tips for Success'].map((item, i) => (
                    <div key={item} className="flex items-center gap-2 cursor-pointer group">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gold transition-colors shrink-0" />
                      <span className="font-body text-xs text-gray-500 group-hover:text-navy transition-colors leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultant CTA */}
              <div className="bg-navy rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
                <div className="relative">
                  <p className="font-heading font-bold text-white text-sm mb-2">
                    Need Expert Help?
                  </p>
                  <p className="font-body text-white/60 text-xs leading-relaxed mb-4">
                    Connect with verified visa consultants for personalized guidance.
                  </p>
                  <Link href="/consultants"
                    className="w-full flex items-center justify-center gap-2 font-heading font-bold text-sm text-white py-2.5 rounded-xl transition-all duration-200 hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                    <Phone size={14} /> Find Consultants
                  </Link>
                </div>
              </div>

              {/* Related articles */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h4 className="font-heading font-bold text-navy text-sm mb-4">Related Articles</h4>
                  <div className="space-y-3">
                    {related.map(r => (
                      <Link key={r.id} href={`/insights/${r.slug}`}
                        className="block group">
                        <p className="font-body text-sm text-gray-700 group-hover:text-navy leading-snug mb-1 line-clamp-2 transition-colors">
                          {r.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={10} />{r.read_time}m</span>
                          <span className="flex items-center gap-1"><Eye size={10} />{r.views?.toLocaleString()}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share box */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h4 className="font-heading font-bold text-navy text-sm mb-3">Share This</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'WhatsApp', color: '#25D366' },
                    { label: 'Facebook', color: '#1877F2' },
                    { label: 'LinkedIn', color: '#0A66C2' },
                  ].map(s => (
                    <button key={s.label}
                      className="font-body text-xs font-semibold py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-white transition-all duration-200"
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = s.color; (e.currentTarget as HTMLButtonElement).style.borderColor = s.color }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleCopyLink}
                  className="w-full mt-2 font-body text-xs font-semibold py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-navy hover:text-navy transition-all duration-200 flex items-center justify-center gap-2">
                  {copied ? <><CheckCircle size={12} className="text-green-500" /> Copied!</> : <><Copy size={12} /> Copy Link</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}