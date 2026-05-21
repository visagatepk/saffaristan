import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ConsultantProfileClient from './ConsultantProfileClient'

export const revalidate = 60 // ISR: refresh every minute

interface PageProps {
  params: { id: string }
}

// SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, display_name, business_name, city, bio, avatar_url')
    .eq('id', id)
    .maybeSingle()

  if (!profile) {
    return { title: 'Consultant not found | Visagate' }
  }

  const name = profile.display_name || profile.full_name
  const titleParts = [name, profile.business_name, profile.city].filter(Boolean)
  const title = `${titleParts.join(' • ')} | Verified Visa Consultant — Visagate`
  const description =
    profile.bio?.slice(0, 160) ||
    `Connect with ${name}, a verified visa consultant on Visagate.pk. Book a consultation, view services, and read genuine client reviews.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : undefined,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ConsultantProfilePage({ params }: PageProps) {
  const { id } = params
  const supabase = await createClient()

  // 1. Fetch the consultant profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      display_name,
      business_name,
      city,
      avatar_url,
      cover_image_url,
      years_experience,
      bio,
      phone,
      verification_status,
      is_verified,
      is_oep_verified,
      is_secp_verified,
      is_beoe_verified,
      is_fbr_verified,
      languages,
      specializations,
      office_address,
      created_at
      `
    )
    .eq('id', id)
    .maybeSingle()

  if (profileError || !profile) {
    notFound()
  }

  // 2. Fetch services and reviews in parallel
  const [servicesResult, reviewsResult] = await Promise.all([
    supabase
      .from('services')
      .select(
        'id, title, description, visa_type, destination_country, price_min, price_max, processing_days, image_url, created_at'
      )
      .eq('consultant_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
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
      .eq('consultant_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const services = servicesResult.data ?? []
  const reviews = reviewsResult.data ?? []

  return (
    <ConsultantProfileClient
      profile={profile}
      services={services}
      reviews={reviews}
    />
  )
}