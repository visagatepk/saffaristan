'use client'
// FILE: app/dashboard/seeker/messages/page.tsx

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MessagingUI from '@/components/MessagingUI'

function MessagesContent() {
  const searchParams = useSearchParams()
  const toId = searchParams.get('to') ?? undefined
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }
      setUserId(session.user.id)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-130px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3060]" />
      </div>
    )
  }

  if (!userId) return null

  return (
    <MessagingUI
      currentUserId={userId}
      currentUserRole="seeker"
      initialConsultantId={toId}
    />
  )
}

export default function SeekerMessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-130px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3060]" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}