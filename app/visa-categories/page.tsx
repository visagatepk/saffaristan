export const metadata = {
  title: 'Visa Types & Categories for Pakistani Passport Holders 2026',
  description: 'Browse all visa types for Pakistani passport holders in 2026. Student visa, work permit, PR, family reunion, Umrah, business visa and more.',
  openGraph: {
    title: 'Visa Types & Categories 2026 for Pakistanis',
    description: 'Student, work, PR, visit, family, business and religious visa types.',
    url: 'https://visagate.pk/visa-categories',
  },
  alternates: { canonical: 'https://visagate.pk/visa-categories' },
}
import { BreadcrumbStructuredData } from '@/components/StructuredData'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle, Globe, Plane,
  GraduationCap, Briefcase, Heart, Building2,
  Users, Star, Zap, Shield
} from 'lucide-react'

// ── Entry Types Data ──
const ENTRY_TYPES = [
  {
    type: 'Visa-Free',
    access: '11+ Countries',
    color: 'bg-green-50 border-green-200 text-green-800',
    badgeColor: 'bg-green-500',
    icon: '✈️',
    destinations: 'Qatar (30 days), Dominica, Barbados, Haiti, Trinidad & Tobago, Rwanda',
  },
  {
    type: 'Visa on Arrival',
    access: '18+ Countries',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    badgeColor: 'bg-blue-500',
    icon: '🛬',
    destinations: 'Maldives, Nepal, Cambodia, Burundi, Madagascar, Sierra Leone',
  },
  {
    type: 'eTA / eVisa',
    access: 'Rapid Online',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    badgeColor: 'bg-purple-500',
    icon: '💻',
    destinations: 'Kenya, Sri Lanka, Seychelles (eTA), Turkey, Malaysia, Azerbaijan (e-Visa)',
  },
  {
    type: 'Sticker/Standard',
    access: 'Embassy Required',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    badgeColor: 'bg-amber-500',
    icon: '🏛️',
    destinations: 'USA, UK, Schengen Area (Europe), Canada, Australia',
  },
]

