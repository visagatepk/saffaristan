'use client'
// FILE: app/dashboard/seeker/saved/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Heart, MapPin, BadgeCheck, Phone,
  Trash2, Search, ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function getInitials(name: string | null) {
  if (!name) return 'VC'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function SavedConsultants() {
  const [saved, setSaved]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()

        // ✅ getSession() — client side ke liye correct
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setLoading(false); return }

        // ✅ user_id se profile fetch karo
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        if (!prof) { setLoading(false); return }

        const { data, error: fetchError } = await supabase
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

        if (fetchError) {
          console.error('Saved consultants error:', fetchError)
          setError(fetchError.message)
        } else {
          setSaved(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Failed to load saved consultants')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRemove = async (savedId: string) => {
    const supabase = createClient()
    await supabase.from('saved_consultants').delete().eq('id', savedId)
    setSaved(prev => prev.filter(s => s.id !== savedId))
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-3xl">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="font-bold text-red-600 mb-1">Could not load saved consultants</p>
          <p className="text-red-400 text-sm font-mono">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-1">
            Saved Consultants
          </h1>
          <p className="text-gray-400 text-sm">
            {saved.length} consultant{saved.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Link href="/consultants"
          className="inline-flex items-center gap-2 font-bold text-sm text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
          <Search size={14} /> Find More
        </Link>
      </div>

      {saved.length > 0 ? (
        <div className="space-y-3">
          {saved.map(item => {
            const c = item.consultant
            if (!c) return null

            const avatarSrc = c.avatar_url
              ? c.avatar_url.startsWith('http')
                ? c.avatar_url
                : `${supabaseUrl}/storage/v1/object/public/avatars/${c.avatar_url}`
              : null

            const waNumber = (c.whatsapp_number || c.phone || '').replace(/\D/g, '')

            return (
              <div key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#C9A227]/30 hover:shadow-md transition-all duration-200 shadow-sm">
                <div className="flex items-start gap-4">

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1B3060] flex items-center justify-center shrink-0">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={c.display_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-white text-sm">{getInitials(c.display_name)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#1B3060] text-base leading-tight truncate">
                          {c.display_name}
                        </h3>
                        {c.business_name && (
                          <p className="text-gray-400 text-xs mt-0.5 truncate">{c.business_name}</p>
                        )}
                      </div>
                      {c.is_verified && (
                        <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          <BadgeCheck size={10} /> Verified
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-2">
                      {c.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} className="text-[#C9A227]" />{c.city}
                        </span>
                      )}
                      {c.years_experience > 0 && (
                        <span>{c.years_experience} yrs experience</span>
                      )}
                      <span className="text-gray-300">
                        Saved {new Date(item.created_at).toLocaleDateString('en-PK', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Bio */}
                    {c.bio && (
                      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{c.bio}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/consultants/${c.id}`}
                        className="inline-flex items-center gap-1.5 font-bold text-xs text-white bg-[#1B3060] hover:bg-[#243d7a] px-4 py-2 rounded-xl transition-colors">
                        View Profile <ArrowRight size={11} />
                      </Link>

                      <Link href={`/consultants/${c.id}?action=book`}
                        className="inline-flex items-center gap-1.5 font-bold text-xs text-[#1B3060] border border-[#1B3060]/25 hover:bg-[#1B3060] hover:text-white px-4 py-2 rounded-xl transition-colors">
                        Book
                      </Link>

                      {waNumber && (
                        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-colors"
                          title="WhatsApp">
                          <Phone size={13} />
                        </a>
                      )}

                      <button onClick={() => handleRemove(item.id)}
                        className="w-8 h-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-colors ml-auto"
                        title="Remove from saved">
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
        /* ── Empty state ── */
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-red-300" />
          </div>
          <h3 className="font-bold text-[#1B3060] text-lg mb-2">No saved consultants</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            Jab aap kisi consultant ko save karo ge, wo yahan appear hoga.
          </p>
          <Link href="/consultants"
            className="inline-flex items-center gap-2 font-bold text-sm text-white bg-[#1B3060] hover:bg-[#243d7a] px-6 py-3 rounded-xl transition-colors">
            <Search size={14} /> Browse Consultants
          </Link>
        </div>
      )}
    </div>
  )
}