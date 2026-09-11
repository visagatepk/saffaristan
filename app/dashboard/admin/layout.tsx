'use client'
// FILE: app/dashboard/admin/layout.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, BadgeCheck,
  Star, LogOut, Menu, X, ChevronRight,
  Bell, Shield, FileText, ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard/admin',             label: 'Overview',     icon: LayoutDashboard },
  { href: '/dashboard/admin/consultants', label: 'Consultants',  icon: BadgeCheck },
  { href: '/dashboard/admin/users',       label: 'All Users',    icon: Users },
  { href: '/dashboard/admin/insights',    label: 'Insights',     icon: FileText },
  { href: '/dashboard/admin/reviews',     label: 'Reviews',      icon: Star },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminName, setAdminName]     = useState('')
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('role, full_name, display_name')
        .eq('user_id', session.user.id)
        .single()
      if (!data || data.role !== 'admin') { router.push('/'); return }
      setAdminName(data.full_name || data.display_name || 'Admin')
      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const currentNav = NAV_ITEMS.find(i => i.href === pathname)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Gold glow — bottom left */}
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#C9A227 0%,transparent 70%)', transform: 'translate(-30%,30%)' }}
        />
        {/* Red glow top right — admin accent */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#ef4444 0%,transparent 70%)', transform: 'translate(20%,-20%)' }}
        />

        {/* Logo */}
        <div className="relative p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image src="/logo-white.png" alt="VisaGate.pk" width={130} height={33} className="h-8 w-auto" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Admin badge */}
        <div className="relative p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={17} className="text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold text-white text-sm truncate">{adminName}</p>
              <span className="font-body text-xs font-bold text-red-400 uppercase tracking-wide">
                Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-150 ${
                  isActive
                    ? 'bg-white/12 text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                    : 'text-white/55 hover:text-white hover:bg-white/6'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-[#C9A227]' : 'text-white/55'} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={13} className="text-white/40 shrink-0" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="relative p-3 border-t border-white/10 space-y-0.5">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/55 hover:text-white hover:bg-white/6 transition-all duration-150">
            <ExternalLink size={17} className="text-white/55" />
            View Site
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/55 hover:text-red-400 hover:bg-white/6 transition-all duration-150">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-navy rounded-lg hover:bg-gray-100 transition-colors">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="font-heading font-bold text-navy text-base leading-tight">
                  {currentNav?.label || 'Admin Panel'}
                </h2>
                <p className="font-body text-gray-400 text-xs">VisaGate.pk Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={18} />
              </button>
              <Link href="/" target="_blank"
                className="hidden sm:flex font-body text-xs text-navy border border-navy px-3 py-1.5 rounded-lg hover:bg-navy hover:text-white transition-colors items-center gap-1.5">
                <ExternalLink size={12} /> View Site
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}