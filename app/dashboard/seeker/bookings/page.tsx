'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarCheck, MapPin, Clock, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-green-50 text-green-700 border border-green-200',
  completed: 'bg-blue-50 text-blue-700 border border-blue-200',
  cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
}

export default function SeekerBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!prof) return

      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          consultant:consultant_id(
            id, display_name, business_name, city
          )
        `)
        .eq('seeker_id', prof.id)
        .order('created_at', { ascending: false })

      setBookings(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-navy text-xl mb-1">My Bookings</h1>
        <p className="font-body text-gray-500 text-sm">
          {bookings.length} consultation{bookings.length !== 1 ? 's' : ''} booked
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gold/30 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-heading font-bold text-navy text-base">
                    {b.consultant?.display_name || 'Visa Consultant'}
                  </h3>
                  {b.consultant?.business_name && (
                    <p className="font-body text-gray-500 text-xs mt-0.5">
                      {b.consultant.business_name}
                    </p>
                  )}
                  {b.consultant?.city && (
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                      <MapPin size={11} className="text-gold" />
                      {b.consultant.city}
                    </div>
                  )}
                </div>
                <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                  {b.status}
                </span>
              </div>

              {b.notes && (
                <p className="font-body text-gray-500 text-xs bg-gray-50 rounded-xl p-3 mb-3">
                  "{b.notes}"
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Clock size={11} />
                  {new Date(b.created_at).toLocaleDateString('en-PK', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
                {b.consultant?.id && (
                  <Link href={`/consultants/${b.consultant.id}`}
                    className="font-heading text-xs font-semibold text-navy border border-navy px-3 py-1.5 rounded-lg hover:bg-navy hover:text-white transition-colors">
                    View Consultant
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CalendarCheck size={36} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-navy text-lg mb-2">No bookings yet</h3>
          <p className="font-body text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            When you book a consultation, it will appear here so you can track its status.
          </p>
          <Link href="/consultants"
            className="font-heading font-bold text-sm bg-navy hover:bg-navy-dark text-white px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
            <Search size={15} /> Find a Consultant
          </Link>
        </div>
      )}
    </div>
  )
}