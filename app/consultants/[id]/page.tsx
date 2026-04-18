import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConsultantProfileClient from './ConsultantProfileClient'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('display_name, business_name, city, bio')
    .eq('id', params.id)
    .single()

  if (!data) return { title: 'Consultant Not Found' }

  return {
    title: `${data.display_name} — ${data.business_name} | VisaGate.pk`,
    description: data.bio || `Verified visa consultant in ${data.city}, Pakistan.`,
  }
}

export default async function ConsultantProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: consultant } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'consultant')
    .single()

  if (!consultant) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('consultant_id', params.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:reviewer_id(display_name, full_name, avatar_url)')
    .eq('consultant_id', params.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return (
    <ConsultantProfileClient
      consultant={consultant}
      services={services || []}
      reviews={reviews || []}
    />
  )
}