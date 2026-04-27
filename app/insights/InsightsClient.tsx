'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Clock, Eye, Star, ChevronRight, Tag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['All', 'Visa Tips', 'Country Guides', 'Immigration News', 'Success Stories', 'Consultant Advice', 'Policy Updates']

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
  cover_image: string | null
  category: string
  tags: string[]
  author_name: string
  read_time: number
  views: number
  is_featured: boolean
  published_at: string
  created_at: string
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="h-48 bg-gray-100 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-5 w-full bg-gray-100 rounded-full animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-3 w-1/2 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export default function InsightsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, cover_image, category, tags, author_name, read_time, views, is_featured, published_at, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      setArticles(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const featured = articles.find(a => a.is_featured)
  const filtered = articles.filter(a => {
    const matchCat = category === 'All' || a.category === category
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })
  const regular = filtered.filter(a => !a.is_featured || category !== 'All' || search)

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
  const imgSrc = (img: string | null) => img ? `${supabaseUrl}/storage/v1/object/public/articles/${img}` : null

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1B3060] py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #C9A227 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-bold text-[#C9A227] uppercase tracking-widest mb-3 bg-[#C9A227]/10 px-3 py-1.5 rounded-full">
            VisaGate Insights
          </span>
          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl mb-2">
            Visa Tips, Guides & News
          </h1>
          <p className="font-urdu text-[#C9A227]/80 text-lg mb-4">ویزا گائیڈز اور تازہ خبریں</p>
          <p className="text-white/60 text-sm max-w-xl mx-auto mb-7">
            Expert advice, country guides, and immigration updates from Pakistan trusted visa professionals.
          </p>
          <div className="max-w-xl mx-auto flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-xl">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles, topics..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Featured Article */}
        {!loading && !search && category === 'All' && featured && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Star size={14} className="text-[#C9A227] fill-[#C9A227]" />
              <span className="text-sm font-bold text-[#C9A227] uppercase tracking-wider">Featured Article</span>
            </div>
            <Link href={`/insights/${featured.slug}`}
              className="group flex flex-col lg:flex-row bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] transition-all duration-300">
              <div className="lg:w-1/2 h-64 lg:h-auto overflow-hidden bg-[#1B3060]/10">
                {imgSrc(featured.cover_image) ? (
                  <img src={imgSrc(featured.cover_image)!} alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1B3060] to-blue-800 flex items-center justify-center">
                    <span className="text-white/20 text-6xl font-black">VG</span>
                  </div>
                )}
              </div>
              <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[featured.category] || 'bg-gray-100 text-gray-600'}`}>
                    {featured.category}
                  </span>
                  <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/10 px-2 py-0.5 rounded-full">Featured</span>
                </div>
                <h2 className="font-heading font-extrabold text-[#1B3060] text-2xl lg:text-3xl leading-tight mb-3 group-hover:text-[#C9A227] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
                  <span className="font-semibold text-gray-600">{featured.author_name}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {featured.read_time} min read</span>
                  <span className="flex items-center gap-1"><Eye size={11} /> {(featured.views || 0).toLocaleString()} views</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1B3060] group-hover:text-[#C9A227] transition-colors">
                  Read Article <ChevronRight size={15} />
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-7">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                category === cat
                  ? 'bg-[#1B3060] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B3060]/30 hover:text-[#1B3060]'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-sm text-gray-400 mb-5">
            <span className="font-bold text-[#1B3060]">{filtered.length}</span> article{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && regular.map(article => {
            const src = imgSrc(article.cover_image)
            return (
              <Link key={article.id} href={`/insights/${article.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
                <div className="h-48 overflow-hidden bg-[#1B3060]/10">
                  {src ? (
                    <img src={src} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1B3060] to-blue-800 flex items-center justify-center">
                      <span className="text-white/20 text-4xl font-black">VG</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-500'}`}>
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-[#1B3060] text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#C9A227] transition-colors flex-1">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                  {Array.isArray(article.tags) && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-600">{article.author_name}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(article.published_at || article.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {article.read_time || 1}m</span>
                      <span className="flex items-center gap-0.5"><Eye size={10} /> {(article.views || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}

          {!loading && filtered.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <Search size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-600">No articles found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different category or search term</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}