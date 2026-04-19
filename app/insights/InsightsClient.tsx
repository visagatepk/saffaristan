'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Search, Clock, Eye, Tag, ArrowRight,
  TrendingUp, Bookmark, Share2, ChevronRight
} from 'lucide-react'

const CATEGORIES = ['All', 'Student Visa', 'Work Permit', 'PR & Immigration', 'Visa Tips', 'Interview Tips', 'Guides', 'UK', 'Canada', 'UAE']

const CATEGORY_COLORS: Record<string, string> = {
  'Student Visa': 'bg-blue-50 text-blue-700 border-blue-200',
  'Work Permit': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'PR & Immigration': 'bg-purple-50 text-purple-700 border-purple-200',
  'Visa Tips': 'bg-orange-50 text-orange-700 border-orange-200',
  'Interview Tips': 'bg-pink-50 text-pink-700 border-pink-200',
  'Guides': 'bg-teal-50 text-teal-700 border-teal-200',
}

const COVER_GRADIENTS = [
  'from-blue-900 to-blue-700',
  'from-[#1B3060] to-blue-800',
  'from-slate-800 to-indigo-900',
  'from-indigo-900 to-blue-800',
  'from-[#1B3060] to-slate-700',
  'from-blue-950 to-indigo-800',
]

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function InsightsClient({ articles }: { articles: any[] }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const featured = articles.find(a => a.is_featured) || articles[0]
  const rest = articles.filter(a => a.id !== featured?.id)

  const filtered = useMemo(() => {
    return rest.filter(a => {
      const matchCat = activeCategory === 'All' ||
        a.category === activeCategory ||
        a.tags?.includes(activeCategory)
      const matchQ = !query ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(query.toLowerCase())
      return matchCat && matchQ
    })
  }, [rest, activeCategory, query])

  const getCategoryStyle = (cat: string) =>
    CATEGORY_COLORS[cat] || 'bg-navy-light text-navy border-navy/20'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ── */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-6">
            <TrendingUp size={13} className="text-gold" />
            <span className="font-body text-xs font-semibold text-gold tracking-wide">Visa Knowledge Hub</span>
          </div>
          <h1 className="font-heading font-extrabold text-white text-4xl lg:text-5xl mb-4 leading-tight">
            Visa Insights & Guides
          </h1>
          <p className="font-body text-white/60 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Latest visa updates, step-by-step guides, and expert advice — all in one place.
          </p>

          {/* Search */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 max-w-xl mx-auto mb-8">
            <div className="flex items-center gap-3 px-3">
              <Search size={16} className="text-white/50 shrink-0" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search guides, visa types, countries..."
                className="font-body flex-1 text-sm text-white placeholder-white/40 outline-none bg-transparent py-2.5" />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Student Visa', 'UK', 'Canada', 'Visa Updates', 'Interview Tips', 'Success Stories'].map(tag => (
              <button key={tag}
                onClick={() => setActiveCategory(tag === activeCategory ? 'All' : tag)}
                className={`font-body text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  activeCategory === tag
                    ? 'bg-gold border-gold text-white'
                    : 'border-white/20 text-white/70 hover:border-gold/50 hover:text-gold hover:bg-gold/10'
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {/* ── Featured Article ── */}
        {featured && (
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-gold" />
              <span className="font-heading font-bold text-navy text-sm">Featured Article</span>
            </div>

            <Link href={`/insights/${featured.slug}`}
              className="group grid lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5">

              {/* Image */}
              <div className={`relative h-56 lg:h-auto bg-gradient-to-br ${COVER_GRADIENTS[0]} overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-6 right-6 w-28 h-28 rounded-full border-2 border-white" />
                  <div className="absolute bottom-6 left-6 w-20 h-20 rounded-full border border-white" />
                </div>
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-xs text-white bg-gold px-2.5 py-1 rounded-full flex items-center gap-1">
                      🔥 Trending
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <span className={`inline-block font-body text-xs font-semibold px-3 py-1 rounded-full border mb-4 w-fit ${getCategoryStyle(featured.category)}`}>
                  {featured.category}
                </span>
                <h2 className="font-heading font-bold text-navy text-2xl lg:text-3xl leading-snug mb-4 group-hover:text-gold transition-colors duration-200">
                  {featured.title}
                </h2>
                <p className="font-body text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-body text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-navy rounded-full flex items-center justify-center text-white font-heading font-bold text-xs shrink-0">
                        {featured.author_name?.[0] || 'V'}
                      </div>
                      {featured.author_name}
                    </span>
                    <span className="flex items-center gap-1"><Clock size={12} />{featured.read_time} min read</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{featured.views?.toLocaleString()}</span>
                  </div>
                  <span className="font-heading font-bold text-sm text-navy group-hover:text-gold transition-colors flex items-center gap-1">
                    Read Guide <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── Filter bar ── */}
        <div className="sticky top-[68px] z-20 bg-gray-50 py-3 mb-8 -mx-6 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`font-heading font-semibold text-xs px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 shrink-0 ${
                  activeCategory === cat
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-navy/30 hover:text-navy'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Articles Grid ── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <p className="font-body text-sm text-gray-500">
              <span className="font-semibold text-navy">{filtered.length}</span> articles
              {activeCategory !== 'All' && <> in <span className="font-semibold text-navy">{activeCategory}</span></>}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((article, i) => (
                <Link key={article.id} href={`/insights/${article.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col">

                  {/* Thumbnail */}
                  <div className={`h-44 bg-gradient-to-br ${COVER_GRADIENTS[i % COVER_GRADIENTS.length]} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-3 right-3 w-16 h-16 rounded-full border border-white" />
                      <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full border border-white" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoryStyle(article.category)}`}>
                        {article.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                        <Bookmark size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading font-bold text-navy text-base leading-snug mb-2.5 line-clamp-2 group-hover:text-gold transition-colors duration-200">
                      {article.title}
                    </h3>
                    <p className="font-body text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
                      {article.excerpt}
                    </p>

                    {/* Tags */}
                    {article.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {article.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="font-body text-xs bg-gray-50 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs font-body text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={11} />{article.read_time}m</span>
                        <span className="flex items-center gap-1"><Eye size={11} />{article.views?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-body text-gray-400">
                        <span>{timeAgo(article.published_at)}</span>
                        <Share2 size={12} className="hover:text-navy cursor-pointer transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Search size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="font-heading font-bold text-navy text-base mb-1">No articles found</p>
              <p className="font-body text-gray-400 text-sm">Try a different search or category</p>
              <button onClick={() => { setQuery(''); setActiveCategory('All') }}
                className="mt-4 font-heading font-semibold text-sm text-navy border border-navy px-5 py-2 rounded-xl hover:bg-navy hover:text-white transition-colors">
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* ── Newsletter ── */}
        <div className="bg-navy rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-5">
              <span className="font-body text-xs font-semibold text-gold">Stay Updated</span>
            </div>
            <h3 className="font-heading font-bold text-white text-2xl lg:text-3xl mb-3">
              Get Visa Updates in Your Inbox
            </h3>
            <p className="font-body text-white/50 text-sm mb-8">
              No spam. Only useful updates, guides & visa news.
            </p>
            {subscribed ? (
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-400 font-heading font-semibold text-sm px-6 py-3 rounded-xl">
                ✓ You're subscribed! Welcome aboard.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="font-body flex-1 px-5 py-3 rounded-xl text-sm text-gray-700 outline-none border-0 focus:ring-2 focus:ring-gold/30" />
                <button
                  onClick={() => { if (email) setSubscribed(true) }}
                  className="font-heading font-bold text-sm text-white px-7 py-3 rounded-xl transition-all duration-200 hover:opacity-90 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}