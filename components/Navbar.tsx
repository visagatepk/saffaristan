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

  // ── Scroll listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Close dropdowns on outside click ────────────────────────────────────
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

  // ── SINGLE auth effect — one client, one subscription ───────────────────
  useEffect(() => {
    const supabase = createClient()

    const loadProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', userId)
        .single()
      setProfile(data)
    }

    // 1. Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setShowUserMenu(false)
    router.push('/')
    router.refresh()
  }

  // ── Dashboard redirect based on role ────────────────────────────────────
  const getDashboardLink = () => {
    if (profile?.role === 'consultant') return '/dashboard/consultant'
    if (profile?.role === 'admin') return '/dashboard/admin'
    return '/dashboard/seeker'
  }

  const isActive = (path: string) => pathname === path

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/logo.png" alt="VisaGate" width={140} height={36} priority />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/consultants" className={`text-sm font-medium transition-colors ${
              isActive('/consultants') ? 'text-[#1B3060]' : 'text-gray-600 hover:text-[#1B3060]'
            }`}>
              Find Consultants
            </Link>
            <Link href="/insights" className={`text-sm font-medium transition-colors ${
              isActive('/insights') ? 'text-[#1B3060]' : 'text-gray-600 hover:text-[#1B3060]'
            }`}>
              Insights
            </Link>
            <Link href="/visa-categories" className={`text-sm font-medium transition-colors ${
              isActive('/visa-categories') ? 'text-[#1B3060]' : 'text-gray-600 hover:text-[#1B3060]'
            }`}>
              Visa Categories
            </Link>
            <Link href="/for-consultants" className={`text-sm font-medium transition-colors ${
              isActive('/for-consultants') ? 'text-[#1B3060]' : 'text-gray-600 hover:text-[#1B3060]'
            }`}>
              For Consultants
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              /* Logged-in user menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile?.full_name || 'User'}
                      width={34}
                      height={34}
                      className="rounded-full object-cover border-2 border-[#1B3060]"
                    />
                  ) : (
                    <div className="w-[34px] h-[34px] rounded-full bg-[#1B3060] flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-[#1B3060] truncate">
                        {profile?.full_name || user.email}
                      </p>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={15} className="text-[#1B3060]" />
                      Dashboard
                    </Link>
                    {profile?.role === 'consultant' && (
                      <Link
                        href="/dashboard/consultant/services"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Briefcase size={15} className="text-[#1B3060]" />
                        My Services
                      </Link>
                    )}
                    <Link
                      href="/insights"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Lightbulb size={15} className="text-[#1B3060]" />
                      Insights
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#1B3060] hover:text-[#243d7a] transition-colors"
                >
                  Log In
                </Link>

                {/* Sign Up dropdown */}
                <div className="relative" ref={signupMenuRef}>
                  <button
                    onClick={() => setShowSignupMenu(!showSignupMenu)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1B3060] px-4 py-2 rounded-xl hover:bg-[#243d7a] transition-colors"
                  >
                    Sign Up
                    <ChevronDown size={14} />
                  </button>
                  {showSignupMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link
                        href="/register/seeker"
                        onClick={() => setShowSignupMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={15} className="text-[#1B3060]" />
                        I'm a Visa Seeker
                      </Link>
                      <Link
                        href="/register/consultant"
                        onClick={() => setShowSignupMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Briefcase size={15} className="text-[#1B3060]" />
                        I'm a Consultant
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 shadow-lg">
          <Link href="/consultants" onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-gray-700 hover:text-[#1B3060] py-2">
            Find Consultants
          </Link>
          <Link href="/insights" onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-gray-700 hover:text-[#1B3060] py-2">
            Insights
          </Link>
          <Link href="/visa-categories" onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-gray-700 hover:text-[#1B3060] py-2">
            Visa Categories
          </Link>
          <Link href="/for-consultants" onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-gray-700 hover:text-[#1B3060] py-2">
            For Consultants
          </Link>
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link href={getDashboardLink()} onClick={() => setIsOpen(false)}
                className="block text-sm font-semibold text-[#1B3060] py-2">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="block w-full text-left text-sm font-medium text-red-600 py-2">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-[#1B3060] py-2">
                Log In
              </Link>
              <Link href="/register/seeker" onClick={() => setIsOpen(false)}
                className="block text-sm font-semibold text-white bg-[#1B3060] px-4 py-2.5 rounded-xl text-center">
                Sign Up as Seeker
              </Link>
              <Link href="/register/consultant" onClick={() => setIsOpen(false)}
                className="block text-sm font-semibold text-[#1B3060] border border-[#1B3060] px-4 py-2.5 rounded-xl text-center">
                Sign Up as Consultant
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}