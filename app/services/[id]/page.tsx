import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ServiceDetailClient from './ServiceDetailClient'

export const revalidate = 60

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select('title, description, visa_type, destination_country, image_url')
    .eq('id', id)
    .maybeSingle()

  if (!service) {
    return { title: 'Service not found | Visagate' }
  }

  const title = `${service.title}${
    service.destination_country ? ` — ${service.destination_country}` : ''
  } | Visagate`
  const description =
    service.description?.slice(0, 160) ||
    `${service.visa_type ?? 'Visa'} consultancy service${
      service.destination_country ? ` for ${service.destination_country}` : ''
    } on Visagate.pk — Pakistan's verified visa consultant marketplace.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: service.image_url ? [{ url: service.image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { id } = params
  const supabase = await createClient()

  // 1. Fetch the service joined with consultant profile
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select(
      `
      id,
      consultant_id,
      title,
      description,
      visa_type,
      destination_country,
      price_min,
      price_max,
      processing_days,
      image_url,
      is_active,
      created_at,
      consultant:profiles!consultant_id (
        id,
        full_name,
        display_name,
        business_name,
        city,
        avatar_url,
        years_experience,
        is_verified,
        is_oep_verified,
        is_secp_verified,
        is_beoe_verified,
        is_fbr_verified,
        phone
      )
      `
    )
    .eq('id', id)
    .maybeSingle()

  if (serviceError || !service || !service.is_active) {
    notFound()
  }

  // Normalise consultant (Supabase may return single or array)
  const consultant = Array.isArray(service.consultant)
    ? service.consultant[0]
    : service.consultant

  if (!consultant) {
    notFound()
  }

  // 2. Fetch reviews for this consultant + related services in parallel
  const [reviewsResult, relatedResult] = await Promise.all([
    supabase
      .from('reviews')
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        reviewer:profiles!seeker_id (
          id,
          full_name,
          avatar_url
        )
        `
      )
      .eq('consultant_id', consultant.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('services')
      .select(
        'id, title, visa_type, destination_country, price_min, processing_days, image_url'
      )
      .eq('consultant_id', consultant.id)
      .eq('is_active', true)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  const reviews = reviewsResult.data ?? []
  const relatedServices = relatedResult.data ?? []

  return (
    <ServiceDetailClient
      service={service}
      consultant={consultant}
      reviews={reviews}
      relatedServices={relatedServices}
    />
  )
}