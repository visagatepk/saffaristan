import Link from 'next/link'
import Image from 'next/image'
import { Shield } from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Find Consultants',  href: '/consultants' },
    { label: 'Visa Categories',   href: '/visa-categories' },
    { label: 'Scholarships',      href: '/scholarships' },
      { label: 'Insights & Guides', href: '/insights' },
  ],
  Support: [
    { label: 'For Consultants', href: '/for-consultants' },
    { label: 'How It Works',    href: '/how-it-works' },
    { label: 'FAQs',            href: '/faqs' },
    { label: 'Contact Us',      href: '/contact' },
  ],
  Company: [
    { label: 'About Us',        href: '/about' },
    { label: 'Privacy Policy',  href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy relative overflow-hidden">

      {/* ── Layer 1: white grid lines — identical to hero pattern ────────── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Layer 2: gold glow — bottom-left (mirrors hero's top-right) ─── */}
      <div
        className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)',
          transform: 'translate(-25%, 25%)',
        }}
      />

      {/* ── All content sits above the two background layers ─────────────── */}
      <div className="relative">

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
                Pakistan&apos;s first verified visa consultant platform — built on trust,
                transparency and results.
              </p>
              <p className="font-urdu text-gold/60 text-sm mb-5">
                پاکستان کا پہلا ویزا کنسلٹنٹ پلیٹ فارم
              </p>

              {/* Social links */}
              <div className="flex items-center gap-2 mb-5">
                {/* Facebook */}
                <a href="https://www.facebook.com/visagatepk" target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold/20 text-white/50 hover:text-gold flex items-center justify-center transition-all duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Twitter / X */}
                <a href="https://www.twitter.com/visagatepk" target="_blank" rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold/20 text-white/50 hover:text-gold flex items-center justify-center transition-all duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a href="https://www.youtube.com/@visagatepk" target="_blank" rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold/20 text-white/50 hover:text-gold flex items-center justify-center transition-all duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a href="https://wa.me/923149354655" target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-gold/20 text-white/50 hover:text-gold flex items-center justify-center transition-all duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-body font-semibold px-3 py-1.5 rounded-full">
                  ✓ Registered with SECP & FBR
                </div>
              </div>
            </div>

            {/* Link columns */}
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
                    <span className="text-white/50 font-medium">Defaste (Pvt) Ltd</span>
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

      </div>{/* /relative content wrapper */}
    </footer>
  )
}