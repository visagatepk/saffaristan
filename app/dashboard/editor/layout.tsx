'use client'
// FILE: app/dashboard/editor/layout.tsx

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, FileText, MessageSquare,
  PenSquare, LogOut, Menu, X, ChevronRight, Bell,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview',    href: '/dashboard/editor',                    icon: LayoutDashboard, exact: true },
  { label: 'Articles',    href: '/dashboard/editor/insights',           icon: FileText },
  { label: 'New Article', href: '/dashboard/editor/insights/editor',    icon: PenSquare },
  { label: 'Comments',    href: '/dashboard/editor/insights?tab=comments', icon: MessageSquare },
]

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [profile, setProfile]       = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading]         = useState(true)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: p } = await supabase
        .from('profiles')
        .select('role, display_name, full_name, avatar_url')
        .eq('user_id', session.user.id)
        .single()

      if (!p || (p.role !== 'editor' && p.role !== 'admin')) {
        router.push('/')
        return
      }
      setProfile(p)
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname?.startsWith(href.split('?')[0])
  }

  // [FIX] construct full avatar URL — avatar_url is stored as relative path
  const avatarSrc = profile?.avatar_url
    ? `${supabaseUrl}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null
  const displayName = profile?.display_name || profile?.full_name || 'Editor'
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const currentNav  = NAV_ITEMS.find(i => isActive(i.href, i.exact))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1B3060] text-white relative overflow-hidden">

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
        {/* [FIX] was font-['Plus_Jakarta_Sans'] */}
        <p className="font-body text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1.5">
          Editor Panel
        </p>
      </div>

      {/* Profile */}
      <div className="relative p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#C9A227]/20 border border-[#C9A227]/30 flex items-center justify-center shrink-0">
            {avatarSrc
              ? <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
              : <span className="font-heading font-bold text-[#C9A227] text-sm">{initials}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="font-heading font-semibold text-white text-sm truncate">{displayName}</p>
            <span className="font-body text-[10px] font-bold text-[#C9A227] uppercase tracking-wide capitalize">
              {profile?.role || 'editor'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <p className="font-body text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">
          Insights
        </p>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href, item.exact)
          const Icon   = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-150 ${
                active
                  ? 'bg-white/12 text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                  : 'text-white/55 hover:text-white hover:bg-white/6'
              }`}
            >
              {/* [FIX] active icon turns gold — matches all other dashboards */}
              <Icon size={17} className={active ? 'text-[#C9A227]' : 'text-white/55'} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={13} className="text-white/40 shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="relative p-3 border-t border-white/10 space-y-0.5">
        <Link href="/insights"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/55 hover:text-white hover:bg-white/6 transition-all duration-150">
          <FileText size={17} className="text-white/55" /> View Public Insights
        </Link>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/55 hover:text-red-400 hover:bg-white/6 transition-all duration-150">
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 shrink-0 flex-col">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 shrink-0 flex flex-col"><SidebarContent /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-navy rounded-lg hover:bg-gray-100 transition-colors">
                <Menu size={20} />
              </button>
              <div>
                {/* [FIX] was font-['Plus_Jakarta_Sans'] */}
                <h2 className="font-heading font-bold text-[#1B3060] text-base leading-tight">
                  {currentNav?.label || 'Editor Panel'}
                </h2>
                <p className="font-body text-gray-400 text-xs">VisaGate.pk Insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-[#1B3060] rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={18} />
              </button>
              <Link href="/insights" target="_blank"
                className="hidden sm:flex font-body text-xs text-[#1B3060] border border-[#1B3060]/20 px-3 py-1.5 rounded-lg hover:bg-[#1B3060] hover:text-white transition-colors items-center gap-1.5">
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}