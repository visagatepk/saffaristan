'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Clock, Eye, Tag, ChevronRight, BookOpen, Newspaper } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  category: string | null
  tags: string[] | null
  author_name: string | null
  read_time: number | null
  views: number | null
  is_featured: boolean | null
  created_at: string
}

interface Props {
  initialArticles: Article[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'All', 'Visa Tips', 'Country Guides',
  'Immigration News', 'Success Stories', 'Consultants', 'General',
]

const CATEGORY_COLORS: Record<string, string> = {
  'Visa Tips':        'bg-blue-100 text-blue-700',
  'Country Guides':   'bg-green-100 text-green-700',
  'Immigration News': 'bg-orange-100 text-orange-700',
  'Success Stories':  'bg-purple-100 text-purple-700',
  'Consultants':      'bg-teal-100 text-teal-700',
  'General':          'bg-gray-100 text-gray-700',
}

// [INS-02] Category-specific gradient backgrounds for cards with no cover image
const CATEGORY_GRADIENTS: Record<string, string> = {
  'Visa Tips':        'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
  'Country Guides':   'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
  'Immigration News': 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
  'Success Stories':  'linear-gradient(135deg, #4a1d96 0%, #7c3aed 100%)',
  'Consultants':      'linear-gradient(135deg, #134e4a 0%, #0d9488 100%)',
  'General':          'linear-gradient(135deg, #1B3060 0%, #2d5bb5 100%)',
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function InsightsClient({ initialArticles }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')

  // ── [INS-06] Per-category article counts for filter pill badges ────────────
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: initialArticles.length }
    for (const article of initialArticles) {
      if (article.category) {
        counts[article.category] = (counts[article.category] || 0) + 1
      }
    }
    return counts
  }, [initialArticles])

  // ── Featured article ───────────────────────────────────────────────────────
  const featured = useMemo(
    () => initialArticles.find(a => a.is_featured) || null,
    [initialArticles],
  )

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    initialArticles.filter(a =>
      activeCategory === 'All' || a.category === activeCategory
    ),
  [initialArticles, activeCategory])

  const displayArticles = featured
    ? filtered.filter(a => a.id !== featured.id)
    : filtered

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — matches /consultants & /visa-categories exactly
          • Navy background + white grid lines + gold corner glow
          • pt-[calc(64px+2.5rem)] clears the fixed navbar (INS-05)
          • Badge pill + Urdu subtitle + stats bar added (INS-03, INS-04)
          • Search bar removed per product decision
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-navy relative overflow-hidden pt-[calc(64px+2.5rem)] pb-10 px-6">

        {/* Layer 1 — white grid lines at 4% opacity */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Layer 2 — gold radial glow, top-right */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)',
            transform: 'translate(20%, -20%)',
          }}
        />

        {/* Hero content */}
        <div className="relative max-w-3xl mx-auto text-center">

          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-5">
            <Newspaper size={13} className="text-gold" />
            <span className="font-body text-xs font-semibold text-gold tracking-wide">
              Expert Visa Guides & Immigration Insights
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-heading font-extrabold text-white text-4xl lg:text-5xl mb-3 leading-tight">
            VisaGate Insights
          </h1>

          {/* [INS-04] Urdu subtitle — was missing */}
          <p className="font-urdu text-gold/80 text-xl mb-4">
            ویزا گائیڈز اور امیگریشن اپڈیٹس
          </p>

          {/* English description */}
          <p className="font-body text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Stay informed with expert tips, country guides and immigration updates
            curated by our verified consultants.
          </p>
        </div>
      </div>
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ── Category tabs ── */}
      {/* [INS-06] Each pill now shows the article count for that category */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map(cat => {
              const count = categoryCounts[cat] ?? 0
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-navy text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                  {/* Count badge — only show if we have a number */}
                  {count > 0 && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Featured article hero card ── */}
        {featured && activeCategory === 'All' && (
          <Link href={`/insights/${featured.slug}`} className="block mb-12 group">
            <div className="relative rounded-3xl overflow-hidden shadow-xl h-80 md:h-[420px] bg-navy">
              {featured.cover_image && (
                <Image
                  src={featured.cover_image}
                  alt={featured.title}
                  fill
                  className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-gold text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Featured
                  </span>
                  {featured.category && (
                    <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                      {featured.category}
                    </span>
                  )}
                </div>
                <h2 className="font-heading font-bold text-white text-2xl md:text-4xl mb-3 leading-tight">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-2xl mb-4">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  {featured.read_time && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} />{featured.read_time} min read
                    </span>
                  )}
                  {featured.views != null && (
                    <span className="flex items-center gap-1">
                      <Eye size={13} />{featured.views} views
                    </span>
                  )}
                  <span>{formatDate(featured.created_at)}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── Results count ── */}
        <div className="mb-6">
          <p className="font-body text-gray-500 text-sm">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
            {activeCategory !== 'All' && ` in ${activeCategory}`}
          </p>
        </div>

        {/* ── Article grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.length === 0 ? (
            <div className="col-span-3 text-center py-20">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg">No articles found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different category</p>
            </div>
          ) : (
            displayArticles.map(article => (
              <Link
                key={article.id}
                href={`/insights/${article.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col"
              >
                {/* Card thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  {article.cover_image ? (
                    <Image
                      src={article.cover_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    // [INS-02] Category-specific gradient fallback — replaces blank grey bg
                    <div
                      className="h-full w-full relative flex items-center justify-center"
                      style={{
                        background: CATEGORY_GRADIENTS[article.category || '']
                          ?? CATEGORY_GRADIENTS['General'],
                      }}
                    >
                      {/* Subtle dot pattern overlay */}
                      <div
                        className="absolute inset-0 opacity-[0.07]"
                        style={{
                          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                          backgroundSize: '18px 18px',
                        }}
                      />
                      <BookOpen size={40} className="relative z-10 text-white/30" />
                    </div>
                  )}

                  {article.category && (
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-700'
                    }`}>
                      {article.category}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-heading font-bold text-navy text-base leading-snug mb-2 group-hover:text-gold transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="font-body text-gray-500 text-sm line-clamp-2 mb-3 flex-1">
                      {article.excerpt}
                    </p>
                  )}

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                        >
                          <Tag size={9} />{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-3">
                      {article.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />{article.read_time} min
                        </span>
                      )}
                      {article.views != null && (
                        <span className="flex items-center gap-1">
                          <Eye size={11} />{article.views}
                        </span>
                      )}
                    </div>
                    <span className="text-gold font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}