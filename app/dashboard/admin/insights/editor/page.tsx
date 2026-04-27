'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Bold, Italic, Heading2, Heading3, List,
  Quote, Code, Link2, Image, Eye, EyeOff, Save,
  Upload, X, CheckCircle, AlertTriangle
} from 'lucide-react'

const CATEGORIES = ['Visa Tips', 'Country Guides', 'Immigration News', 'Success Stories', 'Consultant Advice', 'Policy Updates']

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

function calcReadTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 200))
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-[#1B3060] mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[#1B3060] mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[#1B3060] mt-8 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-[#1B3060] px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[#C9A227] pl-4 py-1 my-4 text-gray-600 italic bg-[#C9A227]/5 rounded-r-lg">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700 mb-1 list-disc">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#1B3060] underline hover:text-[#C9A227]" target="_blank">$1</a>')
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
    .replace(/\n/g, '<br/>')
}

export default function ArticleEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const articleId = searchParams.get('id')
  const isEdit = Boolean(articleId)
  const supabase = createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [slugLocked, setSlugLocked] = useState(isEdit)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Visa Tips',
    tags: '',
    author_name: 'VisaGate Team',
    is_featured: false,
    is_published: false,
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [existingCover, setExistingCover] = useState<string | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role, display_name').eq('user_id', session.user.id).single()
      if (profile?.role !== 'admin') { router.push('/login'); return }

      if (profile?.display_name) {
        setForm(p => ({ ...p, author_name: profile.display_name }))
      }

      if (isEdit && articleId) {
        const { data: art } = await supabase.from('articles').select('*').eq('id', articleId).single()
        if (art) {
          setForm({
            title: art.title || '',
            slug: art.slug || '',
            excerpt: art.excerpt || '',
            content: art.content || '',
            category: art.category || 'Visa Tips',
            tags: Array.isArray(art.tags) ? art.tags.join(', ') : '',
            author_name: art.author_name || 'VisaGate Team',
            is_featured: art.is_featured || false,
            is_published: art.is_published || false,
          })
          if (art.cover_image) {
            setExistingCover(art.cover_image)
            setCoverPreview(`${supabaseUrl}/storage/v1/object/public/articles/${art.cover_image}`)
          }
        }
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleTitleChange = (val: string) => {
    setForm(p => ({ ...p, title: val, ...(!slugLocked ? { slug: generateSlug(val) } : {}) }))
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', false); return }
    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = ev => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const insertMarkdown = (syntax: string, wrap = false, placeholder = 'text') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = form.content.substring(start, end) || placeholder
    let inserted = ''
    if (wrap) {
      inserted = `${syntax}${selected}${syntax}`
    } else {
      inserted = `${syntax}${selected}`
    }
    const newContent = form.content.substring(0, start) + inserted + form.content.substring(end)
    setForm(p => ({ ...p, content: newContent }))
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + inserted.length, start + inserted.length)
    }, 0)
  }

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverFile) return existingCover
    const ext = coverFile.name.split('.').pop()
    const filename = `article-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('articles').upload(filename, coverFile, { upsert: true })
    if (error) { showToast('Cover upload failed: ' + error.message, false); return existingCover }
    return filename
  }

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim()) { showToast('Title is required', false); return }
    if (!form.slug.trim()) { showToast('Slug is required', false); return }
    setSaving(true)

    const coverFilename = await uploadCoverImage()
    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const readTime = calcReadTime(form.content)

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      category: form.category,
      tags: tagsArray,
      author_name: form.author_name,
      cover_image: coverFilename,
      read_time: readTime,
      is_featured: form.is_featured,
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    if (isEdit && articleId) {
      const { error } = await supabase.from('articles').update(payload).eq('id', articleId)
      if (error) { showToast('Save failed: ' + error.message, false) }
      else { showToast(publish ? 'Article published!' : 'Draft saved!'); }
    } else {
      const { error } = await supabase.from('articles').insert(payload)
      if (error) { showToast('Save failed: ' + error.message, false) }
      else {
        showToast(publish ? 'Article published!' : 'Draft saved!')
        setTimeout(() => router.push('/dashboard/admin/insights'), 1500)
      }
    }
    setSaving(false)
  }

  const readTime = calcReadTime(form.content)
  const wordCount = form.content.split(/\s+/).filter(Boolean).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/insights" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-bold text-[#1B3060] text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {isEdit ? 'Edit Article' : 'New Article'}
              </h1>
              <p className="text-xs text-gray-400">{wordCount} words · {readTime} min read</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(!preview)}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition">
              {preview ? <EyeOff size={14} /> : <Eye size={14} />}
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={() => handleSave(false)} disabled={saving}
              className="flex items-center gap-1.5 border border-[#1B3060] text-[#1B3060] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1B3060]/5 transition disabled:opacity-50">
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="flex items-center gap-1.5 bg-[#1B3060] text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-[#162550] transition disabled:opacity-50">
              <CheckCircle size={14} />
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-7 flex gap-6">
        {/* Main Editor */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Article Title *</label>
            <input
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Write an engaging title..."
              className="w-full text-2xl font-bold text-[#1B3060] outline-none placeholder-gray-200 border-b border-gray-100 pb-3 mb-3"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 shrink-0">visagate.pk/insights/</span>
              <input
                value={form.slug}
                onChange={e => { setSlugLocked(true); setForm(p => ({ ...p, slug: e.target.value })) }}
                className="flex-1 text-xs text-[#1B3060] font-mono border-b border-dashed border-gray-300 outline-none pb-0.5"
                placeholder="auto-generated-slug"
              />
              <button onClick={() => { setSlugLocked(false); setForm(p => ({ ...p, slug: generateSlug(form.title) })) }}
                className="text-[10px] text-gray-400 hover:text-[#1B3060] border border-gray-200 px-2 py-0.5 rounded-lg transition">
                Reset
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cover Image</label>
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={coverPreview} alt="Cover" className="w-full h-52 object-cover" />
                <button onClick={() => { setCoverFile(null); setCoverPreview(null); setExistingCover(null) }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition">
                  <X size={14} className="text-white" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                  {coverFile ? coverFile.name : 'Current cover'}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1B3060]/40 hover:bg-[#1B3060]/5 transition group">
                <Upload size={24} className="text-gray-300 group-hover:text-[#1B3060]/50 mb-2" />
                <span className="text-sm font-medium text-gray-400 group-hover:text-[#1B3060]">Click to upload cover image</span>
                <span className="text-xs text-gray-300 mt-1">PNG, JPG, WebP up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Excerpt</label>
              <span className="text-xs text-gray-400">{form.excerpt.length}/200</span>
            </div>
            <textarea
              value={form.excerpt}
              onChange={e => setForm(p => ({ ...p, excerpt: e.target.value.slice(0, 200) }))}
              rows={2}
              placeholder="A brief summary shown on the insights listing page..."
              className="w-full text-sm text-gray-700 outline-none resize-none placeholder-gray-300 leading-relaxed"
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-gray-100 flex-wrap">
              <span className="text-xs text-gray-400 mr-2 font-semibold">FORMAT:</span>
              {[
                { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', true) },
                { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', true) },
                { icon: Heading2, label: 'H2', action: () => insertMarkdown('## ') },
                { icon: Heading3, label: 'H3', action: () => insertMarkdown('### ') },
                { icon: List, label: 'List', action: () => insertMarkdown('- ') },
                { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ') },
                { icon: Code, label: 'Code', action: () => insertMarkdown('`', true) },
                { icon: Link2, label: 'Link', action: () => insertMarkdown('[', false, 'link text](https://)') },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1B3060] transition" title={label}>
                  <Icon size={14} />
                </button>
              ))}
              <div className="h-5 w-px bg-gray-200 mx-1" />
              <span className="text-xs text-gray-300 ml-1">Markdown supported</span>
            </div>

            {preview ? (
              <div className="p-6 min-h-80 prose max-w-none">
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: '<p class="text-gray-700 leading-relaxed mb-4">' + renderMarkdown(form.content || 'Nothing to preview yet...') + '</p>' }}
                />
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                rows={20}
                placeholder="Start writing your article here...

