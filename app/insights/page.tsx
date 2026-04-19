import { createClient } from '@/lib/supabase/server'
import InsightsClient from './InsightsClient'

export const metadata = {
  title: 'Visa Insights & Guides — VisaGate.pk',
  description: 'Latest visa updates, step-by-step guides, and expert advice for Pakistani applicants.',
}

export default async function InsightsPage() {
  const supabase = createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, tags, author_name, read_time, views, is_featured, published_at, cover_image')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  return <InsightsClient articles={articles || []} />
}