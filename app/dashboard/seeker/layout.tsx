'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Heart, CalendarCheck,
  MessageSquare, User, LogOut, Menu, X,
  ChevronRight, Bell, Settings, Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────────────────────
// Nav items — Settings now uses lucide Settings icon (was emoji string '⚙️'
// which crashed <Icon size={18} /> since a string can't be used as a component)
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard/seeker',              label: 'Overview',          icon: LayoutDashboard },
  { href: '/dashboard/seeker/saved',        label: 'Saved Consultants', icon: Heart },
  { href: '/dashboard/seeker/appointments', label: 'Appointments',      icon: CalendarCheck },
  { href: '/dashboard/seeker/messages',     label: 'Messages',          icon: MessageSquare },
  { href: '/dashboard/seeker/profile',      label: 'My Profile',        icon: User },  // ← ADD
  { href: '/dashboard/seeker/settings',     label: 'Settings',          icon: Settings },
]

export default function SeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile]         = useState<any>(null)
  const [userEmail, setUserEmail]     = useState('')
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserEmail(user.email || '')

      const { data } = await supabase
        .from('profiles')
        .select('full_name, display_name, avatar_url, role')
        .eq('user_id', user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'VS'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const avatarUrl   = profile?.avatar_url
    ? `${supabaseUrl}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null

  const displayName = profile?.full_name || profile?.display_name || 'Visa Seeker'
  const firstName   = displayName.split(' ')[0]
  const currentNav  = NAV_ITEMS.find(i => i.href === pathname)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>

        {/* Subtle grid pattern — matches site-wide design system */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Gold glow — bottom left */}
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        {/* Logo */}
        <div className="relative p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src="/logo-white.png"
                alt="VisaGate.pk"
                width={140}
                height={35}
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div className="relative p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading font-bold text-gold text-sm">
                  {getInitials(displayName)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-semibold text-white text-sm truncate">
                {displayName}
              </p>
              <p className="font-body text-white/40 text-xs truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
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
                <Icon
                  size={17}
                  className={isActive ? 'text-gold' : 'text-white/55'}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight size={13} className="text-white/40 shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="relative p-3 border-t border-white/10 space-y-0.5">
          <Link
            href="/consultants"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/55 hover:text-white hover:bg-white/6 transition-all duration-150"
          >
            <Search size={17} className="text-white/55" />
            Find Consultants
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/55 hover:text-red-400 hover:bg-white/6 transition-all duration-150"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-navy rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="font-heading font-bold text-navy text-base leading-tight">
                  {currentNav?.label || 'Dashboard'}
                </h2>
                <p className="font-body text-gray-400 text-xs">
                  Welcome back, {firstName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={18} />
              </button>
              <Link
                href="/consultants"
                className="hidden sm:flex font-body text-xs text-white bg-navy hover:bg-navy/80 px-3 py-1.5 rounded-lg transition-colors items-center gap-1.5"
              >
                <Search size={12} />
                Find Consultants
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}