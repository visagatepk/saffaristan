'use client'
// FILE: app/dashboard/admin/insights/editor/page.tsx

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft, Bold, Italic, Heading2, Heading3, List, Quote,
  Code, Link as LinkIcon, Eye, EyeOff, Upload, X,
  Save, Globe, Clock, Hash, CheckCircle, AlertCircle, ImageIcon
} from 'lucide-react'

const CATEGORIES = ['Visa Tips', 'Country Guides', 'Immigration News', 'Success Stories', 'Consultants', 'General']

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

function calcReadTime(text: string) {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}

function EditorContent() {
  const searchParams = useSearchParams()
  const editId = searchParams?.get('id')
  const router = useRouter()

  const [title, setTitle]           = useState('')
  const [slug, setSlug]             = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [content, setContent]       = useState('')
  const [excerpt, setExcerpt]       = useState('')
  const [category, setCategory]     = useState('General')
  const [tags, setTags]             = useState('')
  const [authorName, setAuthorName] = useState('')
  const [coverUrl, setCoverUrl]     = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isFeatured, setIsFeatured]   = useState(false)
  const [preview, setPreview]         = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [status, setStatus]           = useState<'idle' | 'saved' | 'published' | 'error'>('idle')
  const [statusMsg, setStatusMsg]     = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('id', session.user.id)
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
          setCoverUrl(art.cover_image || '')   // ✅ correct column
          setIsPublished(art.is_published || false)
          setIsFeatured(art.is_featured || false)
        }
      }
    }
    init()
  }, [editId])

  useEffect(() => {
    if (!slugEdited && title) setSlug(slugify(title))
  }, [title, slugEdited])

  const insertMarkdown = (before: string, after = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.substring(start, end)
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const toolbarActions = [
    { icon: Bold,     label: 'Bold',  action: () => insertMarkdown('**', '**') },
    { icon: Italic,   label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: Heading2, label: 'H2',    action: () => insertMarkdown('\n## ') },
    { icon: Heading3, label: 'H3',    action: () => insertMarkdown('\n### ') },
    { icon: List,     label: 'List',  action: () => insertMarkdown('\n- ') },
    { icon: Quote,    label: 'Quote', action: () => insertMarkdown('\n> ') },
    { icon: Code,     label: 'Code',  action: () => insertMarkdown('`', '`') },
    { icon: LinkIcon, label: 'Link',  action: () => insertMarkdown('[', '](url)') },
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
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
      setTimeout(() => setStatus('idle'), 3000)
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaving(false); return }

    const payload = {
      title:       title.trim(),
      slug:        slug.trim() || slugify(title),
      content:     content.trim(),
      excerpt:     excerpt.trim(),
      category,
      tags:        tags.split(',').map(t => t.trim()).filter(Boolean),
      author_name: authorName,
      author_id:   session.user.id,
      cover_image: coverUrl || null,          // ✅ correct column
      is_published: publish ? true : isPublished,
      is_featured:  isFeatured,
      read_time:    calcReadTime(content),
      updated_at:   new Date().toISOString(),
    }

    let error = null
    if (editId) {
      const res = await supabase.from('articles').update(payload).eq('id', editId)
      error = res.error
    } else {
      const res = await supabase.from('articles').insert({ ...payload, views: 0, likes_count: 0 })
      error = res.error
    }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/insights" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-[#1B3060] font-['Plus_Jakarta_Sans']">
                {editId ? 'Edit Article' : 'New Article'}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Hash size={10} />{wordCount} words</span>
                <span className="flex items-center gap-1"><Clock size={10} />{calcReadTime(content)} min read</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status !== 'idle' && (
              <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {status === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                {statusMsg}
              </span>
            )}
            <button onClick={() => setPreview(!preview)}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-all ${preview ? 'bg-[#1B3060] text-white border-[#1B3060]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {preview ? <EyeOff size={14} /> : <Eye size={14} />}
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={() => save(false)} disabled={saving}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all font-medium">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => save(true)} disabled={saving}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-[#C9A227] text-white hover:bg-[#b8911f] transition-all font-semibold">
              <Globe size={14} /> Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Main Editor */}
        <div className="flex-1 space-y-4">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Article title..."
            className="w-full text-2xl font-bold text-[#1B3060] placeholder-gray-300 border-0 border-b-2 border-gray-200 focus:border-[#C9A227] outline-none bg-transparent pb-2 font-['Plus_Jakarta_Sans'] transition-colors" />

          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            <span className="text-gray-500 text-sm">visagate.pk/insights/</span>
            <input type="text" value={slug} onChange={e => { setSlug(e.target.value); setSlugEdited(true) }}
              className="flex-1 text-sm text-[#1B3060] bg-transparent outline-none font-mono" placeholder="article-slug" />
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <label className="block text-sm font-semibold text-[#1B3060] mb-3 flex items-center gap-2">
              <ImageIcon size={15} /> Cover Image
            </label>
            {coverUrl ? (
              <div className="relative rounded-xl overflow-hidden h-48">
                <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                <button onClick={() => setCoverUrl('')} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#C9A227] hover:bg-amber-50 transition-all text-gray-400 hover:text-[#C9A227]">
                <Upload size={24} />
                <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Click to upload cover image'}</span>
                <span className="text-xs">JPG, PNG up to 5MB</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-1 p-3 border-b border-gray-100 bg-gray-50 flex-wrap">
              {toolbarActions.map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action} title={label}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:text-[#1B3060] hover:bg-white rounded-lg text-xs font-medium transition-all border border-transparent hover:border-gray-200">
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            {preview ? (
              <div className="p-6 min-h-64 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: `<p style="margin-bottom:1rem;color:#374151;line-height:1.75">${renderPreview(content)}</p>` }} />
            ) : (
              <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)}
                placeholder="Write your article content here...&#10;&#10;Use ## for section headings&#10;Use **text** for bold&#10;Use > for quotes&#10;Use - for bullet points"
                rows={20} className="w-full p-6 text-gray-700 text-sm leading-relaxed resize-none outline-none font-mono" />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-[#1B3060] mb-3">Publication</h3>
            <div className="space-y-3">
              {[
                { label: 'Published', value: isPublished, set: setIsPublished, color: 'bg-green-500' },
                { label: 'Featured',  value: isFeatured,  set: setIsFeatured,  color: 'bg-[#C9A227]' },
              ].map(({ label, value, set, color }) => (
                <label key={label} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 flex items-center gap-2"><Globe size={14} /> {label}</span>
                  <div onClick={() => set(!value)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${value ? color : 'bg-gray-200'}`}>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: value ? 'translateX(22px)' : 'translateX(0)' }} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-[#1B3060] mb-3">Category</h3>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B3060]">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-[#1B3060] mb-3">Tags</h3>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)}
              placeholder="visa, uk, work permit"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
            <p className="text-xs text-gray-400 mt-1">Comma separated</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-[#1B3060] mb-1">Excerpt</h3>
            <p className="text-xs text-gray-400 mb-2">Short description shown in cards</p>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value.slice(0, 200))}
              placeholder="Brief summary..." rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
            <p className={`text-xs mt-1 text-right ${excerpt.length > 180 ? 'text-orange-500' : 'text-gray-400'}`}>
              {excerpt.length}/200
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-[#1B3060] mb-3">Author</h3>
            <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading editor...</div></div>}>
      <EditorContent />
    </Suspense>
  )
}