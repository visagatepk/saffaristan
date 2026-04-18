'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Menu, X, ChevronDown, User, LayoutDashboard,
  LogOut, Settings, UserPlus, Briefcase
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const router = useRouter()
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
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (signupMenuRef.current && !signupMenuRef.current.contains(e.target as Node)) {
        setShowSignupMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fetch auth state
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: prof } = await supabase
          .from('profiles')
          .select('role, full_name, display_name, avatar_url')
          .eq('user_id', user.id)
          .single()
        setProfile(prof)
      }
      setLoading(false)
    }
    getUser()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const { data: prof } = await supabase
          .from('profiles')
          .select('role, full_name, display_name, avatar_url')
          .eq('user_id', session.user.id)
          .single()
        setProfile(prof)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

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
    { href: '/visa-categories', label: 'Visa Categories' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/for-consultants', label: 'For Consultants' },
  ]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-sm' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="VisaGate.pk"
              width={160}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className="font-body text-sm text-gray-600 hover:text-navy font-medium transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : user && profile ? (
              // ── LOGGED IN ──
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 bg-gray-50 hover:bg-navy-light border border-gray-200 hover:border-navy/20 px-3 py-2 rounded-xl transition-all"
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-navy flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-heading font-bold text-white text-xs">
                        {getInitials(displayName)}
                      </span>
                    )}
                  </div>
                  <span className="font-heading font-semibold text-navy text-sm max-w-[100px] truncate">
                    {displayName}
                  </span>
                  {/* Role badge */}
                  {profile.role === 'consultant' && (
                    <span className="font-body text-xs bg-gold-light text-gold font-semibold px-1.5 py-0.5 rounded-full">
                      Pro
                    </span>
                  )}
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden z-50">
                    {/* Profile header */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="font-heading font-bold text-navy text-sm truncate">{displayName}</p>
                      <p className="font-body text-gray-400 text-xs truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                        profile.role === 'consultant'
                          ? 'bg-gold-light text-gold'
                          : 'bg-navy-light text-navy'
                      }`}>
                        {profile.role === 'consultant' ? 'Consultant' : 'Visa Seeker'}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <Link href={getDashboardPath()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-gray-600 hover:text-navy hover:bg-navy-light transition-colors">
                        <LayoutDashboard size={15} className="text-navy/50" />
                        Dashboard
                      </Link>
                      <Link href={`${getDashboardPath()}/profile`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-gray-600 hover:text-navy hover:bg-navy-light transition-colors">
                        <User size={15} className="text-navy/50" />
                        My Profile
                      </Link>
                      {profile.role === 'consultant' && (
                        <Link href="/dashboard/consultant/services"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-gray-600 hover:text-navy hover:bg-navy-light transition-colors">
                          <Briefcase size={15} className="text-navy/50" />
                          My Services
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 py-2">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ── NOT LOGGED IN ──
              <>
                <Link href="/login"
                  className="font-heading text-sm font-semibold text-navy px-4 py-2 rounded-xl hover:bg-navy-light transition-colors">
                  Log In
                </Link>

                {/* Sign Up dropdown */}
                <div className="relative" ref={signupMenuRef}>
                  <button
                    onClick={() => setShowSignupMenu(!showSignupMenu)}
                    className="font-heading text-sm font-semibold bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    Sign Up
                    <ChevronDown size={14} className={`transition-transform ${showSignupMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showSignupMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden z-50">
                      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <p className="font-body text-xs text-gray-400 font-medium">Create a free account as</p>
                      </div>
                      <div className="py-2">
                        <Link href="/register/seeker"
                          onClick={() => setShowSignupMenu(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-navy-light transition-colors group">
                          <div className="w-8 h-8 bg-navy-light group-hover:bg-navy rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                            <User size={14} className="text-navy group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="font-heading font-bold text-navy text-sm">Visa Seeker</p>
                            <p className="font-body text-gray-400 text-xs mt-0.5">Find & contact consultants</p>
                          </div>
                        </Link>
                        <Link href="/register/consultant"
                          onClick={() => setShowSignupMenu(false)}
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
              <Link key={link.href} href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 font-body text-sm text-gray-700 hover:text-navy hover:bg-navy-light rounded-xl transition-colors">
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-100 space-y-2 mt-2">
              {user && profile ? (
                <>
                  {/* Logged in mobile */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl mb-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-navy flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-heading font-bold text-white text-xs">
                          {getInitials(displayName)}
                        </span>
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
              ) : (
                <>
                  {/* Not logged in mobile */}
                  <Link href="/login" onClick={() => setIsOpen(false)}
                    className="block text-center font-heading text-sm font-semibold border border-navy text-navy py-2.5 rounded-xl hover:bg-navy hover:text-white transition-colors">
                    Log In
                  </Link>
                  <Link href="/register/seeker" onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 font-heading text-sm font-semibold bg-navy-light text-navy py-2.5 rounded-xl hover:bg-navy hover:text-white transition-colors">
                    <User size={15} /> Sign Up as Seeker
                  </Link>
                  <Link href="/register/consultant" onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 font-heading text-sm font-semibold bg-gold text-white py-2.5 rounded-xl hover:bg-gold-dark transition-colors">
                    <Briefcase size={15} /> List Your Service
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}