// ── Visa Categories ──
const VISA_CATEGORIES = [
  {
    key: 'visit',
    icon: Plane,
    title: 'Visit & Tourism',
    subtitle: 'Short-Term',
    urdu: 'وزٹ اور سیاحت',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    borderHover: 'hover:border-blue-300',
    popular: false,
    description: 'For visiting family, tourism, and short trips abroad.',
    types: [
      { name: 'Family Visit', demand: 'High', desc: 'High demand for those visiting relatives in the UK, UAE, or Canada.', destinations: ['UK', 'UAE', 'Canada', 'USA'] },
      { name: 'Business Visit', demand: 'Medium', desc: 'For attending conferences or trade meetings — common for Turkey and China.', destinations: ['Turkey', 'China', 'Germany', 'UAE'] },
      { name: 'Religious Tourism', demand: 'High', desc: 'Specifically for Umrah/Hajj (Saudi Arabia) and Ziaart (Iraq/Iran).', destinations: ['Saudi Arabia', 'Iraq', 'Iran'] },
      { name: 'Tourist Visa', demand: 'Medium', desc: 'General tourism visa for exploring new countries.', destinations: ['France', 'Italy', 'Spain', 'Malaysia'] },
    ]
  },
  {
    key: 'study',
    icon: GraduationCap,
    title: 'Study Visas',
    subtitle: 'Long-Term',
    urdu: 'تعلیمی ویزا',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    borderHover: 'hover:border-indigo-300',
    popular: true,
    description: 'For students pursuing education abroad — bachelor\'s, master\'s or PhD.',
    types: [
      { name: 'UK Student Route', demand: 'Very High', desc: 'Remains a top choice for Pakistani students.', destinations: ['UK', 'Scotland'] },
      { name: 'Schengen Study', demand: 'High', desc: 'Popular for Germany (zero tuition fees) and Italy.', destinations: ['Germany', 'Italy', 'France', 'Netherlands'] },
      { name: 'USA F-1 Visa', demand: 'High', desc: 'Requires intensive interview coaching — perfect for your consultants.', destinations: ['USA'] },
      { name: 'Australia/Canada Student', demand: 'Very High', desc: 'Often linked to future immigration points and PR pathways.', destinations: ['Australia', 'Canada'] },
    ]
  },
  {
    key: 'work',
    icon: Briefcase,
    title: 'Work & Skilled Migration',
    subtitle: 'Employment',
    urdu: 'ورک اور ہنرمند ہجرت',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    borderHover: 'hover:border-emerald-300',
    popular: true,
    description: 'For professionals seeking employment or skilled migration opportunities.',
    types: [
      { name: 'Gulf Work Permits', demand: 'Very High', desc: 'High demand for UAE, Saudi Arabia, Oman — most popular for Pakistanis.', destinations: ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman'] },
      { name: 'Canada Express Entry', demand: 'Very High', desc: 'Skilled Worker (Canada Express Entry), Australia (Subclass 189/190), and UK HealthCare Visa.', destinations: ['Canada', 'Australia', 'UK'] },
      { name: 'Digital Nomad Visas', demand: 'Growing', desc: 'Newer categories for countries like Portugal, Spain, and Malaysia.', destinations: ['Portugal', 'Spain', 'Malaysia'] },
      { name: 'UK Skilled Worker', demand: 'High', desc: 'For professionals with a job offer from a UK employer.', destinations: ['UK'] },
    ]
  },
  {
    key: 'pr',
    icon: Shield,
    title: 'PR & Permanent Residency',
    subtitle: 'Immigration',
    urdu: 'مستقل رہائش',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderHover: 'hover:border-purple-300',
    popular: true,
    description: 'Pathways to permanent residency and citizenship.',
    types: [
      { name: 'Canada PR', demand: 'Very High', desc: 'Express Entry, PNP and Family Class sponsorship routes.', destinations: ['Canada'] },
      { name: 'Australia PR', demand: 'High', desc: 'Skilled Independent (189) and Employer Nominated (186) visas.', destinations: ['Australia'] },
      { name: 'UK Settlement', demand: 'High', desc: 'Indefinite Leave to Remain (ILR) after 5 years on skilled visa.', destinations: ['UK'] },
      { name: 'New Zealand Residency', demand: 'Medium', desc: 'Skilled Migrant Category Resident Visa.', destinations: ['New Zealand'] },
    ]
  },
  {
    key: 'family',
    icon: Heart,
    title: 'Family & Spouse Visas',
    subtitle: 'Reunion',
    urdu: 'خاندانی ویزا',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    borderHover: 'hover:border-rose-300',
    popular: false,
    description: 'Reunite with family members living abroad.',
    types: [
      { name: 'Spouse/Partner Visa', demand: 'High', desc: 'For married couples — UK Spouse Visa, Canada Spousal Sponsorship.', destinations: ['UK', 'Canada', 'Australia'] },
      { name: 'Family Reunification', demand: 'High', desc: 'Schengen family reunion visas and USA Family-Based Green Card.', destinations: ['Germany', 'France', 'USA'] },
      { name: 'Child/Dependent Visa', demand: 'Medium', desc: 'For bringing children or dependents to join parents abroad.', destinations: ['UK', 'Canada', 'Australia', 'UAE'] },
    ]
  },
  {
    key: 'business',
    icon: Building2,
    title: 'Business & Investor Visas',
    subtitle: 'Commercial',
    urdu: 'کاروباری ویزا',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    borderHover: 'hover:border-orange-300',
    popular: false,
    description: 'For entrepreneurs, investors and business professionals.',
    types: [
      { name: 'UAE Golden Visa', demand: 'High', desc: '5-10 year residency for investors and talented professionals.', destinations: ['UAE'] },
      { name: 'UK Innovator Founder', demand: 'Medium', desc: 'For innovative business ideas endorsed by approved bodies.', destinations: ['UK'] },
      { name: 'Canada Start-Up Visa', demand: 'Medium', desc: 'PR pathway for entrepreneurs with innovative business ideas.', destinations: ['Canada'] },
      { name: 'Portugal Golden Visa', demand: 'Growing', desc: 'Investment-based residency with pathway to citizenship.', destinations: ['Portugal'] },
    ]
  },
  {
    key: 'religious',
    icon: Star,
    title: 'Religious & Umrah Visas',
    subtitle: 'Pilgrimage',
    urdu: 'مذہبی اور عمرہ ویزا',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    borderHover: 'hover:border-teal-300',
    popular: false,
    description: 'For Umrah, Hajj and other religious travel.',
    types: [
      { name: 'Umrah Visa', demand: 'Very High', desc: 'Saudi Arabia Umrah visa — year-round pilgrimages now available.', destinations: ['Saudi Arabia'] },
      { name: 'Hajj Visa', demand: 'Seasonal', desc: 'Annual pilgrimage — requires registration through official channels.', destinations: ['Saudi Arabia'] },
      { name: 'Ziaarat Visa', demand: 'Medium', desc: 'Religious tourism to holy sites in Iraq and Iran.', destinations: ['Iraq', 'Iran'] },
    ]
  },
]

const DEMAND_COLORS: Record<string, string> = {
  'Very High': 'bg-red-50 text-red-700 border-red-200',
  'High': 'bg-orange-50 text-orange-700 border-orange-200',
  'Medium': 'bg-blue-50 text-blue-700 border-blue-200',
  'Growing': 'bg-green-50 text-green-700 border-green-200',
  'Seasonal': 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function VisaCategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
// inside return:
<BreadcrumbStructuredData items={[
  { name: 'Home', url: 'https://visagate.pk' },
  { name: 'Visa Categories', url: 'https://visagate.pk/visa-categories' },
]} />
      {/* Hero */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-6">
            <Globe size={13} className="text-gold" />
            <span className="font-body text-xs font-semibold text-gold tracking-wide">
              2026 Update
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-white text-4xl lg:text-5xl mb-4 leading-tight">
            Visa Types & Categories
          </h1>
          <p className="font-urdu text-gold/80 text-xl mb-4">ویزا کی اقسام اور زمرے</p>
          <p className="font-body text-white/60 text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            As of 2026, the Pakistani passport has gained slightly more mobility. Browse all visa categories — from visit and study to work, PR and religious travel.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { num: '50+', label: 'Visa Types' },
              { num: '7', label: 'Categories' },
              { num: '300+', label: 'Expert Consultants' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-heading font-extrabold text-white text-2xl">{s.num}</div>
                  <div className="font-body text-white/50 text-xs mt-1">{s.label}</div>
                </div>
                {i < 2 && <div className="w-px h-6 bg-white/15" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {/* ── Entry Types Table ── */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-3 py-1 rounded-full">
              2026 Update
            </span>
            <h2 className="font-heading font-bold text-navy text-xl">
              Categories by Ease of Entry
            </h2>
          </div>

          <p className="font-body text-gray-500 text-sm mb-6 max-w-2xl">
            Pakistani passport holders can categorize their visa options by how easy it is to obtain entry. Here are the four main entry types:
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {ENTRY_TYPES.map((et) => (
              <div key={et.type}
                className={`rounded-2xl border p-5 ${et.color} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{et.icon}</span>
                  <div>
                    <h3 className="font-heading font-bold text-base leading-tight">{et.type}</h3>
                    <span className={`font-body text-xs font-semibold text-white px-2 py-0.5 rounded-full ${et.badgeColor}`}>
                      {et.access}
                    </span>
                  </div>
                </div>
                <p className="font-body text-xs leading-relaxed opacity-80">
                  {et.destinations}
                </p>
              </div>
            ))}
          </div>

          {/* Table view */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="font-heading font-bold text-sm px-5 py-3.5 text-left">Type</th>
                    <th className="font-heading font-bold text-sm px-5 py-3.5 text-left">Access Level</th>
                    <th className="font-heading font-bold text-sm px-5 py-3.5 text-left">Key Destinations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ENTRY_TYPES.map(et => (
                    <tr key={et.type} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span>{et.icon}</span>
                          <span className="font-heading font-bold text-navy text-sm">{et.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full border ${et.color}`}>
                          {et.access}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-body text-gray-600 text-xs">{et.destinations}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Specialized Visa Categories ── */}
        <div className="mb-6">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-3 py-1 rounded-full">
            Marketplace Categories
          </span>
          <h2 className="font-heading font-bold text-navy text-2xl mt-4 mb-2">
            Specialized Visa Types
          </h2>
          <p className="font-body text-gray-500 text-sm max-w-2xl">
            These are the specific visa types most popular in the Pakistani market. Find verified consultants for each category.
          </p>
        </div>

        <div className="space-y-8">
          {VISA_CATEGORIES.map((cat) => (
            <div key={cat.key} id={cat.key}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">

              {/* Category header */}
              <div className="flex items-center justify-between gap-4 p-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${cat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <cat.icon size={22} className={cat.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-navy text-xl">{cat.title}</h3>
                      <span className="font-body text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                        {cat.subtitle}
                      </span>
                      {cat.popular && (
                        <span className="font-body text-xs bg-gold-light text-gold font-semibold px-2.5 py-0.5 rounded-full border border-gold/20">
                          🔥 Popular
                        </span>
                      )}
                    </div>
                    <p className="font-urdu text-gold text-sm mt-0.5">{cat.urdu}</p>
                    <p className="font-body text-gray-500 text-sm mt-1">{cat.description}</p>
                  </div>
                </div>
                <Link href={`/consultants?type=${encodeURIComponent(cat.title)}`}
                  className="font-heading font-bold text-xs text-navy border border-navy/20 bg-navy-light hover:bg-navy hover:text-white px-4 py-2 rounded-xl transition-all duration-200 shrink-0 flex items-center gap-1.5">
                  Find Consultants <ArrowRight size={12} />
                </Link>
              </div>

              {/* Visa types grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 divide-x divide-y divide-gray-50">
                {cat.types.map((vt) => (
                  <div key={vt.name} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-heading font-bold text-navy text-sm leading-snug">{vt.name}</h4>
                      <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${DEMAND_COLORS[vt.demand] || DEMAND_COLORS.Medium}`}>
                        {vt.demand}
                      </span>
                    </div>
                    <p className="font-body text-gray-500 text-xs leading-relaxed mb-3">{vt.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {vt.destinations.slice(0, 3).map(dest => (
                        <Link key={dest}
                          href={`/consultants?destination=${encodeURIComponent(dest)}`}
                          className="font-body text-xs bg-navy-light text-navy hover:bg-navy hover:text-white px-2 py-0.5 rounded-full transition-colors">
                          {dest}
                        </Link>
                      ))}
                      {vt.destinations.length > 3 && (
                        <span className="font-body text-xs text-gray-400">+{vt.destinations.length - 3}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick navigation ── */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-heading font-bold text-navy text-base mb-4">Quick Navigation</h3>
          <div className="flex flex-wrap gap-2">
            {VISA_CATEGORIES.map(cat => (
              <a key={cat.key} href={`#${cat.key}`}
                className={`flex items-center gap-2 font-body text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 ${cat.bg} ${cat.color} hover:shadow-sm transition-all duration-200`}>
                <cat.icon size={14} />
                {cat.title}
              </a>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-8 bg-navy rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div className="relative">
            <h3 className="font-heading font-bold text-white text-2xl mb-3">
              Not sure which visa you need?
            </h3>
            <p className="font-body text-white/60 text-sm mb-6 max-w-md mx-auto">
              Our verified consultants will guide you through the right visa category for your specific situation — free initial advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/consultants"
                className="font-heading font-bold text-sm text-white px-8 py-3.5 rounded-xl transition-all duration-200 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                Find a Consultant Free →
              </Link>
              <Link href="/insights"
                className="font-heading font-bold text-sm text-white border-2 border-white/20 hover:border-white/50 px-8 py-3.5 rounded-xl transition-all duration-200">
                Read Visa Guides
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}