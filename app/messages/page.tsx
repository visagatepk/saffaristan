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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Not logged in — send to login, then back here after
    const returnUrl = searchParams.to
      ? `/messages?to=${searchParams.to}`
      : '/messages'
    redirect(`/login?redirect=${encodeURIComponent(returnUrl)}`)
  }

  // Get role to redirect to correct dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  const to = searchParams.to ? `?to=${searchParams.to}` : ''

  if (role === 'consultant') {
    redirect(`/dashboard/consultant/messages${to}`)
  }

  // Default: seeker
  redirect(`/dashboard/seeker/messages${to}`)
}