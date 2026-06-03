'use client'
// FILE: app/dashboard/admin/insights/editor/page.tsx
// ALSO REPLACE: app/dashboard/editor/insights/editor/page.tsx
// Full multilingual RTL/LTR rich text editor with Urdu support

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { TextDirection } from 'tiptap-text-direction'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import NextLink from 'next/link'
import {
  Bold, Italic, Underline as UnderlineIcon,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  Undo, Redo,
  AlignLeft, AlignCenter, AlignRight,
  Save, Globe, ArrowLeft, Loader2,
  AlignJustify, Link2, Image as ImageIcon,
  Languages, ArrowLeftRight,
} from 'lucide-react'

// ─── RTL/LTR toggle button ───────────────────────────────────────────────────
function DirBtn({
  onClick, active, label, children,
}: {
  onClick: () => void; active?: boolean; label?: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg transition-all text-sm flex items-center gap-1 ${
        active ? 'bg-[#1B3060] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Toolbar button ──────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title?: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all text-sm ${
        active ? 'bg-[#1B3060] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

// ─── Separator ───────────────────────────────────────────────────────────────
function Sep() {
  return <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
}

// ─── Word count ──────────────────────────────────────────────────────────────
function getWordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return 0
  return text.split(' ').filter(Boolean).length
}

// ─── Estimate read time ──────────────────────────────────────────────────────
function getReadTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200))
}

