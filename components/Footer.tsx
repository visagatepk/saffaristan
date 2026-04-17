import Link from 'next/link'
import Image from 'next/image'

const links = {
  Platform: ['Find Consultants', 'Visa Categories', 'Destinations', 'For Consultants'],
  Support: ['Help Center', 'Contact Us', 'Report Fraud', 'FAQs'],
  'Visa Types': ['Student Visa', 'Work Permit', 'Visit Visa', 'Business Visa'],
}

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Image
              src="/logo-white.png"
              alt="VisaGate.pk"
              width={150}
              height={38}
              className="h-9 w-auto mb-5"
            />
            <p className="font-body text-sm text-white/50 leading-relaxed max-w-xs mb-4">
              Pakistan's most trusted platform for finding verified immigration
              consultants. Safe, free and reliable.
            </p>
            <p className="font-urdu text-gold/60 text-sm">
              پاکستان کا پہلا ویزا کنسلٹنٹ پلیٹ فارم
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-body font-semibold px-3 py-1.5 rounded-full">
                ✓ Registered with SECP & BEOE
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="font-heading font-bold text-white text-sm mb-5">
                {heading}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="font-body text-sm text-white/50 hover:text-gold transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/30">
            © 2025 VisaGate.pk — All rights reserved
          </p>
          <p className="font-urdu text-xs text-white/25">
            تمام حقوق محفوظ ہیں
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="font-body text-xs text-white/30 hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="font-body text-xs text-white/30 hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}