import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ArticleClient from './ArticleClient'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('articles').select('title, excerpt').eq('slug', params.slug).single()
  if (!data) return { title: 'Article Not Found' }
  return { title: `${data.title} — VisaGate.pk`, description: data.excerpt }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!article) notFound()

  // Increment views
  await supabase.from('articles').update({ views: (article.views || 0) + 1 }).eq('id', article.id)

  const { data: comments } = await supabase
    .from('article_comments')
    .select('*')
    .eq('article_id', article.id)
    .order('created_at', { ascending: false })

  const { data: related } = await supabase
    .from('articles')
    .select('id, slug, title, category, read_time, views, published_at')
    .eq('is_published', true)
    .eq('category', article.category)
    .neq('id', article.id)
    .limit(3)

  return <ArticleClient article={article} comments={comments || []} related={related || []} />
}