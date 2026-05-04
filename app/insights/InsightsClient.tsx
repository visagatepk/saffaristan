'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search, Clock, Eye, Tag, ChevronRight, BookOpen, AlertCircle } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null        // ✅ correct column name
  category: string | null
  tags: string[] | null
  author_name: string | null
  read_time: number | null
  views: number | null
  is_featured: boolean | null
  created_at: string
}

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

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-2 pt-2">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export default function InsightsClient() {
  const [articles, setArticles]             = useState<Article[]>([])
  const [featured, setFeatured]             = useState<Article | null>(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery]       = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const supabase = createClient()

        const { data, error: queryError } = await supabase
          .from('articles')
          .select(`
            id, title, slug, excerpt,
            cover_image,
            category, tags,
            author_name, read_time, views,
            is_featured, created_at
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(50)

        if (queryError) {
          console.error('Articles query error:', queryError)
          setError(queryError.message)
          return
        }

        const all = (data || []) as Article[]
        setFeatured(all.find(a => a.is_featured) || null)
        setArticles(all)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Failed to load articles. Please check your connection and environment variables.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtered = articles.filter(a => {
    const matchCat    = activeCategory === 'All' || a.category === activeCategory
    const matchSearch = searchQuery === '' ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const displayArticles = featured
    ? filtered.filter(a => a.id !== featured.id)
    : filtered

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Page Header ── */}
      <section className="bg-[#1B3060] pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-4">
            <BookOpen size={14} />
            Expert Visa Guides & Immigration Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-4">
            VisaGate Insights
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            Stay informed with expert tips, country guides, and immigration updates curated by our verified consultants.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
          </div>
        </div>
      </section>

      {/* ── Category Tabs ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-[#1B3060] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center mb-8">
            <AlertCircle size={36} className="mx-auto text-red-400 mb-3" />
            <p className="font-bold text-red-600 mb-1">Could not load articles</p>
            <p className="text-red-400 text-sm font-mono">{error}</p>
            <p className="text-gray-400 text-xs mt-3">
              Check Vercel → Settings → Environment Variables for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
            </p>
          </div>
        )}

        {/* ── Featured Article Hero ── */}
        {!loading && !error && featured && activeCategory === 'All' && !searchQuery && (
          <Link href={`/insights/${featured.slug}`} className="block mb-12 group">
            <div className="relative rounded-3xl overflow-hidden shadow-xl h-80 md:h-[420px] bg-[#1B3060]">
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
                  <span className="bg-[#C9A227] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Featured
                  </span>
                  {featured.category && (
                    <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                      {featured.category}
                    </span>
                  )}
                </div>
                <h2 className="text-white text-2xl md:text-4xl font-bold font-['Plus_Jakarta_Sans'] mb-3 leading-tight">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-2xl mb-4">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  {featured.read_time && (
                    <span className="flex items-center gap-1"><Clock size={13} />{featured.read_time} min read</span>
                  )}
                  {featured.views != null && (
                    <span className="flex items-center gap-1"><Eye size={13} />{featured.views} views</span>
                  )}
                  <span>{formatDate(featured.created_at)}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── Results Count ── */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-gray-500 text-sm">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
              {activeCategory !== 'All' && ` in ${activeCategory}`}
            </p>
          </div>
        )}

        {/* ── Article Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : !error && displayArticles.length === 0 ? (
            <div className="col-span-3 text-center py-20">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg">No articles found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different category or search term</p>
            </div>
          ) : (
            displayArticles.map(article => (
              <Link
                key={article.id}
                href={`/insights/${article.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col"
              >
                {/* ── Card Image ── */}
                <div className="relative h-48 bg-[#1B3060]/10 overflow-hidden">
                  {article.cover_image ? (
                    <Image
                      src={article.cover_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#1B3060]/10 to-[#C9A227]/10">
                      <BookOpen size={40} className="text-[#1B3060]/30" />
                    </div>
                  )}
                  {article.category && (
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-700'}`}>
                      {article.category}
                    </span>
                  )}
                </div>

                {/* ── Card Body ── */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[#1B3060] text-base leading-snug mb-2 group-hover:text-[#C9A227] transition-colors line-clamp-2 font-['Plus_Jakarta_Sans']">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-1">
                      {article.excerpt}
                    </p>
                  )}

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Tag size={9} />{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-3">
                      {article.read_time && (
                        <span className="flex items-center gap-1"><Clock size={11} />{article.read_time} min</span>
                      )}
                      {article.views != null && (
                        <span className="flex items-center gap-1"><Eye size={11} />{article.views}</span>
                      )}
                    </div>
                    <span className="text-[#C9A227] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
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