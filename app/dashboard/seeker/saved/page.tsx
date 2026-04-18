'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MapPin, BadgeCheck, Phone, Trash2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SavedConsultants() {
  const [saved, setSaved] = useState<any[]>([])
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
        .from('saved_consultants')
        .select(`
          id, created_at,
          consultant:consultant_id(
            id, display_name, business_name, city,
            is_verified, avatar_url, years_experience,
            phone, whatsapp_number, bio
          )
        `)
        .eq('seeker_id', prof.id)
        .order('created_at', { ascending: false })

      setSaved(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleRemove = async (savedId: string) => {
    const supabase = createClient()
    await supabase.from('saved_consultants').delete().eq('id', savedId)
    setSaved(prev => prev.filter(s => s.id !== savedId))
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'VC'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-navy text-xl mb-1">Saved Consultants</h1>
          <p className="font-body text-gray-500 text-sm">
            {saved.length} consultant{saved.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Link href="/consultants"
          className="font-heading font-bold text-sm bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
          <Search size={15} /> Find More
        </Link>
      </div>

      {saved.length > 0 ? (
        <div className="space-y-4">
          {saved.map((item) => {
            const c = item.consultant
            if (!c) return null
            return (
              <div key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gold/30 transition-all">
                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white font-heading font-bold text-base shrink-0">
                    {getInitials(c.display_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-heading font-bold text-navy text-base leading-tight">
                          {c.display_name}
                        </h3>
                        {c.business_name && (
                          <p className="font-body text-gray-500 text-xs mt-0.5">{c.business_name}</p>
                        )}
                      </div>
                      {c.is_verified && (
                        <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                          <BadgeCheck size={11} /> Verified
                        </div>
                      )}
                    </div>

                    {c.city && (
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                        <MapPin size={11} className="text-gold" />
                        {c.city}
                        {c.years_experience > 0 && (
                          <span className="ml-2">· {c.years_experience} yrs exp</span>
                        )}
                      </div>
                    )}

                    {c.bio && (
                      <p className="font-body text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">
                        {c.bio}
                      </p>
                    )}

                    <p className="font-body text-gray-300 text-xs mb-3">
                      Saved {new Date(item.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>

                    <div className="flex items-center gap-2">
                      <Link href={`/consultants/${c.id}`}
                        className="font-heading text-xs font-bold bg-navy hover:bg-navy-dark text-white px-4 py-2 rounded-xl transition-colors">
                        View Profile
                      </Link>
                      {(c.whatsapp_number || c.phone) && (
                        
                          href={`https://wa.me/${(c.whatsapp_number || c.phone || '').replace(/\D/g, '')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-colors">
                          <Phone size={13} />
                        </a>
                      )}
                      <button onClick={() => handleRemove(item.id)}
                        className="w-8 h-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-colors ml-auto">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Heart size={36} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-navy text-lg mb-2">No saved consultants</h3>
          <p className="font-body text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            When you save a consultant from the listings, they'll appear here for quick access.
          </p>
          <Link href="/consultants"
            className="font-heading font-bold text-sm bg-navy hover:bg-navy-dark text-white px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2">
            <Search size={15} /> Browse Consultants
          </Link>
        </div>
      )}
    </div>
  )
}