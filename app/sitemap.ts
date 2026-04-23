import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://visagate.pk'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/consultants`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/visa-categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-consultants`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic consultant pages
  try {
    const supabase = createClient()
    const { data: consultants } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('role', 'consultant')
      .eq('verification_status', 'active')

    const consultantPages: MetadataRoute.Sitemap = (consultants || []).map((c) => ({
      url: `${baseUrl}/consultants/${c.id}`,
      lastModified: new Date(c.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Dynamic article pages
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('is_published', true)

    const articlePages: MetadataRoute.Sitemap = (articles || []).map((a) => ({
      url: `${baseUrl}/insights/${a.slug}`,
      lastModified: new Date(a.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...consultantPages, ...articlePages]
  } catch {
    return staticPages
  }
}