'use client'
// FILE: app/dashboard/seeker/messages/page.tsx

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MessagingUI from '@/components/MessagingUI'

// ─────────────────────────────────────────────────────────────────────────────
// Shared spinner — matches dashboard design system
// ─────────────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-130px)]">
      <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner component — needs Suspense wrapper because it uses useSearchParams
// ─────────────────────────────────────────────────────────────────────────────
function MessagesContent() {
  const searchParams = useSearchParams()
  const toId         = searchParams.get('to') ?? undefined
  const router       = useRouter()

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

  if (loading) return <Spinner />
  if (!userId)  return null

  return (
    <MessagingUI
      currentUserId={userId}
      currentUserRole="seeker"
      initialConsultantId={toId}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page — Suspense required for useSearchParams in Next.js App Router
// ─────────────────────────────────────────────────────────────────────────────
export default function SeekerMessagesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <MessagesContent />
    </Suspense>
  )
}