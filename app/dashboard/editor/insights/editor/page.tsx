'use client'
// FILE: app/dashboard/editor/insights/editor/page.tsx

import { useEffect, useState, Suspense } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Bold, Italic, Underline as UnderlineIcon,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  Undo, Redo,
  AlignLeft, AlignCenter, AlignRight,
  Save, Globe, ArrowLeft, Eye, Loader2,
} from 'lucide-react'

// ── Toolbar helpers ──────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all text-sm ${
        active
          ? 'bg-[#1B3060] text-white shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      } ${disabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Visa Tips',
  'Country Guides',
  'Immigration News',
  'Student Visa',
  'Work Permit',
  'Family Visa',
  'Business Visa',
  'Travel Tips',
  'Success Stories',
]

// ── Slug helper ──────────────────────────────────────────────────────────────

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Inner editor — uses useSearchParams safely inside Suspense ───────────────

function ArticleEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Visa Tips')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [articleId, setArticleId] = useState<string | null>(editId)
  const [wordCount, setWordCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [loadingArticle, setLoadingArticle] = useState(!!editId)

  // ── Editor setup ───────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Start writing your article here…\n\nShare your expertise with visa seekers across Pakistan.',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[520px] px-8 py-7 text-gray-800 leading-relaxed text-[15px]',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText().trim()
      setWordCount(text ? text.split(/\s+/).length : 0)
    },
  })

  // ── Load article if editing ────────────────────────────────────────────────
  useEffect(() => {
    if (!editId || !editor) return
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('id', editId)
        .single()
      if (data) {
        setTitle(data.title || '')
        setCategory(data.category || 'Visa Tips')
        setCoverImageUrl(data.cover_image_url || '')
        setExcerpt(data.excerpt || '')
        if (data.content) editor.commands.setContent(data.content)
      }
      setLoadingArticle(false)
    })()
  }, [editId, editor])

  // ── Save / Publish ─────────────────────────────────────────────────────────
  const save = async (publish: boolean) => {
    if (!title.trim()) {
      alert('Please add a title before saving.')
      return
    }
    publish ? setPublishing(true) : setSaving(true)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const content = editor?.getHTML() || ''
    const autoExcerpt = editor?.getText().slice(0, 160).trim() + '…'

    const payload = {
      title: title.trim(),
      slug: toSlug(title),
      content,
      excerpt: excerpt.trim() || autoExcerpt,
      category,
      cover_image_url: coverImageUrl.trim() || null,
      is_published: publish,
      author_id: session.user.id,
      updated_at: new Date().toISOString(),
    }

    if (articleId) {
      await supabase.from('articles').update(payload).eq('id', articleId)
    } else {
      const { data } = await supabase
        .from('articles')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select('id')
        .single()
      if (data?.id) setArticleId(data.id)
    }

    setSavedMsg(publish ? 'Published!' : 'Draft saved')
    setTimeout(() => setSavedMsg(''), 3000)
    publish ? setPublishing(false) : setSaving(false)
    if (publish) router.push('/dashboard/editor/insights')
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingArticle || !editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-[#1B3060]" size={32} />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-4">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/editor/insights"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#1B3060] font-['Plus_Jakarta_Sans']">
              {editId ? 'Edit Article' : 'New Article'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{wordCount} words</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedMsg && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              ✓ {savedMsg}
            </span>
          )}
          {articleId && title && (
            <Link
              href={`/insights/${toSlug(title)}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-gray-600 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Eye size={13} /> Preview
            </Link>
          )}
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1B3060] px-4 py-2 rounded-xl border border-[#1B3060] hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={publishing}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#C9A227] px-4 py-2 rounded-xl hover:bg-[#b8911f] transition-colors disabled:opacity-50"
          >
            {publishing ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
            Publish
          </button>
        </div>
      </div>

      {/* ── Metadata Card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Article title…"
          className="w-full text-[22px] font-bold text-[#1B3060] placeholder-gray-300 border-none outline-none font-['Plus_Jakarta_Sans'] bg-transparent"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B3060]/20 bg-white"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Cover Image URL</label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={e => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/…"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B3060]/20"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
            Excerpt <span className="text-gray-400 font-normal normal-case">(auto-generated if blank)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="Brief summary shown in article cards…"
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B3060]/20 resize-none"
          />
        </div>
      </div>

      {/* ── Editor Card ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2.5 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
          <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo size={15} />
          </ToolbarBtn>
          <Sep />
          <ToolbarBtn title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
            <Heading1 size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
            <Heading2 size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
            <Heading3 size={15} />
          </ToolbarBtn>
          <Sep />
          <ToolbarBtn title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
            <Bold size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
            <Italic size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
            <UnderlineIcon size={15} />
          </ToolbarBtn>
          <Sep />
          <ToolbarBtn title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
            <List size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
            <ListOrdered size={15} />
          </ToolbarBtn>
          <Sep />
          <ToolbarBtn title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>
            <AlignLeft size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>
            <AlignCenter size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>
            <AlignRight size={15} />
          </ToolbarBtn>
          <Sep />
          <ToolbarBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
            <Quote size={15} />
          </ToolbarBtn>
          <span className="ml-auto text-[10px] text-gray-400 hidden md:block pr-1">
            Ctrl+B Bold · Ctrl+I Italic · Ctrl+Z Undo
          </span>
        </div>

        {/* Editor content styles */}
        <style>{`
          .ProseMirror h1 { font-size: 1.75rem; font-weight: 800; color: #1B3060; margin: 1.5rem 0 0.75rem; line-height: 1.2; }
          .ProseMirror h2 { font-size: 1.35rem; font-weight: 700; color: #1B3060; margin: 1.25rem 0 0.5rem; line-height: 1.3; }
          .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; color: #1B3060; margin: 1rem 0 0.4rem; }
          .ProseMirror p { margin: 0.6rem 0; color: #374151; }
          .ProseMirror strong { font-weight: 700; color: #111827; }
          .ProseMirror em { font-style: italic; }
          .ProseMirror u { text-decoration: underline; }
          .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
          .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
          .ProseMirror li { margin: 0.3rem 0; color: #374151; }
          .ProseMirror blockquote { border-left: 4px solid #C9A227; padding: 0.75rem 1rem; margin: 1rem 0; background: #fffbf0; border-radius: 0 8px 8px 0; color: #6b7280; font-style: italic; }
          .ProseMirror code { background: #f3f4f6; padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.875em; color: #1B3060; }
          .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #d1d5db; pointer-events: none; float: left; height: 0; }
        `}</style>

        <EditorContent editor={editor} />
      </div>

      {/* ── Bottom Action Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-xs text-gray-400">
          {wordCount} words · Slug: <span className="font-mono">{toSlug(title) || 'article-slug-here'}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-semibold text-[#1B3060] px-5 py-2.5 rounded-xl border border-[#1B3060] hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={publishing}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-[#C9A227] px-5 py-2.5 rounded-xl hover:bg-[#b8911f] transition-colors disabled:opacity-50"
          >
            {publishing ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} />}
            Publish Article
          </button>
        </div>
      </div>

    </div>
  )
}

// ── Default export — Suspense wrapper fixes Next.js 14 prerender error ────────

export default function ArticleEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-[#1B3060]" size={32} />
      </div>
    }>
      <ArticleEditor />
    </Suspense>
  )
}