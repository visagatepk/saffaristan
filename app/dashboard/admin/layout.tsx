'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, BadgeCheck,
  Star, LogOut, Menu, X, ChevronRight,
  Bell, Shield, FileText
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/consultants', label: 'Consultants', icon: BadgeCheck },
  { href: '/dashboard/admin/users', label: 'All Users', icon: Users },
  { href: '/dashboard/admin/insights', label: 'Insights', icon: FileText },
  { href: '/dashboard/admin/reviews', label: 'Reviews', icon: Star },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('user_id', user.id)
        .single()

      if (!data || data.role !== 'admin') {
        router.push('/')
        return
      }
      setAdminName(data.full_name || 'Admin')
      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

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

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`} style={{ background: 'linear-gradient(180deg, #0f1e3d 0%, #1B3060 100%)' }}>

        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image src="/logo-white.png" alt="VisaGate.pk" width={130} height={33} className="h-8 w-auto" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Admin badge */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 border border-red-400/30 rounded-lg flex items-center justify-center shrink-0">
              <Shield size={18} className="text-red-400" />
            </div>
            <div>
              <p className="font-heading font-bold text-white text-sm">{adminName}</p>
              <span className="font-body text-xs font-semibold text-red-400">
                Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}>
                <Icon size={18} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-navy rounded-lg hover:bg-gray-100">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="font-heading font-bold text-navy text-base">
                  {NAV_ITEMS.find(i => i.href === pathname)?.label || 'Admin Panel'}
                </h2>
                <p className="font-body text-gray-400 text-xs">VisaGate.pk Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={18} />
              </button>
              <Link href="/" target="_blank"
                className="font-body text-xs text-navy border border-navy px-3 py-1.5 rounded-lg hover:bg-navy hover:text-white transition-colors">
                View Site
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