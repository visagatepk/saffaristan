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

// ─────────────────────────────────────────────────────────────────────────────
// Nav links — single source of truth for desktop + mobile
// ─────────────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Find Consultants', href: '/consultants' },
  { label: 'Insights',         href: '/insights' },
  { label: 'Visa Categories',  href: '/visa-categories' },
  { label: 'How It Works',     href: '/how-it-works' },
  { label: 'Scholarships',     href: '/scholarships' },
  { label: 'For Consultants',  href: '/for-consultants' },
]

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

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()

    const loadProfile = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', userId)
          .single()
        setProfile(data)
      } catch {
        setProfile(null)
      }
    }

    // Safety net — if Supabase never responds (network/env issue),
    // stop the spinner after 3s and show guest buttons instead.
    const safetyTimeout = setTimeout(() => setLoading(false), 3000)

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        }
      } catch (err) {
        console.warn('Navbar: auth session error', err)
        setUser(null)
        setProfile(null)
      } finally {
        // KEY FIX: always runs — previously a throw would skip setLoading(false)
        // leaving the spinner stuck forever.
        clearTimeout(safetyTimeout)
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            setUser(session.user)
            await loadProfile(session.user.id)
          } else {
            setUser(null)
            setProfile(null)
          }
        } catch {
          setUser(null)
          setProfile(null)
        } finally {
          clearTimeout(safetyTimeout)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
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

  // Active page  → navy text + font-semibold (no underline)
  // Hover        → navy text + navy underline scales in from center
  const linkClass = (href: string) =>
    pathname === href
      ? 'text-[#1B3060] font-semibold'
      : 'text-gray-600 hover:text-[#1B3060] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#1B3060] after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-center'

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

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm relative pb-0.5 ${linkClass(href)}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
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
                    // Show initials from full_name or email — not a generic icon
                    <div className="w-[34px] h-[34px] rounded-full bg-[#1B3060] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {(
                          profile?.full_name?.[0] ||
                          user?.email?.[0] ||
                          'U'
                        ).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">
                    {/* Show first name, fall back to email username, then 'Account' */}
                    {profile?.full_name?.split(' ')[0] ||
                      user?.email?.split('@')[0] ||
                      'Account'}
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
                    <Link href={getDashboardLink()} onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <LayoutDashboard size={15} className="text-[#1B3060]" />
                      Dashboard
                    </Link>
                    {profile?.role === 'consultant' && (
                      <Link href="/dashboard/consultant/services" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Briefcase size={15} className="text-[#1B3060]" />
                        My Services
                      </Link>
                    )}
                    <Link href="/insights" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Lightbulb size={15} className="text-[#1B3060]" />
                      Insights
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <>
                <Link href="/login"
                  className="text-sm font-medium text-[#1B3060] hover:text-[#243d7a] transition-colors">
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
                      <Link href="/register/seeker" onClick={() => setShowSignupMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={15} className="text-[#1B3060]" />
                        I'm a Visa Seeker
                      </Link>
                      <Link href="/register/consultant" onClick={() => setShowSignupMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 shadow-lg">
          <div className="space-y-1 mb-4">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-[#C9A227]/10 text-[#C9A227] font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#1B3060]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <hr className="border-gray-100 mb-4" />

          {user ? (
            <div className="space-y-1">
              <Link href={getDashboardLink()} onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1B3060] hover:bg-gray-50">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login" onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1B3060]">
                Log In
              </Link>
              <Link href="/register/seeker" onClick={() => setIsOpen(false)}
                className="block text-sm font-semibold text-white bg-[#1B3060] px-4 py-2.5 rounded-xl text-center hover:bg-[#243d7a] transition-colors">
                Sign Up as Seeker
              </Link>
              <Link href="/register/consultant" onClick={() => setIsOpen(false)}
                className="block text-sm font-semibold text-[#1B3060] border border-[#1B3060] px-4 py-2.5 rounded-xl text-center hover:bg-[#1B3060] hover:text-white transition-colors">
                Sign Up as Consultant
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}