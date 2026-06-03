'use client'
// FILE: app/dashboard/admin/insights/editor/page.tsx
// ALSO REPLACE: app/dashboard/editor/insights/editor/page.tsx

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
import { useSearchParams } from 'next/navigation'
import NextLink from 'next/link'
import {
  Bold, Italic, Underline as UnderlineIcon,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  Undo, Redo, AlignLeft, AlignCenter, AlignRight,
  Save, Globe, ArrowLeft, Loader2, AlignJustify,
  Link2, Image as ImageIcon, Languages, ArrowLeftRight,
  Eye, Code2,
} from 'lucide-react'

type EditorMode = 'visual' | 'text'
type DirType = 'ltr' | 'rtl'

// ─── Sub-components ───────────────────────────────────────────────────────────

function DirBtn({ onClick, active, label, children }: {
  onClick: () => void
  active?: boolean
  label?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`px-2.5 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1 font-medium ${
        active ? 'bg-[#1B3060] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarBtn({ onClick, active, disabled, title, children }: {
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
      className={`p-1.5 rounded-md transition-all ${
        active
          ? 'bg-[#1B3060] text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />
}

function getWordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text ? text.split(' ').filter(Boolean).length : 0
}

function getReadTime(w: number): number {
  return Math.max(1, Math.round(w / 200))
}

// ─── Main editor ─────────────────────────────────────────────────────────────

function InsightEditorInner() {
  const searchParams = useSearchParams()
  const articleId = searchParams.get('id')
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
  const [editorDir, setEditorDir] = useState<DirType>('rtl')
  const [editorMode, setEditorMode] = useState<EditorMode>('visual')
  const [htmlSource, setHtmlSource] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(!!articleId)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextDirection.configure({
        types: ['heading', 'paragraph', 'bulletList', 'orderedList', 'blockquote'],
      }),
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
      attributes: { class: 'outline-none min-h-[420px] px-6 py-5 text-gray-800' },
    },
    onUpdate: ({ editor: ed }) => {
      setHtmlSource(ed.getHTML())
    },
  })

  const switchToText = useCallback(() => {
    if (!editor) return
    setHtmlSource(editor.getHTML())
    setEditorMode('text')
  }, [editor])

  const switchToVisual = useCallback(() => {
    if (!editor) return
    editor.commands.setContent(htmlSource)
    setEditorMode('visual')
  }, [editor, htmlSource])

  const toggleEditorDir = useCallback(() => {
    if (!editor) return
    const newDir: DirType = editorDir === 'rtl' ? 'ltr' : 'rtl'
    setEditorDir(newDir)
    const { state, dispatch } = editor.view
    const { tr, doc } = state
    doc.descendants((node, pos) => {
      if (['heading', 'paragraph', 'bulletList', 'orderedList', 'blockquote'].includes(node.type.name)) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, dir: newDir })
      }
    })
    dispatch(tr)
  }, [editor, editorDir])

  const setDir = useCallback((dir: DirType) => {
    if (!editor) return
    editor.chain().focus().setTextDirection(dir).run()
  }, [editor])

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

  useEffect(() => {
    if (!articleId) return
    void (async () => {
      setLoading(true)
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()
      if (data) {
        setTitle(data.title || '')
        setSlug(data.slug || '')
        setExcerpt(data.excerpt || '')
        setCoverImage(data.cover_image || '')
        setTags((data.tags || []).join(', '))
        setCategory(data.category || 'General')
        setIsPublished(data.is_published ?? false)
        setIsFeatured(data.is_featured ?? false)
        setAuthor(data.author_name || '')
        const html: string = data.content || ''
        setHtmlSource(html)
        if (editor) editor.commands.setContent(html)
      }
      setLoading(false)
    })()
  }, [articleId, editor])

  const handleSave = async (publish: boolean) => {
    setError('')
    setSuccess('')
    if (!title.trim()) { setError('Title is required.'); return }
    if (!slug.trim()) { setError('Slug is required.'); return }

    if (publish) { setPublishing(true) } else { setSaving(true) }

    const content = editorMode === 'text' ? htmlSource : (editor?.getHTML() ?? '')
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
    const autoExcerpt = excerpt || content.replace(/<[^>]+>/g, '').slice(0, 200).trim()

    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user
    if (!user) {
      setError('Not authenticated.')
      setSaving(false)
      setPublishing(false)
      return
    }

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

    let saveError: { message: string } | null = null

    if (articleId) {
      const { error: e } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', articleId)
      saveError = e
    } else {
      const { error: e } = await supabase.from('articles').insert({
        ...payload,
        author_id: user.id,
        created_at: new Date().toISOString(),
        view_count: 0,
        like_count: 0,
        comment_count: 0,
      })
      saveError = e
    }

    if (saveError) {
      setError('Save failed: ' + saveError.message)
    } else {
      setSuccess(publish ? 'Article published!' : 'Draft saved!')
      if (publish) setIsPublished(true)
      setTimeout(() => setSuccess(''), 3000)
    }

    setSaving(false)
    setPublishing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3060]" />
      </div>
    )
  }

  const currentHtml = editorMode === 'visual' && editor ? editor.getHTML() : htmlSource
  const wordCount = getWordCount(currentHtml)
  const readTime = getReadTime(wordCount)

  const isVisual = editorMode === 'visual'
  const isText = editorMode === 'text'

  const currentBlock = editor?.isActive('heading', { level: 1 })
    ? 'H1'
    : editor?.isActive('heading', { level: 2 })
    ? 'H2'
    : editor?.isActive('heading', { level: 3 })
    ? 'H3'
    : 'P'

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NextLink
              href="/dashboard/admin/insights"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3060] transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </NextLink>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-xs text-gray-400">{wordCount} words · {readTime} min read</span>
            {isPublished && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Published
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <span className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                {error}
              </span>
            )}
            {success && (
              <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                {success}
              </span>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={publishing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A227] text-white text-sm font-medium hover:bg-[#b8911f] transition-all disabled:opacity-50"
            >
              {publishing ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 flex gap-5">

        {/* Editor column */}
        <div className="flex-1 min-w-0">

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="عنوان لکھیں / Article title"
            dir="auto"
            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-0 bg-transparent outline-none mb-3"
          />

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

          {/* Editor box */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

            {/* Toolbar — Visual mode only */}
            {isVisual && (
              <div className="border-b border-gray-100">

                {/* Row 1: Mode tabs + Direction */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100 flex-wrap">

                  {/* Visual / Text tabs */}
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                    <button
                      type="button"
                      onClick={switchToVisual}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-[#1B3060] text-white transition-all"
                    >
                      <Eye size={12} /> Visual
                    </button>
                    <button
                      type="button"
                      onClick={switchToText}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-white text-gray-600 hover:bg-gray-50 transition-all border-l border-gray-200"
                    >
                      <Code2 size={12} /> Text
                    </button>
                  </div>

                  <div className="w-px h-4 bg-gray-200" />

                  <Languages size={13} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Direction:</span>

                  <button
                    type="button"
                    onClick={toggleEditorDir}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1B3060] text-white hover:bg-[#152549] transition-all"
                  >
                    <ArrowLeftRight size={11} />
                    {editorDir === 'rtl' ? 'اردو (RTL)' : 'English (LTR)'}
                  </button>

                  <div className="w-px h-4 bg-gray-200" />
                  <span className="text-xs text-gray-400">Paragraph:</span>

                  <DirBtn
                    onClick={() => setDir('rtl')}
                    active={editor?.isActive({ textDirection: 'rtl' })}
                    label="Set RTL (Urdu)"
                  >
                    RTL اردو
                  </DirBtn>
                  <DirBtn
                    onClick={() => setDir('ltr')}
                    active={editor?.isActive({ textDirection: 'ltr' })}
                    label="Set LTR (English)"
                  >
                    LTR Eng
                  </DirBtn>
                </div>

                {/* Row 2: Formatting buttons */}
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
                  <select
                    onChange={e => {
                      const v = e.target.value
                      if (v === 'p') {
                        editor?.chain().focus().setParagraph().run()
                      } else {
                        editor?.chain().focus().toggleHeading({ level: parseInt(v) as 1 | 2 | 3 }).run()
                      }
                      e.target.value = 'p'
                    }}
                    defaultValue="p"
                    className="text-xs border border-gray-200 rounded-md px-1.5 py-1 mr-1 outline-none text-gray-700 bg-white cursor-pointer h-7"
                  >
                    <option value="p">Paragraph</option>
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                  </select>

                  <Sep />
                  <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold (Ctrl+B)">
                    <Bold size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic (Ctrl+I)">
                    <Italic size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline">
                    <UnderlineIcon size={15} />
                  </ToolbarBtn>
                  <Sep />
                  <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet List">
                    <List size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered List">
                    <ListOrdered size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">
                    <Quote size={15} />
                  </ToolbarBtn>
                  <Sep />
                  <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' })} title="Align Left">
                    <AlignLeft size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' })} title="Center">
                    <AlignCenter size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' })} title="Align Right">
                    <AlignRight size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor?.chain().focus().setTextAlign('justify').run()} active={editor?.isActive({ textAlign: 'justify' })} title="Justify">
                    <AlignJustify size={15} />
                  </ToolbarBtn>
                  <Sep />
                  <ToolbarBtn
                    onClick={() => {
                      const url = window.prompt('Link URL:')
                      if (url) editor?.chain().focus().setLink({ href: url }).run()
                    }}
                    active={editor?.isActive('link')}
                    title="Insert Link"
                  >
                    <Link2 size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn
                    onClick={() => {
                      const url = window.prompt('Image URL:')
                      if (url) editor?.chain().focus().setImage({ src: url }).run()
                    }}
                    title="Insert Image"
                  >
                    <ImageIcon size={15} />
                  </ToolbarBtn>
                  <Sep />
                  <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Undo">
                    <Undo size={15} />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Redo">
                    <Redo size={15} />
                  </ToolbarBtn>
                </div>
              </div>
            )}

            {/* Visual editor content */}
            {isVisual && (
              <div dir={editorDir} className="editor-multilang">
                <EditorContent editor={editor} />
              </div>
            )}

            {/* Text / HTML source mode */}
            {isText && (
              <div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                    <button
                      type="button"
                      onClick={switchToVisual}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-white text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <Eye size={12} /> Visual
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-[#1B3060] text-white border-l border-gray-200"
                    >
                      <Code2 size={12} /> Text
                    </button>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    Edit raw HTML — changes sync back to Visual mode
                  </span>
                </div>
                <textarea
                  value={htmlSource}
                  onChange={e => setHtmlSource(e.target.value)}
                  dir="ltr"
                  className="w-full min-h-[420px] px-5 py-4 text-xs font-mono text-gray-700 bg-[#fafafa] outline-none resize-y leading-relaxed"
                  placeholder="<p>Raw HTML here...</p>"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Status bar */}
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-1.5 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {isVisual ? currentBlock : 'HTML'}
              </span>
              <span className="text-xs text-gray-400">Word count: {wordCount}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            اردو کے لیے RTL · For Urdu use RTL — For English use LTR
          </p>
        </div>

        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-3">

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Publication</h3>
            <label className="flex items-center justify-between cursor-pointer mb-2.5">
              <span className="text-sm text-gray-600">Published</span>
              <div
                onClick={() => setIsPublished(p => !p)}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                  isPublished ? 'bg-[#1B3060]' : 'bg-gray-200'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  isPublished ? 'left-4' : 'left-0.5'
                }`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-600">Featured</span>
              <div
                onClick={() => setIsFeatured(p => !p)}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                  isFeatured ? 'bg-[#C9A227]' : 'bg-gray-200'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  isFeatured ? 'left-4' : 'left-0.5'
                }`} />
              </div>
            </label>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Cover Image</h3>
            <input
              type="text"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://... image URL"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1B3060] text-gray-700"
            />
            {coverImage && (
              <div className="mt-2 relative rounded-lg overflow-hidden">
                <img src={coverImage} alt="Cover" className="w-full h-24 object-cover rounded-lg" />
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

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Category</h3>
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

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Excerpt</h3>
            <p className="text-xs text-gray-400 mb-2">Max 200 chars</p>
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

export default function InsightEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B3060]" />
        </div>
      }
    >
      <InsightEditorInner />
    </Suspense>
  )
}