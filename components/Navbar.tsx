'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-sm' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">

          {/* Logo */}
<Link href="/" className="flex items-center shrink-0">
  <Image
    src="/logo.png"
    alt="VisaGate.pk"
    width={180}
    height={45}
    priority
    className="h-10 w-auto object-contain"
  />
</Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/consultants"
              className="font-body text-sm text-gray-600 hover:text-navy font-medium transition-colors"
            >
              Find Consultants
            </Link>
            <Link
              href="/visa-types"
              className="font-body text-sm text-gray-600 hover:text-navy font-medium transition-colors"
            >
              Visa Categories
            </Link>
            <Link
              href="/destinations"
              className="font-body text-sm text-gray-600 hover:text-navy font-medium transition-colors"
            >
              Destinations
            </Link>
            <Link
              href="/for-consultants"
              className="font-body text-sm text-gray-600 hover:text-navy font-medium transition-colors"
            >
              For Consultants
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="font-heading text-sm font-semibold text-navy px-4 py-2 rounded-lg hover:bg-navy-light transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register?role=consultant"
              className="font-heading text-sm font-semibold bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl transition-colors"
            >
              List Your Service
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-navy rounded-lg hover:bg-navy-light transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-1">
            {[
              { href: '/consultants', label: 'Find Consultants' },
              { href: '/visa-types', label: 'Visa Categories' },
              { href: '/destinations', label: 'Destinations' },
              { href: '/for-consultants', label: 'For Consultants' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 font-body text-sm text-gray-700 hover:text-navy hover:bg-navy-light rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/login"
                className="text-center font-heading text-sm font-semibold border border-navy text-navy py-2.5 rounded-xl"
              >
                Log In
              </Link>
              <Link
                href="/register?role=consultant"
                className="text-center font-heading text-sm font-semibold bg-gold text-white py-2.5 rounded-xl"
              >
                List Your Service
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}