// FILE: app/messages/page.tsx
// Redirects /messages?to=UUID → /dashboard/seeker/messages?to=UUID
// Also handles unauthenticated users → login

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function MessagesRedirectPage({
  searchParams,
}: {
  searchParams: { to?: string }
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    const returnUrl = searchParams.to
      ? `/messages?to=${searchParams.to}`
      : '/messages'
    redirect(`/login?redirect=${encodeURIComponent(returnUrl)}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  const role = profile?.role
  const to = searchParams.to ? `?to=${searchParams.to}` : ''

  if (role === 'consultant') {
    redirect(`/dashboard/consultant/messages${to}`)
  }

  redirect(`/dashboard/seeker/messages${to}`)
}