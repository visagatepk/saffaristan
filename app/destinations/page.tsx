export const metadata = {
  title: 'Visa Destinations — UK, Canada, UAE, Schengen & More',
  description: 'Find visa consultants for every destination. UK, Canada, USA, Australia, Schengen Europe, Gulf countries and more. 30+ countries covered.',
  openGraph: {
    title: 'Visa Destinations — Find Consultants Worldwide',
    description: 'UK, Canada, UAE, Schengen, Australia and 30+ destinations.',
    url: 'https://visagate.pk/destinations',
  },
  alternates: { canonical: 'https://visagate.pk/destinations' },
}

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowRight, Users, CheckCircle, Globe } from 'lucide-react'

const DESTINATION_GROUPS = [
  {
    region: 'Europe — Schengen Zone',
    urdu: 'یورپ — شینگن ممالک',
    description: 'Visit 27 European countries with a single Schengen visa',
    color: '#003399',
    bgClass: 'from-blue-900 to-indigo-800',
    countries: [
      { name: 'Germany', code: 'DE', color: '#000000', consultants: 45, visaTypes: ['Student', 'Work', 'Visit', 'Business'], popular: true },
      { name: 'France', code: 'FR', color: '#002395', consultants: 38, visaTypes: ['Student', 'Visit', 'Business'], popular: true },
      { name: 'Italy', code: 'IT', color: '#008C45', consultants: 32, visaTypes: ['Student', 'Visit', 'Work'], popular: false },
      { name: 'Spain', code: 'ES', color: '#AA151B', consultants: 28, visaTypes: ['Student', 'Visit', 'Work'], popular: false },
      { name: 'Netherlands', code: 'NL', color: '#AE1C28', consultants: 22, visaTypes: ['Student', 'Work', 'Business'], popular: false },
      { name: 'Sweden', code: 'SE', color: '#006AA7', consultants: 18, visaTypes: ['Student', 'Work'], popular: false },
      { name: 'Norway', code: 'NO', color: '#EF2B2D', consultants: 15, visaTypes: ['Student', 'Work'], popular: false },
      { name: 'Switzerland', code: 'CH', color: '#FF0000', consultants: 20, visaTypes: ['Student', 'Work', 'Business'], popular: false },
      { name: 'Poland', code: 'PL', color: '#DC143C', consultants: 12, visaTypes: ['Student', 'Work'], popular: false },
      { name: 'Portugal', code: 'PT', color: '#006600', consultants: 16, visaTypes: ['Student', 'Visit', 'Work'], popular: false },
      { name: 'Belgium', code: 'BE', color: '#EF3340', consultants: 14, visaTypes: ['Student', 'Work', 'Business'], popular: false },
      { name: 'Austria', code: 'AT', color: '#ED2939', consultants: 11, visaTypes: ['Student', 'Visit'], popular: false },
    ]
  },
  {
  region: 'United Kingdom & Ireland',
  urdu: 'برطانیہ اور آئرلینڈ',
  description: 'Study, work and settle in the UK, Scotland and Ireland',
  color: '#012169',
  bgClass: 'from-blue-950 to-blue-800',
  countries: [
    { name: 'United Kingdom', code: 'GB', color: '#012169', consultants: 92, visaTypes: ['Student', 'Work', 'Visit', 'Family', 'Business'], popular: true },
    { name: 'Scotland', code: 'SC', color: '#003F87', consultants: 34, visaTypes: ['Student', 'Work', 'Visit', 'Family'], popular: false },
    { name: 'Ireland', code: 'IE', color: '#169B62', consultants: 28, visaTypes: ['Student', 'Work', 'Visit', 'Business', 'Family'], popular: false },
  ]
},
  {
    region: 'North America',
    urdu: 'شمالی امریکہ',
    description: 'Top destinations for students, workers and immigrants',
    color: '#003F87',
    bgClass: 'from-slate-800 to-blue-900',
    countries: [
      { name: 'United States', code: 'US', color: '#3C3B6E', consultants: 78, visaTypes: ['Student', 'Work', 'Visit', 'Business', 'PR'], popular: true },
      { name: 'Canada', code: 'CA', color: '#D52B1E', consultants: 85, visaTypes: ['Student', 'PR', 'Work', 'Family', 'Business'], popular: true },
    ]
  },
  {
    region: 'Australia & New Zealand',
    urdu: 'آسٹریلیا اور نیوزی لینڈ',
    description: 'Skilled migration, student visas and PR pathways',
    color: '#00008B',
    bgClass: 'from-indigo-900 to-blue-800',
    countries: [
      { name: 'Australia', code: 'AU', color: '#00008B', consultants: 67, visaTypes: ['Student', 'Skilled Worker', 'PR', 'Family', 'Visit'], popular: true },
      { name: 'New Zealand', code: 'NZ', color: '#00247D', consultants: 28, visaTypes: ['Student', 'Work', 'PR', 'Visit'], popular: false },
    ]
  },
  {
    region: 'Gulf Countries (GCC)',
    urdu: 'خلیجی ممالک',
    description: 'Work visa and business opportunities in the Gulf',
    color: '#009A44',
    bgClass: 'from-green-900 to-emerald-800',
    countries: [
      { name: 'UAE', code: 'AE', color: '#009A44', consultants: 110, visaTypes: ['Work', 'Business', 'Visit', 'Golden Visa', 'Family'], popular: true },
      { name: 'Saudi Arabia', code: 'SA', color: '#006C35', consultants: 95, visaTypes: ['Work', 'Umrah', 'Visit', 'Business', 'Family'], popular: true },
      { name: 'Qatar', code: 'QA', color: '#8D1B3D', consultants: 45, visaTypes: ['Work', 'Business', 'Visit'], popular: false },
      { name: 'Kuwait', code: 'KW', color: '#007A3D', consultants: 38, visaTypes: ['Work', 'Business', 'Visit'], popular: false },
      { name: 'Oman', code: 'OM', color: '#DB161B', consultants: 32, visaTypes: ['Work', 'Visit', 'Business'], popular: false },
      { name: 'Bahrain', code: 'BH', color: '#CE1126', consultants: 25, visaTypes: ['Work', 'Business', 'Visit'], popular: false },
    ]
  },
  {
    region: 'Asia Pacific',
    urdu: 'ایشیا پیسیفک',
    description: 'Growing destinations for education and employment',
    color: '#CC0001',
    bgClass: 'from-red-900 to-rose-800',
    countries: [
      { name: 'Malaysia', code: 'MY', color: '#CC0001', consultants: 35, visaTypes: ['Student', 'Work', 'Visit', 'MM2H'], popular: false },
      { name: 'Japan', code: 'JP', color: '#BC002D', consultants: 28, visaTypes: ['Student', 'Work', 'Visit'], popular: false },
      { name: 'South Korea', code: 'KR', color: '#003478', consultants: 22, visaTypes: ['Student', 'Work', 'Visit'], popular: false },
      { name: 'Singapore', code: 'SG', color: '#EF3340', consultants: 30, visaTypes: ['Work', 'Business', 'Visit'], popular: false },
      { name: 'China', code: 'CN', color: '#DE2910', consultants: 18, visaTypes: ['Student', 'Business', 'Visit'], popular: false },
      { name: 'Turkey', code: 'TR', color: '#E30A17', consultants: 42, visaTypes: ['Student', 'Visit', 'Work', 'Business'], popular: true },
    ]
  },
  {
    region: 'South America',
    urdu: 'جنوبی امریکہ',
    description: 'Emerging opportunities for travel and immigration',
    color: '#009C3B',
    bgClass: 'from-green-800 to-teal-900',
    countries: [
      { name: 'Brazil', code: 'BR', color: '#009C3B', consultants: 12, visaTypes: ['Visit', 'Business', 'Student'], popular: false },
      { name: 'Argentina', code: 'AR', color: '#74ACDF', consultants: 10, visaTypes: ['Visit', 'Student', 'Work'], popular: false },
      { name: 'Colombia', code: 'CO', color: '#FCD116', consultants: 8, visaTypes: ['Visit', 'Business'], popular: false },
    ]
  },
]

