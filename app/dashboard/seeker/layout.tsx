'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Heart, CalendarCheck,
  MessageSquare, User, LogOut, Menu, X,
  ChevronRight, Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard/seeker', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/seeker/saved', label: 'Saved Consultants', icon: Heart },
{ href: '/dashboard/seeker/appointments', label: 'Appointments', icon: CalendarCheck },
  { href: '/dashboard/seeker/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/seeker/profile', label: 'My Profile', icon: User },
  { label: 'Settings', href: '/dashboard/seeker/settings', icon: '⚙️' }
]

export default function SeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      // Get auth user (for email)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Store email from auth user
      setUserEmail(user.email || '')

      // Get profile data
      const { data } = await supabase
        .from('profiles')
        .select('*')
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

  const getInitials = (name: string | null) => {
    if (!name) return 'VS'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const avatarUrl = profile?.avatar_url
    ? `${supabaseUrl}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null

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

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>

        {/* Logo */}
        <div className="p-5 border-b border-white/10">
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
              className="lg:hidden text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile?.full_name || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading font-bold text-gold text-sm">
                  {getInitials(profile?.full_name)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold text-white text-sm truncate">
                {profile?.full_name || 'Visa Seeker'}
              </p>
              <p className="font-body text-white/40 text-xs truncate">
                {userEmail}
              </p>
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
          <Link
            href="/consultants"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard size={18} />
            Find Consultants
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-navy rounded-lg hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="font-heading font-bold text-navy text-base">
                  {NAV_ITEMS.find(i => i.href === pathname)?.label || 'Dashboard'}
                </h2>
                <p className="font-body text-gray-400 text-xs">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={18} />
              </button>
              <Link
                href="/consultants"
                className="font-body text-xs text-white bg-navy hover:bg-navy-dark px-3 py-1.5 rounded-lg transition-colors"
              >
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