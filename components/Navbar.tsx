'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu, X, ChevronDown, User, LayoutDashboard,
  LogOut, Briefcase, Lightbulb
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSignupMenu, setShowSignupMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const signupMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false)
      if (signupMenuRef.current && !signupMenuRef.current.contains(e.target as Node)) setShowSignupMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const { data: prof } = await supabase
            .from('profiles')
            .select('role, full_name, display_name, avatar_url')
            .eq('user_id', session.user.id)
            .single()
          setProfile(prof)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(() => setLoading(false), 2000)
    loadUser().finally(() => clearTimeout(timeout))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const { data: prof } = await supabase
            .from('profiles')
            .select('role, full_name, display_name, avatar_url')
            .eq('user_id', session.user.id)
            .single()
          setProfile(prof)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
}, [])
// ADD this NEW useEffect after the existing one:
useEffect(() => {
  // Only re-check auth on navigation, not full reload
  if (pathname !== '/') {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
      }
    })
  }
}, [pathname])
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setShowUserMenu(false)
    router.push('/')
    router.refresh()
  }

  const getDashboardPath = () => {
    if (profile?.role === 'consultant') return '/dashboard/consultant'
    if (profile?.role === 'admin') return '/dashboard/admin'
    return '/dashboard/seeker'
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const displayName = profile?.display_name || profile?.full_name || user?.email?.split('@')[0] || 'User'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const avatarUrl = profile?.avatar_url
    ? `${supabaseUrl}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null

  const NAV_LINKS = [
    { href: '/consultants', label: 'Find Consultants' },
    { href: '/visa-categories', label: 'Visa Types' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/insights', label: 'Insights', isNew: true },
    { href: '/for-consultants', label: 'For Consultants' },
  ]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.08)]'
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo.png" alt="VisaGate.pk" width={160} height={40} priority className="h-9 w-auto" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-1.5 font-body text-sm text-gray-600 hover:text-navy font-medium transition-colors duration-200 relative group">
                {link.label}
                {link.isNew && <Lightbulb size={12} className="text-gold" />}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold rounded-full group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-2.5 min-w-[200px] justify-end">

            {/* Loading skeleton */}
            {loading && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-gray-200" />
                <div className="w-16 h-3.5 bg-gray-200 rounded" />
              </div>
            )}

            {/* Logged IN */}
            {!loading && user && profile && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 bg-gray-50 hover:bg-navy-light border border-gray-200 hover:border-navy/20 px-3 py-2 rounded-xl transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-navy flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <span className="font-heading font-bold text-white text-xs">{getInitials(displayName)}</span>
                    )}
                  </div>
                  <span className="font-heading font-semibold text-navy text-sm truncate max-w-[100px]">
                    {displayName}
                  </span>
                  {profile.role === 'consultant' && (
                    <span className="font-body text-xs bg-gold-light text-gold font-semibold px-1.5 py-0.5 rounded-full shrink-0">Pro</span>
                  )}
                  {profile.role === 'admin' && (
                    <span className="font-body text-xs bg-red-50 text-red-600 font-semibold px-1.5 py-0.5 rounded-full shrink-0">Admin</span>
                  )}
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 shrink-0 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-navy flex items-center justify-center shrink-0">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-heading font-bold text-white text-xs">{getInitials(displayName)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading font-bold text-navy text-sm truncate">{displayName}</p>
                          <p className="font-body text-gray-400 text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className={`inline-block mt-2 text-xs font-body font-semibold px-2 py-0.5 rounded-full capitalize ${
                        profile.role === 'consultant' ? 'bg-gold-light text-gold' :
                        profile.role === 'admin' ? 'bg-red-50 text-red-600' :
                        'bg-navy-light text-navy'
                      }`}>
                        {profile.role === 'consultant' ? 'Consultant' :
                         profile.role === 'admin' ? 'Administrator' : 'Visa Seeker'}
                      </span>
                    </div>

                    <div className="py-1.5">
                      <Link href={getDashboardPath()} onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-gray-600 hover:text-navy hover:bg-navy-light transition-colors">
                        <LayoutDashboard size={15} className="text-navy/50 shrink-0" /> Dashboard
                      </Link>
                      <Link href={`${getDashboardPath()}/profile`} onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-gray-600 hover:text-navy hover:bg-navy-light transition-colors">
                        <User size={15} className="text-navy/50 shrink-0" /> My Profile
                      </Link>
                      {profile.role === 'consultant' && (
                        <Link href="/dashboard/consultant/services" onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-gray-600 hover:text-navy hover:bg-navy-light transition-colors">
                          <Briefcase size={15} className="text-navy/50 shrink-0" /> My Services
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 py-1.5">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={15} className="shrink-0" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NOT logged in */}
            {!loading && !user && (
              <>
                <Link href="/login"
                  className="font-heading text-sm font-semibold text-navy px-4 py-2 rounded-xl hover:bg-navy-light transition-all duration-200">
                  Log In
                </Link>

                <div className="relative" ref={signupMenuRef}>
                  <button onClick={() => setShowSignupMenu(!showSignupMenu)}
                    className="font-heading text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 text-white hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                    Sign Up
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showSignupMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showSignupMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <p className="font-body text-xs text-gray-400 font-medium">Create a free account as</p>
                      </div>
                      <div className="py-1.5">
                        <Link href="/register/seeker" onClick={() => setShowSignupMenu(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-navy-light transition-colors group">
                          <div className="w-8 h-8 bg-navy-light group-hover:bg-navy rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                            <User size={14} className="text-navy group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="font-heading font-bold text-navy text-sm">Visa Seeker</p>
                            <p className="font-body text-gray-400 text-xs mt-0.5">Find & contact consultants</p>
                          </div>
                        </Link>
                        <Link href="/register/consultant" onClick={() => setShowSignupMenu(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gold-light transition-colors group">
                          <div className="w-8 h-8 bg-gold-light group-hover:bg-gold rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                            <Briefcase size={14} className="text-gold group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="font-heading font-bold text-navy text-sm">Consultant</p>
                            <p className="font-body text-gray-400 text-xs mt-0.5">List your services free</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-navy rounded-lg hover:bg-navy-light transition-colors">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 font-body text-sm text-gray-700 hover:text-navy hover:bg-navy-light rounded-xl transition-colors">
                {link.isNew && <Lightbulb size={13} className="text-gold" />}
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-100 space-y-2 mt-2">
              {!loading && user && profile ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-navy flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-heading font-bold text-white text-sm">{getInitials(displayName)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-heading font-bold text-navy text-sm">{displayName}</p>
                      <p className="font-body text-gray-400 text-xs capitalize">{profile.role}</p>
                    </div>
                  </div>
                  <Link href={getDashboardPath()} onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 font-body text-sm text-gray-700 hover:text-navy hover:bg-navy-light rounded-xl transition-colors">
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 font-body text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              ) : !loading && !user ? (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}
                    className="block text-center font-heading text-sm font-semibold border border-navy text-navy py-2.5 rounded-xl hover:bg-navy hover:text-white transition-colors">
                    Log In
                  </Link>
                  <Link href="/for-consultants" onClick={() => setIsOpen(false)}
  className="block px-4 py-2.5 text-sm font-medium text-[#C9A227] hover:bg-gray-50 rounded-xl">
  For Consultants
</Link>
                  <Link href="/register/seeker" onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 font-heading text-sm font-semibold bg-navy-light text-navy py-2.5 rounded-xl hover:bg-navy hover:text-white transition-colors">
                    <User size={15} /> Sign Up as Seeker
                  </Link>
                  <Link href="/register/consultant" onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 font-heading text-sm font-semibold text-white py-2.5 rounded-xl transition-colors"
                    style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                    <Briefcase size={15} /> List Your Service
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}