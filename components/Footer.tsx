import Link from 'next/link'
import Image from 'next/image'
import { Shield } from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Find Consultants', href: '/consultants' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Insights & Guides', href: '/insights' },
  ],
  Support: [
    { label: 'Help Center', href: '/contact' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy">

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/">
              <Image
                src="/logo-white.png"
                alt="VisaGate.pk"
                width={140}
                height={35}
                className="h-8 w-auto mb-5"
              />
            </Link>
            <p className="font-body text-white/50 text-xs leading-relaxed mb-3">
              Pakistan's first verified visa consultant platform — built on trust, transparency and results.
            </p>
            <p className="font-urdu text-gold/60 text-sm">
              پاکستان کا پہلا ویزا کنسلٹنٹ پلیٹ فارم
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-body font-semibold px-3 py-1.5 rounded-full">
                ✓ Registered with SECP & FBR
              </div>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-white text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-white/40 hover:text-white text-xs transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-gold/50" />
              <p className="font-body text-white/30 text-xs">
                © 2026 VisaGate.pk — Operated by{' '}
                <a href="https://www.defaste.com" target="_blank" rel="noopener noreferrer">
  <span className="text-white/50 font-medium">
    Defaste (Pvt) Ltd
  </span>
</a>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy"
                className="font-body text-white/30 hover:text-white text-xs transition-colors">
                Privacy Policy
              </Link>
              <span className="text-white/20">·</span>
              <Link href="/terms-of-service"
                className="font-body text-white/30 hover:text-white text-xs transition-colors">
                Terms of Service
              </Link>
              <span className="text-white/20">·</span>
              <Link href="/contact"
                className="font-body text-white/30 hover:text-white text-xs transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}