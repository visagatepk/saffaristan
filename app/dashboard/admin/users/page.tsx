'use client'
// FILE: app/dashboard/admin/users/page.tsx
// UPDATED: Added email column + unique validation hints

import { useState, useEffect } from 'react'
import {
  Search, X, Users, ShieldOff, Trash2,
  AlertCircle, CheckCircle, UserX, UserCheck, Mail
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ROLE_COLORS: Record<string, string> = {
  consultant: 'bg-amber-50 text-amber-700 border-amber-200',
  seeker: 'bg-blue-50 text-blue-700 border-blue-200',
  admin: 'bg-red-50 text-red-600 border-red-200',
  editor: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [suspendModal, setSuspendModal] = useState<any>(null)
  const [deleteModal, setDeleteModal] = useState<any>(null)
  const [suspendDays, setSuspendDays] = useState('7')
  const [suspendReason, setSuspendReason] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    const supabase = createClient()
    // Join with auth.users to get email — use profiles only (email stored in auth)
    // We fetch email from profiles if stored, otherwise show user_id hint
    const { data } = await supabase
      .from('profiles')
      .select('*, email')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSuspend = async () => {
    if (!suspendModal) return
    setActionLoading(suspendModal.user_id)
    const supabase = createClient()
    const until = new Date()
    until.setDate(until.getDate() + parseInt(suspendDays))
    const { error } = await supabase.from('profiles').update({
      is_suspended: true,
      suspended_reason: suspendReason,
      suspended_until: until.toISOString(),
    }).eq('user_id', suspendModal.user_id)
    if (error) { showToast('Failed to suspend user', 'error') }
    else {
      setUsers(prev => prev.map(u =>
        u.user_id === suspendModal.user_id ? { ...u, is_suspended: true } : u
      ))
      showToast(`${suspendModal.display_name || 'User'} suspended for ${suspendDays} days`)
    }
    setSuspendModal(null); setSuspendReason(''); setSuspendDays('7')
    setActionLoading(null)
  }

  const handleUnsuspend = async (user: any) => {
    setActionLoading(user.user_id)
    const supabase = createClient()
    await supabase.from('profiles').update({
      is_suspended: false, suspended_reason: null, suspended_until: null,
    }).eq('user_id', user.user_id)
    setUsers(prev => prev.map(u =>
      u.user_id === user.user_id ? { ...u, is_suspended: false } : u
    ))
    showToast(`${user.display_name || 'User'} unsuspended`)
    setActionLoading(null)
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setActionLoading(deleteModal.user_id)
    const supabase = createClient()
    await supabase.from('profiles').update({
      is_suspended: true,
      suspended_reason: 'Account removed by admin',
    }).eq('user_id', deleteModal.user_id)
    setUsers(prev => prev.filter(u => u.user_id !== deleteModal.user_id))
    showToast(`${deleteModal.display_name || 'User'} removed`)
    setDeleteModal(null); setActionLoading(null)
  }

  const handleRoleChange = async (user: any, newRole: string) => {
    setActionLoading(user.user_id + '_role')
    const supabase = createClient()
    await supabase.from('profiles').update({ role: newRole }).eq('user_id', user.user_id)
    setUsers(prev => prev.map(u =>
      u.user_id === user.user_id ? { ...u, role: newRole } : u
    ))
    showToast(`${user.display_name || 'User'} role → ${newRole}`)
    setActionLoading(null)
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchQuery = !query ||
      u.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase()) ||
      u.city?.toLowerCase().includes(query.toLowerCase()) ||
      u.phone?.includes(query)
    return matchRole && matchQuery
  })

  const getInitials = (u: any) => {
    const name = u.display_name || u.full_name || ''
    if (!name) return 'U'
    return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#1B3060]/20 border-t-[#1B3060] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[#1B3060] text-xl mb-1">All Users</h1>
        <p className="text-gray-500 text-sm">{users.length} registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: users.length, color: 'text-[#1B3060]' },
          { label: 'Seekers', value: users.filter(u => u.role === 'seeker').length, color: 'text-blue-600' },
          { label: 'Consultants', value: users.filter(u => u.role === 'consultant').length, color: 'text-amber-600' },
          { label: 'Editors', value: users.filter(u => u.role === 'editor').length, color: 'text-purple-600' },
          { label: 'Suspended', value: users.filter(u => u.is_suspended).length, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-3 flex-1 max-w-sm shadow-sm">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search name, email, phone..."
            className="text-sm w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
          {query && <button onClick={() => setQuery('')}><X size={14} className="text-gray-400" /></button>}
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          {['all', 'seeker', 'consultant', 'editor', 'admin'].map(role => (
            <button key={role} onClick={() => setRoleFilter(role)}
              className={`font-semibold text-xs px-3 py-1.5 rounded-lg transition-all capitalize ${
                roleFilter === role ? 'bg-[#1B3060] text-white' : 'text-gray-500 hover:text-[#1B3060]'
              }`}>
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['User', 'Email', 'Role', 'Status', 'City', 'Phone', 'Actions'].map(h => (
                  <th key={h} className="font-bold text-[#1B3060] text-xs px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.user_id} className={`hover:bg-gray-50 transition-colors ${u.is_suspended ? 'opacity-60' : ''}`}>

                  {/* User */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 ${u.is_suspended ? 'bg-gray-400' : 'bg-[#1B3060]'}`}>
                        {getInitials(u)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1B3060] text-sm whitespace-nowrap">
                          {u.display_name || u.full_name || 'Unknown'}
                        </p>
                        {u.business_name && (
                          <p className="text-gray-400 text-xs">{u.business_name}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Mail size={11} className="text-gray-400 shrink-0" />
                      {u.email || '—'}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3.5">
                    <select
                      value={u.role || 'seeker'}
                      onChange={e => handleRoleChange(u, e.target.value)}
                      disabled={actionLoading === u.user_id + '_role' || u.role === 'admin'}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                        ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-500 border-gray-200'
                      } ${u.role === 'admin' ? 'cursor-not-allowed' : ''}`}
                    >
                      <option value="seeker">seeker</option>
                      <option value="consultant">consultant</option>
                      <option value="editor">editor</option>
                      {u.role === 'admin' && <option value="admin">admin</option>}
                    </select>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                      u.is_suspended ? 'bg-red-100 text-red-600'
                      : u.verification_status === 'pending_verification' ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                      {u.is_suspended ? '⛔ Suspended'
                        : u.verification_status === 'pending_verification' ? '⏳ Pending'
                        : '✅ Active'}
                    </span>
                  </td>

                  {/* City */}
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{u.city || '—'}</td>

                  {/* Phone */}
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{u.phone || '—'}</td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    {u.role !== 'admin' ? (
                      <div className="flex items-center gap-2">
                        {u.is_suspended ? (
                          <button onClick={() => handleUnsuspend(u)} disabled={actionLoading === u.user_id}
                            className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium whitespace-nowrap">
                            <UserCheck size={13} /> Unsuspend
                          </button>
                        ) : (
                          <button onClick={() => setSuspendModal(u)} disabled={actionLoading === u.user_id}
                            className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors font-medium whitespace-nowrap">
                            <ShieldOff size={13} /> Suspend
                          </button>
                        )}
                        <button onClick={() => setDeleteModal(u)} disabled={actionLoading === u.user_id}
                          className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium">
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Suspend Modal */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <ShieldOff size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1B3060]">Suspend User</h3>
                <p className="text-gray-500 text-xs">{suspendModal.display_name || suspendModal.full_name} · {suspendModal.email}</p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Suspend for how many days?</label>
                <select value={suspendDays} onChange={e => setSuspendDays(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060]">
                  {['1','3','7','14','30','90','365'].map(d => (
                    <option key={d} value={d}>{d === '365' ? '1 year' : `${d} day${d !== '1' ? 's' : ''}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Reason (optional)</label>
                <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
                  placeholder="Why are you suspending this user?" rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3060] resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSuspendModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSuspend} disabled={!!actionLoading} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600">Suspend</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1B3060]">Remove User</h3>
                <p className="text-gray-500 text-xs">{deleteModal.email}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5 bg-gray-50 rounded-xl p-3">
              Remove <strong>{deleteModal.display_name || deleteModal.full_name || 'this user'}</strong>? Their account will be deactivated.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={!!actionLoading} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}