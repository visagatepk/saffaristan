'use client'

import { useState, useEffect } from 'react'
import { Search, X, Users, BadgeCheck, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setUsers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchQuery = !query ||
      u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(query.toLowerCase()) ||
      u.city?.toLowerCase().includes(query.toLowerCase())
    return matchRole && matchQuery
  })

  const getInitials = (u: any) => {
    const name = u.display_name || u.full_name || ''
    if (!name) return 'U'
    return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const ROLE_COLORS: Record<string, string> = {
    consultant: 'bg-gold-light text-gold border-gold/20',
    seeker: 'bg-navy-light text-navy border-navy/20',
    admin: 'bg-red-50 text-red-600 border-red-200',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-navy text-xl mb-1">All Users</h1>
        <p className="font-body text-gray-500 text-sm">{users.length} registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-3 flex-1 max-w-xs">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search users..."
            className="font-body text-sm w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-gray-400" /></button>}
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
          {['all', 'seeker', 'consultant', 'admin'].map(role => (
            <button key={role} onClick={() => setRoleFilter(role)}
              className={`font-heading font-semibold text-xs px-3 py-1.5 rounded-lg transition-all capitalize ${
                roleFilter === role ? 'bg-navy text-white' : 'text-gray-500 hover:text-navy'
              }`}>
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['User', 'Role', 'City', 'Phone', 'Joined'].map(h => (
                  <th key={h} className="font-heading font-bold text-navy text-xs px-5 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center text-white font-heading font-bold text-xs shrink-0">
                        {getInitials(u)}
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-navy text-sm">
                          {u.display_name || u.full_name || 'Unknown'}
                        </p>
                        {u.business_name && (
                          <p className="font-body text-gray-400 text-xs">{u.business_name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                      ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-body text-gray-600 text-sm">{u.city || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-body text-gray-600 text-sm">{u.phone || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-body text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="font-body text-gray-400 text-sm">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}