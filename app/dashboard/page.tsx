// FILE: app/dashboard/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      const role = profile?.role
      if (role === 'admin')      router.push('/dashboard/admin')
      else if (role === 'editor')     router.push('/dashboard/editor')
      else if (role === 'consultant') router.push('/dashboard/consultant')
      else                            router.push('/dashboard/seeker')
    }
    redirect()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
    </div>
  )
}