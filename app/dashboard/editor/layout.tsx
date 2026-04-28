'use client'
// FILE: app/dashboard/editor/layout.tsx

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, FileText, MessageSquare,
  PenSquare, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/editor', icon: LayoutDashboard, exact: true },
  { label: 'Articles', href: '/dashboard/editor/insights', icon: FileText },
  { label: 'New Article', href: '/dashboard/editor/insights/editor', icon: PenSquare },
  { label: 'Comments', href: '/dashboard/editor/insights?tab=comments', icon: MessageSquare },
]

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: p } = await supabase
        .from('profiles')
        .select('role, display_name, avatar_url')
        .eq('user_id', session.user.id)
        .single()

      if (!p || (p.role !== 'editor' && p.role !== 'admin')) {
        router.push('/')
        return
      }
      setProfile(p)
    }
    init()
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

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#1B3060] text-white">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#C9A227] rounded-lg flex items-center justify-center text-white font-bold text-sm">VG</div>
          <div>
            <div className="text-sm font-bold font-['Plus_Jakarta_Sans']">VisaGate.pk</div>
            <div className="text-xs text-white/50">Editor Panel</div>
          </div>
        </Link>
      </div>

      {/* Profile */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C9A227]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.avatar_url
              ? <Image src={profile.avatar_url} alt="avatar" width={40} height={40} className="object-cover" />
              : <span className="text-[#C9A227] font-bold text-sm">{profile?.display_name?.[0]?.toUpperCase() || 'E'}</span>
            }
          </div>
          <div>
            <div className="text-sm font-semibold">{profile?.display_name || 'Editor'}</div>
            <div className="text-xs px-2 py-0.5 bg-[#C9A227]/20 text-[#C9A227] rounded-full inline-block capitalize">{profile?.role || 'editor'}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Insights</p>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href, item.exact)
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <item.icon size={17} />
            {item.label}
            {isActive(item.href, item.exact) && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link href="/insights" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <FileText size={17} /> View Public Insights
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-60 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 flex-shrink-0 flex flex-col"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-700" />
          </button>
          <span className="font-bold text-[#1B3060] text-sm font-['Plus_Jakarta_Sans']">Editor Panel</span>
          <div className="w-8" />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}