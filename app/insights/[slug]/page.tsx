import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ArticleClient from './ArticleClient'

interface Props {
  params: { slug: string }
}

// Dynamic metadata per article — critical for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, cover_image_url, category, author_name, slug')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!article) {
    return { title: 'Article Not Found — VisaGate.pk' }
  }

  const url   = `https://visagate.pk/insights/${article.slug}`
  const image = article.cover_image_url || 'https://visagate.pk/og-image.png'

  return {
    title: `${article.title} — VisaGate.pk`,
    description: article.excerpt || `Read ${article.title} on VisaGate.pk`,
    alternates: { canonical: url },
    openGraph: {
      title:     article.title,
      description: article.excerpt || '',
      url,
      siteName:  'VisaGate.pk',
      locale:    'en_PK',
      type:      'article',
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       article.title,
      description: article.excerpt || '',
      images:      [image],
      creator:     '@visagatepk',
    },
  }
}

export default function ArticlePage() {
  return <ArticleClient />
}