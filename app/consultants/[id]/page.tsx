// FILE: app/consultants/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ConsultantProfileClient from './ConsultantProfileClient'
import type { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('display_name, full_name, business_name, city, bio')
    .eq('id', params.id)
    .single()

  const name = data?.display_name || data?.full_name || 'Visa Consultant'
  const biz  = data?.business_name ? ` · ${data.business_name}` : ''
  const city = data?.city ? ` · ${data.city}` : ''

  return {
    title: `${name}${biz}${city} — VisaGate.pk`,
    description: data?.bio?.slice(0, 160) || `Book a visa consultation with ${name} on VisaGate.pk.`,
    openGraph: {
      title: `${name}${biz} — VisaGate.pk`,
      description: data?.bio?.slice(0, 160) || `Verified visa consultant${city}`,
      url: `https://visagate.pk/consultants/${params.id}`,
      siteName: 'VisaGate.pk',
      locale: 'en_PK',
      type: 'profile',
    },
  }
}

export default async function ConsultantProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase    = createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  const [
    { data: consultant },
    { data: services },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, user_id, display_name, full_name, business_name, bio, city, office_address, phone, whatsapp_number, years_experience, avatar_url, is_verified, verification_status, oep_license_number')
      .eq('id', params.id)
      .eq('role', 'consultant')
      .single(),

    supabase
      .from('services')
      .select('*')
      .eq('consultant_id', params.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),

    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, reviewer:reviewer_id(full_name, display_name)')
      .eq('consultant_id', params.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false }),
  ])

  if (!consultant) notFound()

  const avgRating = reviews && reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10
    : 0

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ConsultantProfileClient
        consultant={consultant as any}
        services={(services || []) as any}
        reviews={(reviews || []) as any}
        avgRating={avgRating}
        supabaseUrl={supabaseUrl}
      />
      <Footer />
    </div>
  )
}