Use ## for headings, **bold**, *italic*, - for lists, > for quotes, `code`

Example:
## Introduction
Pakistan has thousands of skilled visa consultants...

## Why Verification Matters
**Verified consultants** have been checked against..."
                className="w-full p-5 text-sm text-gray-700 outline-none resize-none leading-relaxed font-mono placeholder-gray-300"
              />
            )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="w-72 shrink-0 space-y-4">

          {/* Publish Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-[#1B3060] text-sm mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Publish Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-700">Published</p>
                  <p className="text-xs text-gray-400">Visible to all visitors</p>
                </div>
                <div
                  onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                  className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${form.is_published ? 'bg-[#1B3060]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_published ? 'left-5' : 'left-1'}`} />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-700">Featured</p>
                  <p className="text-xs text-gray-400">Shown in hero section</p>
                </div>
                <div
                  onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}
                  className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${form.is_featured ? 'bg-[#C9A227]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_featured ? 'left-5' : 'left-1'}`} />
                </div>
              </label>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-[#1B3060] text-sm mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Category & Tags</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1B3060]/20 bg-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Tags</label>
                <input
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="visa, canada, student..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1B3060]/20"
                />
                <p className="text-xs text-gray-400 mt-1">Comma separated</p>
              </div>
            </div>
          </div>

          {/* Author */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-[#1B3060] text-sm mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Author</h3>
            <input
              value={form.author_name}
              onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1B3060]/20"
              placeholder="Author name"
            />
          </div>

          {/* Article Stats */}
          <div className="bg-[#1B3060]/5 rounded-2xl p-4 border border-[#1B3060]/10">
            <h3 className="font-bold text-[#1B3060] text-sm mb-3">Article Stats</h3>
            <div className="space-y-2">
              {[
                { label: 'Word Count', value: wordCount },
                { label: 'Read Time', value: `${readTime} min` },
                { label: 'Tags', value: form.tags.split(',').filter(t => t.trim()).length },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-bold text-[#1B3060]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Link */}
          {isEdit && form.slug && (
            <a href={`/insights/${form.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition">
              <Eye size={14} /> View Live Article
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