// ─── Main editor component ───────────────────────────────────────────────────
function InsightEditorInner() {
  const searchParams = useSearchParams()
  const articleId = searchParams.get('id')
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('General')
  const [isPublished, setIsPublished] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [author, setAuthor] = useState('')
  const [editorDir, setEditorDir] = useState<'ltr' | 'rtl'>('rtl')

  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(!!articleId)

  // ── Tiptap editor ──────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextDirection.configure({ types: ['heading', 'paragraph', 'bulletList', 'orderedList', 'blockquote'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#C9A227] underline hover:text-[#1B3060] transition-colors' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl max-w-full my-4 mx-auto block shadow-md' },
      }),
      Placeholder.configure({
        placeholder: 'مضمون لکھنا شروع کریں یا Start writing your article here...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[400px] outline-none px-6 py-4 text-gray-800',
      },
    },
    onUpdate: () => {},
  })

  // ── Toggle entire editor direction ────────────────────────────────────────
  const toggleEditorDir = useCallback(() => {
    if (!editor) return
    const newDir = editorDir === 'rtl' ? 'ltr' : 'rtl'
    setEditorDir(newDir)
    // Apply direction to ALL nodes in the document
    const { state, dispatch } = editor.view
    const { tr, doc } = state
    doc.descendants((node, pos) => {
      if (['heading', 'paragraph', 'bulletList', 'orderedList', 'blockquote'].includes(node.type.name)) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, dir: newDir })
      }
    })
    dispatch(tr)
  }, [editor, editorDir])

  // ── Set direction for current selection ───────────────────────────────────
  const setDir = useCallback((dir: 'ltr' | 'rtl') => {
    if (!editor) return
    editor.chain().focus().setTextDirection(dir).run()
  }, [editor])

  // ── Auto-slug from title ──────────────────────────────────────────────────
  useEffect(() => {
    if (!articleId && title) {
      const s = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setSlug(s || 'article')
    }
  }, [title, articleId])

  // ── Load existing article ─────────────────────────────────────────────────
  useEffect(() => {
    if (!articleId) return
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()
      if (error || !data) {
        setError('Failed to load article.')
        setLoading(false)
        return
      }
      setTitle(data.title || '')
      setSlug(data.slug || '')
      setExcerpt(data.excerpt || '')
      setCoverImage(data.cover_image || '')
      setTags((data.tags || []).join(', '))
      setCategory(data.category || 'General')
      setIsPublished(data.is_published ?? false)
      setIsFeatured(data.is_featured ?? false)
      setAuthor(data.author_name || '')
      if (data.content && editor) {
        editor.commands.setContent(data.content)
      }
      setLoading(false)
    })()
  }, [articleId, editor])

  // ── Save / Publish ─────────────────────────────────────────────────────────
  const handleSave = async (publish = false) => {
    if (!editor) return
    setError('')
    setSuccess('')
    if (!title.trim()) { setError('Title is required.'); return }
    if (!slug.trim()) { setError('Slug is required.'); return }

    publish ? setPublishing(true) : setSaving(true)

    const content = editor.getHTML()
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
    const autoExcerpt = excerpt || editor.getText().slice(0, 200).trim()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setSaving(false); setPublishing(false); return }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: autoExcerpt,
      cover_image: coverImage.trim() || null,
      tags: tagsArray,
      category,
      is_published: publish ? true : isPublished,
      is_featured: isFeatured,
      author_name: author.trim() || null,
      updated_at: new Date().toISOString(),
    }

    let err
    if (articleId) {
      ;({ error: err } = await supabase.from('articles').update(payload).eq('id', articleId))
    } else {
      ;({ error: err } = await supabase.from('articles').insert({
        ...payload,
        author_id: user.id,
        created_at: new Date().toISOString(),
        view_count: 0,
        like_count: 0,
        comment_count: 0,
      }))
    }

    if (err) {
      setError('Save failed: ' + err.message)
    } else {
      setSuccess(publish ? 'Article published successfully!' : 'Draft saved successfully!')
      if (publish) setIsPublished(true)
      setTimeout(() => setSuccess(''), 3000)
    }

    setSaving(false)
    setPublishing(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3060]" />
      </div>
    )
  }

  const wordCount = editor ? getWordCount(editor.getHTML()) : 0
  const readTime = getReadTime(wordCount)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NextLink
              href="/dashboard/admin/insights"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3060] transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </NextLink>
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-xs text-gray-400">
              {wordCount} words · {readTime} min read
            </span>
            {isPublished && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Published
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <span className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                {error}
              </span>
            )}
            {success && (
              <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                {success}
              </span>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={publishing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C9A227] text-white text-sm font-medium hover:bg-[#b8911f] transition-all disabled:opacity-50 shadow-sm"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Editor panel ───────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="عنوان لکھیں / Article title"
            dir="auto"
            className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-0 bg-transparent outline-none mb-4 font-heading"
            style={{ fontFamily: 'inherit' }}
          />

          {/* Slug */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-400 whitespace-nowrap">visagate.pk/insights/</span>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="article-url-slug"
              className="text-xs text-[#1B3060] bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 outline-none focus:border-[#1B3060] flex-1"
            />
          </div>

          {/* ── Toolbar ───────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl mb-2 shadow-sm">

            {/* Direction row */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <Languages size={14} className="text-gray-400 mr-1" />
              <span className="text-xs text-gray-400 mr-2">Direction:</span>

              {/* Toggle entire document */}
              <button
                type="button"
                onClick={toggleEditorDir}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#1B3060] text-white hover:bg-[#152549] transition-all"
              >
                <ArrowLeftRight size={12} />
                {editorDir === 'rtl' ? 'اردو (RTL)' : 'English (LTR)'}
              </button>

              <div className="w-px h-4 bg-gray-200 mx-2" />
              <span className="text-xs text-gray-400">Selected paragraph:</span>

              <DirBtn onClick={() => setDir('rtl')} active={editor?.isActive({ textDirection: 'rtl' })} label="Set RTL (Urdu/Arabic)">
                <span className="text-xs font-medium">RTL اردو</span>
              </DirBtn>
              <DirBtn onClick={() => setDir('ltr')} active={editor?.isActive({ textDirection: 'ltr' })} label="Set LTR (English)">
                <span className="text-xs font-medium">LTR Eng</span>
              </DirBtn>

              <div className="ml-auto text-xs text-gray-400 italic">
                Tip: Place cursor in a paragraph, then click RTL/LTR to change its direction
              </div>
            </div>

            {/* Formatting row */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-2">
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} title="Heading 1">
                <Heading1 size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Heading 2">
                <Heading2 size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} title="Heading 3">
                <Heading3 size={16} />
              </ToolbarBtn>
              <Sep />
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold (Ctrl+B)">
                <Bold size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic (Ctrl+I)">
                <Italic size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline (Ctrl+U)">
                <UnderlineIcon size={16} />
              </ToolbarBtn>
              <Sep />
              <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' })} title="Align Left">
                <AlignLeft size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' })} title="Align Center">
                <AlignCenter size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' })} title="Align Right">
                <AlignRight size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign('justify').run()} active={editor?.isActive({ textAlign: 'justify' })} title="Justify">
                <AlignJustify size={16} />
              </ToolbarBtn>
              <Sep />
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet List">
                <List size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Ordered List">
                <ListOrdered size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">
                <Quote size={16} />
              </ToolbarBtn>
              <Sep />
              <ToolbarBtn
                onClick={() => {
                  const url = window.prompt('URL:')
                  if (url) editor?.chain().focus().setLink({ href: url }).run()
                }}
                active={editor?.isActive('link')}
                title="Add Link"
              >
                <Link2 size={16} />
              </ToolbarBtn>
              <ToolbarBtn
                onClick={() => {
                  const url = window.prompt('Image URL:')
                  if (url) editor?.chain().focus().setImage({ src: url }).run()
                }}
                title="Insert Image"
              >
                <ImageIcon size={16} />
              </ToolbarBtn>
              <Sep />
              <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Undo">
                <Undo size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Redo">
                <Redo size={16} />
              </ToolbarBtn>
            </div>
          </div>

          {/* ── ProseMirror content area ──────────────────────────── */}
          <div
            className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden editor-multilang`}
            dir={editorDir}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Language hint */}
          <p className="text-xs text-gray-400 mt-2 text-center">
            اردو متن کے لیے RTL اور انگریزی کے لیے LTR بٹن استعمال کریں · Use RTL for Urdu, LTR for English
          </p>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="w-72 shrink-0 space-y-4">

          {/* Publication */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Publication</h3>
            <label className="flex items-center justify-between cursor-pointer mb-2">
              <span className="text-sm text-gray-600">Published</span>
              <div
                onClick={() => setIsPublished(p => !p)}
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${isPublished ? 'bg-[#1B3060]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublished ? 'left-5' : 'left-0.5'}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-600">Featured</span>
              <div
                onClick={() => setIsFeatured(p => !p)}
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${isFeatured ? 'bg-[#C9A227]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isFeatured ? 'left-5' : 'left-0.5'}`} />
              </div>
            </label>
          </div>

          {/* Cover Image */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Cover Image</h3>
            <input
              type="text"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://... image URL"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1B3060] text-gray-700"
            />
            {coverImage && (
              <div className="mt-2 relative rounded-lg overflow-hidden">
                <img src={coverImage} alt="Cover" className="w-full h-28 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                >
                  x
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Category</h3>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1B3060] text-gray-700 bg-white"
            >
              <option>General</option>
              <option>Work Visa</option>
              <option>Student Visa</option>
              <option>Family Visa</option>
              <option>Tourist Visa</option>
              <option>Business Visa</option>
              <option>Immigration</option>
              <option>Scholarships</option>
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Tags</h3>
            <p className="text-xs text-gray-400 mb-2">Comma separated</p>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="visa, uk, work permit"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1B3060] text-gray-700"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Excerpt</h3>
            <p className="text-xs text-gray-400 mb-2">Short description (max 200 chars)</p>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value.slice(0, 200))}
              placeholder="Brief summary..."
              rows={3}
              dir="auto"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1B3060] text-gray-700 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{excerpt.length}/200</p>
          </div>

          {/* Author */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Author</h3>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Author name"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1B3060] text-gray-700"
            />
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Page wrapper with Suspense ───────────────────────────────────────────────
export default function InsightEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3060]" />
      </div>
    }>
      <InsightEditorInner />
    </Suspense>
  )
}