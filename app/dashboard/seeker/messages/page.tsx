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

  const [userId, setUserId]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let resolved = false

    // ✅ FIX: try/catch/finally ensures setLoading(false) ALWAYS runs,
    //    even if getSession() rejects/hangs (known LockManager issue
    //    when multiple tabs call getSession at the same time).
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (resolved) return
        if (!session) {
          router.replace('/login')
          return
        }
        setUserId(session.user.id)
      } catch (err) {
        console.error('[SeekerMessages] getSession failed:', err)
      } finally {
        if (!resolved) setLoading(false)
      }
    }
    init()

    // ✅ Safety net: onAuthStateChange fires reliably even when the
    //    initial getSession() call hangs due to the LockManager bug.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      resolved = true
      if (session?.user) {
        setUserId(session.user.id)
      } else {
        setUserId(null)
      }
      setLoading(false)
    })

    // ✅ Hard timeout — never let the page spin forever
    const timeout = setTimeout(() => setLoading(false), 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  if (loading) return <Spinner />
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-130px)] text-center px-6">
        <div>
          <p className="font-heading font-bold text-navy text-lg mb-2">Please log in</p>
          <p className="font-body text-gray-400 text-sm">You need to be signed in to view messages.</p>
        </div>
      </div>
    )
  }

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