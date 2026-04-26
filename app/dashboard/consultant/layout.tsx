'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, User, Briefcase, CalendarCheck,
  MessageSquare, LogOut, Menu, X, ChevronRight,
  Bell, Settings
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard/consultant', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/consultant/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/consultant/services', label: 'Services', icon: Briefcase },
  { href: '/dashboard/consultant/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/dashboard/consultant/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/consultant/settings', label: 'Settings', icon: Settings },
]

export default function ConsultantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'VC'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-gray-500 text-sm">Loading dashboard...</p>
        </div>
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

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>

        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image src="/logo-white.png" alt="VisaGate.pk" width={140} height={35} className="h-8 w-auto" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/20 border border-gold/30 rounded-lg flex items-center justify-center text-gold font-heading font-bold text-sm shrink-0">
              {getInitials(profile?.display_name)}
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold text-white text-sm truncate">
                {profile?.display_name || 'Consultant'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {profile?.verification_status === 'active' ? (
                  <span className="text-green-400 text-xs font-body">Verified</span>
                ) : profile?.verification_status === 'pending_verification' ? (
                  <span className="text-amber-400 text-xs font-body">Pending</span>
                ) : (
                  <span className="text-gray-400 text-xs font-body">Not verified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/dashboard/consultant/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Settings size={18} /> Settings
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-navy rounded-lg hover:bg-gray-100">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="font-heading font-bold text-navy text-base">
                  {NAV_ITEMS.find(i => i.href === pathname)?.label || 'Dashboard'}
                </h2>
                <p className="font-body text-gray-400 text-xs">
                  {profile?.business_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Link href="/" className="font-body text-xs text-gray-400 hover:text-navy border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                View Site
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