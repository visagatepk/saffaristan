'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import MessagingUI from '@/components/MessagingUI'

export default function SeekerMessages() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    load()
  }, [])

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-heading font-bold text-navy text-xl mb-1">Messages</h1>
        <p className="font-body text-gray-500 text-sm">Chat with visa consultants</p>
      </div>
      <MessagingUI currentUserId={userId} currentUserRole="seeker" />
    </div>
  )
}