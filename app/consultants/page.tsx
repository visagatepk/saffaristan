import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ConsultantsClient from './ConsultantsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Find Verified Visa Consultants in Pakistan',
  description: 'Browse 300+ verified visa consultants and immigration agents across Islamabad, Lahore, Karachi and all major Pakistani cities. Filter by destination, visa type and city.',
  alternates: { canonical: 'https://visagate.pk/consultants' },
  openGraph: {
    title: 'Find Verified Visa Consultants in Pakistan — VisaGate.pk',
    description: 'Browse 300+ verified visa consultants across Pakistan. Filter by city, destination and visa type.',
    url: 'https://visagate.pk/consultants',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'Find Verified Visa Consultants in Pakistan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Verified Visa Consultants in Pakistan — VisaGate.pk',
    description: 'Browse 300+ verified visa consultants across Pakistan.',
    images: ['https://visagate.pk/og-image.png'],
    creator: '@visagatepk',
  },
}

export default async function ConsultantsPage() {
  const supabase = createClient()

  const { data: services } = await supabase
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
    .limit(60)

return <ConsultantsClient initialServices={(services as any) || []} />}