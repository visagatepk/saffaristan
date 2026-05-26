'use client'
// FILE: app/dashboard/admin/insights/editor/page.tsx
// NOTE: This page renders its own full-screen layout with a sticky top bar.
// It intentionally overrides the admin dashboard layout padding for the editor UX.

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft, Bold, Italic, Heading2, Heading3, List, Quote,
  Code, Link as LinkIcon, Eye, EyeOff, Upload, X,
  Save, Globe, Clock, Hash, CheckCircle, AlertCircle, ImageIcon,
} from 'lucide-react'

const CATEGORIES = ['Visa Tips', 'Country Guides', 'Immigration News', 'Success Stories', 'Consultants', 'General']

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

function calcReadTime(text: string) {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}

// ─────────────────────────────────────────────────────────────────────────────
// Editor inner component (needs useSearchParams → wrapped in Suspense)
// ─────────────────────────────────────────────────────────────────────────────
function EditorContent() {
  const searchParams = useSearchParams()
  const editId       = searchParams?.get('id')
  const router       = useRouter()

  const [title, setTitle]             = useState('')
  const [slug, setSlug]               = useState('')
  const [slugEdited, setSlugEdited]   = useState(false)
  const [content, setContent]         = useState('')
  const [excerpt, setExcerpt]         = useState('')
  const [category, setCategory]       = useState('General')
  const [tags, setTags]               = useState('')
  const [authorName, setAuthorName]   = useState('')
  const [coverUrl, setCoverUrl]       = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isFeatured, setIsFeatured]   = useState(false)
  const [preview, setPreview]         = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [status, setStatus]           = useState<'idle' | 'saved' | 'published' | 'error'>('idle')
  const [statusMsg, setStatusMsg]     = useState('')

  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      // [FIX] was .eq('id', session.user.id) — profiles FK is user_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('user_id', session.user.id)
        .single()
      if (profile) setAuthorName(profile.display_name || profile.full_name || 'Admin')

      if (editId) {
        const { data: art } = await supabase.from('articles').select('*').eq('id', editId).single()
        if (art) {
          setTitle(art.title || '')
          setSlug(art.slug || '')
          setSlugEdited(true)
          setContent(art.content || '')
          setExcerpt(art.excerpt || '')
          setCategory(art.category || 'General')
          setTags((art.tags || []).join(', '))
          setAuthorName(art.author_name || '')
          setCoverUrl(art.cover_image || '')
          setIsPublished(art.is_published || false)
          setIsFeatured(art.is_featured || false)
        }
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  useEffect(() => {
    if (!slugEdited && title) setSlug(slugify(title))
  }, [title, slugEdited])

  const insertMarkdown = (before: string, after = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start    = ta.selectionStart
    const end      = ta.selectionEnd
    const selected = content.substring(start, end)
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const toolbarActions = [
    { icon: Bold,     label: 'Bold',   action: () => insertMarkdown('**', '**') },
    { icon: Italic,   label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: Heading2, label: 'H2',     action: () => insertMarkdown('\n## ') },
    { icon: Heading3, label: 'H3',     action: () => insertMarkdown('\n### ') },
    { icon: List,     label: 'List',   action: () => insertMarkdown('\n- ') },
    { icon: Quote,    label: 'Quote',  action: () => insertMarkdown('\n> ') },
    { icon: Code,     label: 'Code',   action: () => insertMarkdown('`', '`') },
    { icon: LinkIcon, label: 'Link',   action: () => insertMarkdown('[', '](url)') },
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext  = file.name.split('.').pop()
    const path = `covers/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('articles').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('articles').getPublicUrl(path)
      setCoverUrl(publicUrl)
    }
    setUploading(false)
  }

  const save = async (publish = false) => {
    if (!title.trim() || !content.trim()) {
      setStatus('error')
      setStatusMsg('Title and content are required.')
      setTimeout(() => setStatus('idle'), 3500)
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaving(false); return }

    const payload = {
      title:        title.trim(),
      slug:         slug.trim() || slugify(title),
      content:      content.trim(),
      excerpt:      excerpt.trim(),
      category,
      tags:         tags.split(',').map(t => t.trim()).filter(Boolean),
      author_name:  authorName,
      author_id:    session.user.id,
      cover_image:  coverUrl || null,
      is_published: publish ? true : isPublished,
      is_featured:  isFeatured,
      read_time:    calcReadTime(content),
      updated_at:   new Date().toISOString(),
    }

    const op = editId
      ? supabase.from('articles').update(payload).eq('id', editId)
      : supabase.from('articles').insert({ ...payload, views: 0, likes_count: 0 })

    const { error } = await op
    setSaving(false)

    if (error) {
      setStatus('error')
      setStatusMsg(error.message)
    } else {
      setStatus(publish ? 'published' : 'saved')
      setStatusMsg(publish ? 'Article published!' : 'Draft saved!')
      if (publish && !isPublished) setIsPublished(true)
    }
    setTimeout(() => setStatus('idle'), 3000)
  }

  const renderPreview = (text: string) =>
    text
      .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1rem;font-weight:700;color:#1B3060;margin:1.5rem 0 0.5rem">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:1.3rem;font-weight:700;color:#1B3060;margin:2rem 0 0.75rem">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:0.875rem">$1</code>')
      .replace(/^\> (.+)$/gm, '<blockquote style="border-left:4px solid #C9A227;padding:8px 16px;background:#fefce8;margin:12px 0;border-radius:0 8px 8px 0;color:#555">$1</blockquote>')
      .replace(/^\- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
      .replace(/\n\n/g, '</p><p style="margin-bottom:1rem;color:#374151;line-height:1.75">')

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#1B3060]/20 focus:border-[#1B3060] transition-all"

  return (
    <div className="min-h-screen bg-gray-50 -m-6">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/insights" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <div>
              {/* [FIX] was font-['Plus_Jakarta_Sans'] */}
              <h1 className="font-heading font-bold text-[#1B3060] text-base leading-tight">
                {editId ? 'Edit Article' : 'New Article'}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Hash size={10} />{wordCount} words</span>
                <span className="flex items-center gap-1"><Clock size={10} />{calcReadTime(content)} min read</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {status !== 'idle' && (
              <span className={`flex items-center gap-1.5 font-body text-sm px-3 py-1.5 rounded-lg ${
                status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
              }`}>
                {status === 'error' ? <AlertCircle size={13} /> : <CheckCircle size={13} />}
                {statusMsg}
              </span>
            )}
            <button onClick={() => setPreview(!preview)}
              className={`flex items-center gap-1.5 font-heading font-semibold text-sm px-3 py-2 rounded-lg border transition-all ${
                preview ? 'bg-[#1B3060] text-white border-[#1B3060]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {preview ? <EyeOff size={13} /> : <Eye size={13} />}
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={() => save(false)} disabled={saving}
              className="flex items-center gap-1.5 font-heading font-semibold text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60">
              <Save size={13} /> {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button onClick={() => save(true)} disabled={saving}
              className="flex items-center gap-1.5 font-heading font-bold text-sm px-4 py-2 rounded-lg text-white hover:opacity-90 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
              <Globe size={13} /> Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Main editor ── */}
        <div className="flex-1 space-y-4">

          {/* Title */}
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Article title…"
            className="w-full font-heading font-black text-[#1B3060] text-2xl placeholder-gray-300 border-0 border-b-2 border-gray-200 focus:border-[#C9A227] outline-none bg-transparent pb-2 transition-colors" />

          {/* Slug */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
            <span className="font-body text-gray-500 text-sm">visagate.pk/insights/</span>
            <input type="text" value={slug}
              onChange={e => { setSlug(e.target.value); setSlugEdited(true) }}
              className="flex-1 font-body text-sm text-[#1B3060] bg-transparent outline-none font-mono"
              placeholder="article-slug" />
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <label className="font-heading font-bold text-[#1B3060] text-sm mb-3 flex items-center gap-2 block">
              <ImageIcon size={14} className="text-[#C9A227]" /> Cover Image
            </label>
            {coverUrl ? (
              <div className="relative rounded-xl overflow-hidden h-48">
                <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                <button onClick={() => setCoverUrl('')}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#C9A227] hover:bg-[#FBF5E0]/50 transition-all text-gray-400 hover:text-[#C9A227]">
                <Upload size={22} />
                <span className="font-body text-sm font-semibold">
                  {uploading ? 'Uploading…' : 'Click to upload cover image'}
                </span>
                <span className="font-body text-xs">JPG, PNG up to 5MB</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Content editor */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-3 border-b border-gray-100 bg-gray-50 flex-wrap">
              {toolbarActions.map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action} title={label}
                  className="flex items-center gap-1 px-2.5 py-1.5 font-body text-gray-600 hover:text-[#1B3060] hover:bg-white rounded-lg text-xs font-medium transition-all border border-transparent hover:border-gray-200">
                  <Icon size={13} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            {preview ? (
              <div className="p-6 min-h-64 prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: `<p style="margin-bottom:1rem;color:#374151;line-height:1.75">${renderPreview(content)}</p>`,
                }}
              />
            ) : (
              <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)}
                placeholder={`Write your article content here...\n\nUse ## for section headings\nUse **text** for bold\nUse > for quotes\nUse - for bullet points`}
                rows={20}
                className="w-full p-6 font-body text-gray-700 text-sm leading-relaxed resize-none outline-none font-mono" />
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="w-72 shrink-0 space-y-4">

          {/* Publication */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-heading font-bold text-[#1B3060] text-sm mb-3">Publication</h3>
            <div className="space-y-3">
              {[
                { label: 'Published', value: isPublished, set: setIsPublished, color: 'bg-green-500' },
                { label: 'Featured',  value: isFeatured,  set: setIsFeatured,  color: 'bg-[#C9A227]' },
              ].map(({ label, value, set, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-body text-sm text-gray-700 flex items-center gap-2">
                    <Globe size={13} className="text-gray-400" /> {label}
                  </span>
                  <button onClick={() => set(!value)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${value ? color : 'bg-gray-200'}`}>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: value ? 'translateX(22px)' : 'translateX(0)' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-heading font-bold text-[#1B3060] text-sm mb-3">Category</h3>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className={inputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-heading font-bold text-[#1B3060] text-sm mb-1">Tags</h3>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)}
              placeholder="visa, uk, work permit" className={inputClass} />
            <p className="font-body text-xs text-gray-400 mt-1">Comma separated</p>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-heading font-bold text-[#1B3060] text-sm mb-1">Excerpt</h3>
            <p className="font-body text-xs text-gray-400 mb-2">Short description shown in cards</p>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value.slice(0, 200))}
              placeholder="Brief summary…" rows={3}
              className={`${inputClass} resize-none`} />
            <p className={`font-body text-xs mt-1 text-right ${excerpt.length > 180 ? 'text-amber-500' : 'text-gray-400'}`}>
              {excerpt.length}/200
            </p>
          </div>

          {/* Author */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="font-heading font-bold text-[#1B3060] text-sm mb-3">Author</h3>
            <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)}
              className={inputClass} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page export — Suspense required for useSearchParams
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  )
}