const VISA_TYPE_COLORS: Record<string, string> = {
  'Student': 'bg-blue-50 text-blue-700 border-blue-200',
  'Work': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Visit': 'bg-gray-50 text-gray-600 border-gray-200',
  'PR': 'bg-purple-50 text-purple-700 border-purple-200',
  'Business': 'bg-orange-50 text-orange-700 border-orange-200',
  'Family': 'bg-pink-50 text-pink-700 border-pink-200',
  'Golden Visa': 'bg-amber-50 text-amber-700 border-amber-200',
  'Umrah': 'bg-teal-50 text-teal-700 border-teal-200',
  'Skilled Worker': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'MM2H': 'bg-violet-50 text-violet-700 border-violet-200',
}

export default function DestinationsPage() {
  const totalConsultants = DESTINATION_GROUPS.flatMap(g => g.countries).reduce((sum, c) => sum + c.consultants, 0)
  const totalCountries = DESTINATION_GROUPS.flatMap(g => g.countries).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

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
              Worldwide Destinations
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-white text-4xl lg:text-5xl mb-4 leading-tight">
            Where Do You Want to Go?
          </h1>
          <p className="font-urdu text-gold/80 text-xl mb-4">آپ کہاں جانا چاہتے ہیں؟</p>
          <p className="font-body text-white/60 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse verified visa consultants for any destination. From Schengen Europe to the Gulf, North America to Asia — we cover it all.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { num: `${totalCountries}+`, label: 'Countries Covered' },
              { num: `${totalConsultants}+`, label: 'Expert Consultants' },
              { num: '7', label: 'World Regions' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
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

        {/* Popular destinations quick links */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DESTINATION_GROUPS.flatMap(g => g.countries).filter(c => c.popular).map(c => (
              <Link key={c.name}
                href={`/consultants?destination=${encodeURIComponent(c.name)}`}
                className="group bg-white rounded-2xl border border-gray-100 p-4 text-center hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-heading font-extrabold text-xs mx-auto mb-3 shadow-sm"
                  style={{ background: c.color }}>
                  {c.code}
                </div>
                <p className="font-heading font-bold text-navy text-xs group-hover:text-gold transition-colors leading-tight">{c.name}</p>
                <p className="font-body text-gray-400 text-xs mt-1">{c.consultants} experts</p>
              </Link>
            ))}
          </div>
        </div>

        {/* All regions */}
        <div className="space-y-16">
          {DESTINATION_GROUPS.map((group) => (
            <div key={group.region}>

              {/* Region header */}
              <div className={`bg-gradient-to-r ${group.bgClass} rounded-2xl px-6 py-5 mb-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
                <div className="relative flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="font-heading font-bold text-white text-xl mb-0.5">{group.region}</h2>
                    <p className="font-urdu text-white/60 text-sm">{group.urdu}</p>
                    <p className="font-body text-white/50 text-xs mt-1">{group.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                      <p className="font-heading font-bold text-white text-lg">
                        {group.countries.reduce((s, c) => s + c.consultants, 0)}
                      </p>
                      <p className="font-body text-white/50 text-xs">Consultants</p>
                    </div>
                    <div className="text-center bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                      <p className="font-heading font-bold text-white text-lg">{group.countries.length}</p>
                      <p className="font-body text-white/50 text-xs">Countries</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Countries grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.countries.map((country) => (
                  <div key={country.name}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 group">

                    {/* Color top bar */}
                    <div className="h-1.5" style={{ background: country.color }} />

                    <div className="p-5">
                      {/* Country header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-heading font-extrabold text-sm shrink-0 shadow-sm"
                          style={{ background: country.color }}>
                          {country.code}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-navy text-base leading-tight group-hover:text-gold transition-colors duration-200">
                            {country.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Users size={11} className="text-gray-400" />
                            <span className="font-body text-gray-400 text-xs">
                              {country.consultants} verified consultants
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visa types */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {country.visaTypes.slice(0, 4).map(vt => (
                          <span key={vt}
                            className={`font-body text-xs font-medium px-2 py-0.5 rounded-full border ${VISA_TYPE_COLORS[vt] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {vt}
                          </span>
                        ))}
                        {country.visaTypes.length > 4 && (
                          <span className="font-body text-xs text-gray-400">
                            +{country.visaTypes.length - 4}
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <Link href={`/consultants?destination=${encodeURIComponent(country.name)}`}
                        className="w-full flex items-center justify-between font-heading font-bold text-xs text-navy border border-navy/20 bg-navy-light hover:bg-navy hover:text-white px-4 py-2.5 rounded-xl transition-all duration-200 group/btn">
                        <span>Find Consultants</span>
                        <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Schengen info banner */}
        <div className="mt-16 bg-white rounded-3xl border border-gray-100 p-8 lg:p-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-3 py-1 rounded-full">
                Important Info
              </span>
              <h3 className="font-heading font-bold text-navy text-2xl mt-4 mb-3">
                What is a Schengen Visa?
              </h3>
              <p className="font-urdu text-gold text-base mb-4">شینگن ویزا کیا ہے؟</p>
              <p className="font-body text-gray-500 text-sm leading-relaxed mb-5">
                A Schengen visa allows you to travel freely across 27 European countries with a single visa. It is one of the most sought-after visas for Pakistani travelers, students and business professionals.
              </p>
              <div className="space-y-3">
                {[
                  '27 countries — one single visa',
                  'Valid for up to 90 days in any 180-day period',
                  'Covers Germany, France, Italy, Spain & more',
                  'Apply through the embassy of your main destination',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-gold shrink-0" />
                    <span className="font-body text-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-navy rounded-2xl p-7 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
              <div className="relative">
                <p className="font-heading font-bold text-white text-4xl mb-2">27</p>
                <p className="font-body text-white/60 text-sm mb-6">Countries with one Schengen Visa</p>
                <div className="flex flex-wrap gap-1.5 justify-center mb-6">
                  {['DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'CH', 'AT', 'BE', 'PT', 'PL'].map(code => (
                    <span key={code} className="font-heading font-bold text-xs text-navy bg-white/90 px-2 py-1 rounded-lg">
                      {code}
                    </span>
                  ))}
                  <span className="font-body text-xs text-white/50 px-2 py-1">& 15 more</span>
                </div>
                <Link href="/consultants?destination=Germany"
                  className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white px-6 py-3 rounded-xl transition-all duration-200 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                  Find Schengen Consultants <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 bg-navy rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div className="relative">
            <h3 className="font-heading font-bold text-white text-2xl mb-3">
              Can't find your destination?
            </h3>
            <p className="font-body text-white/60 text-sm mb-6 max-w-md mx-auto">
              Our consultants handle visa applications for 50+ countries. Search by country name or contact us directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/consultants"
                className="font-heading font-bold text-sm text-white px-8 py-3.5 rounded-xl transition-all duration-200 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                Browse All Consultants
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