'use client'
// FILE: app/dashboard/admin/consultants/[id]/services/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Trash2, Eye, EyeOff, Search,
  Briefcase, MapPin, Clock, AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Service {
  id: string
  consultant_id: string
  title: string
  description: string | null
  visa_type: string | null
  destination_country: string | null
  price_min: number | null
  price_max: number | null
  processing_days: number | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

interface ConsultantInfo {
  id: string
  display_name: string | null
  business_name: string | null
  city: string | null
}

export default function AdminConsultantServicesPage() {
  const params = useParams()
  const consultantId = params?.id as string

  const [consultant, setConsultant] = useState<ConsultantInfo | null>(null)
  const [services, setServices]     = useState<Service[]>([])
  const [loading, setLoading]       = useState(true)
  const [query, setQuery]           = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm]  = useState<string | null>(null)

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: cons }, { data: svc }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, business_name, city')
        .eq('id', consultantId)
        .maybeSingle(),
      supabase
        .from('services')
        .select('*')
        .eq('consultant_id', consultantId)
        .order('created_at', { ascending: false }),
    ])
    setConsultant(cons)
    setServices(svc || [])
    setLoading(false)
  }, [consultantId])

  useEffect(() => { if (consultantId) load() }, [consultantId, load])

  const toggleActive = async (service: Service) => {
    setActionLoading(service.id + '_toggle')
    await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s))
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id + '_delete')
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
    setDeleteConfirm(null)
    setActionLoading(null)
  }

  const filtered = services.filter(s =>
    !query ||
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.destination_country?.toLowerCase().includes(query.toLowerCase()) ||
    s.visa_type?.toLowerCase().includes(query.toLowerCase())
  )

  const consultantName = consultant?.display_name || 'Consultant'

  return (
    <div className="max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/admin/consultants"
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-heading font-extrabold text-[#1B3060] text-xl mb-0.5">
            {consultantName}'s Services
          </h1>
          <p className="text-gray-400 text-sm">
            {consultant?.business_name || ''}{consultant?.city ? ` · ${consultant.city}` : ''}
          </p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2.5 flex items-center gap-3 mb-5 max-w-md">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search services..."
          className="text-sm w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
      </div>

      {/* ── Loading / Empty / List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Briefcase size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-[#1B3060] text-base mb-1">No services found</p>
          <p className="text-gray-400 text-sm">
            {query ? 'Try a different search term' : 'This consultant has not added any services yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(service => (
            <div key={service.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all ${
                service.is_active ? 'border-gray-100' : 'border-gray-100 bg-gray-50/50 opacity-70'
              }`}>
              <div className="flex items-start gap-4">

                {/* Image / placeholder */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#EBF0F8] flex items-center justify-center shrink-0">
                  {service.image_url ? (
                    <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase size={20} className="text-[#1B3060]/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-[#1B3060] text-base">{service.title}</h3>
                      {service.description && (
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{service.description}</p>
                      )}
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      service.is_active
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {service.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
                    {service.visa_type && (
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{service.visa_type}</span>
                    )}
                    {service.destination_country && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-[#C9A227]" />{service.destination_country}
                      </span>
                    )}
                    {service.processing_days && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />{service.processing_days} days
                      </span>
                    )}
                    {(service.price_min || service.price_max) && (
                      <span className="font-bold text-[#1B3060]">
                        PKR {service.price_min?.toLocaleString() || 0}
                        {service.price_max && service.price_max !== service.price_min
                          ? ` – ${service.price_max.toLocaleString()}`
                          : ''}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(service)}
                      disabled={actionLoading === service.id + '_toggle'}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${
                        service.is_active
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}>
                      {service.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                      {actionLoading === service.id + '_toggle'
                        ? 'Saving…'
                        : service.is_active ? 'Hide from public' : 'Make active'}
                    </button>

                    <button onClick={() => setDeleteConfirm(service.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <h3 className="font-bold text-[#1B3060] text-center text-lg mb-1">Delete this service?</h3>
            <p className="text-gray-400 text-sm text-center mb-5">
              This service listing will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm + '_delete'}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-60">
                {actionLoading === deleteConfirm + '_delete' ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}