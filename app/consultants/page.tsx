import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ConsultantsClient from './ConsultantsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Find Verified Visa Consultants in Pakistan',
  description:
    'Browse verified visa consultants and immigration agents across Islamabad, Lahore, Karachi and all major Pakistani cities. Filter by destination, visa type and city.',
  alternates: { canonical: 'https://visagate.pk/consultants' },
  openGraph: {
    title: 'Find Verified Visa Consultants in Pakistan — VisaGate.pk',
    description:
      'Browse verified visa consultants across Pakistan. Filter by city, destination and visa type.',
    url: 'https://visagate.pk/consultants',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: 'https://visagate.pk/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Find Verified Visa Consultants in Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Verified Visa Consultants in Pakistan — VisaGate.pk',
    description: 'Browse verified visa consultants across Pakistan.',
    images: ['https://visagate.pk/og-image.png'],
    creator: '@visagatepk',
  },
}

export default async function ConsultantsPage() {
  const supabase = createClient()

  // Run both queries in parallel for performance
  const [{ data: services }, { data: ratings }] = await Promise.all([

    // Main services query
    supabase
      .from('services')
      .select(`
        id, consultant_id, title, description, visa_type,
        destination_country, price_min, price_max, processing_days,
        image_url, is_active, created_at,
        consultant:consultant_id (
          display_name, full_name, city, is_verified,
          avatar_url, years_experience,
          is_beoe_verified, is_oep_verified, is_secp_verified, is_fbr_verified
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(60),

    // [CON-05] Real ratings — fetches all review rows then aggregates in JS.
    // Assumes table: reviews(consultant_id uuid, rating numeric)
    // If reviews are per-service, change consultant_id → service_id below.
    supabase
      .from('reviews')
      .select('consultant_id, rating'),
  ])

  // Build consultant_id → { average_rating, review_count } map
  const ratingMap = new Map<string, { average_rating: number; review_count: number }>()

  if (ratings) {
    const grouped = new Map<string, number[]>()
    for (const row of ratings) {
      if (!row.consultant_id || row.rating == null) continue
      const list = grouped.get(row.consultant_id) ?? []
      list.push(Number(row.rating))
      grouped.set(row.consultant_id, list)
    }
    grouped.forEach((list, cid) => {
      const avg = list.reduce((a, b) => a + b, 0) / list.length
      ratingMap.set(cid, {
        average_rating: Math.round(avg * 10) / 10,
        review_count: list.length,
      })
    })
  }

  // Merge ratings into each service before passing to client
  const enrichedServices = (services ?? []).map(svc => ({
    ...svc,
    ...(ratingMap.get(svc.consultant_id) ?? {
      average_rating: null,
      review_count: null,
    }),
  }))

  return <ConsultantsClient initialServices={enrichedServices as any} />
}