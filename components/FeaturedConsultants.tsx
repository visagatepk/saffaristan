import Link from 'next/link'
import { MapPin, Star, Phone, BadgeCheck, Clock, TrendingUp } from 'lucide-react'

const consultants = [
  { id: 1, initials: 'AH', name: 'Ahmad Hassan', urduName: 'احمد حسن', title: 'UK Immigration Specialist', city: 'Lahore', experience: '10 yrs', rating: 5.0, reviews: 234, success: 98, price: 'PKR 3,500', responseTime: '1h', tags: ['Student Visa', 'UK', 'USA'], verified: true, recommended: false },
  { id: 2, initials: 'SM', name: 'Sara Malik', urduName: 'سارہ ملک', title: 'Canada PR Expert', city: 'Karachi', experience: '12 yrs', rating: 4.9, reviews: 98, success: 96, price: 'PKR 5,000', responseTime: '2h', tags: ['Business Visa', 'Canada', 'UK'], verified: true, recommended: true },
  { id: 3, initials: 'UK', name: 'Usman Kabir', urduName: 'عثمان کبیر', title: 'Australia Migration Agent', city: 'Islamabad', experience: '8 yrs', rating: 4.8, reviews: 76, success: 97, price: 'PKR 4,000', responseTime: '3h', tags: ['Family Visa', 'Australia'], verified: true, recommended: false },
]

export default function FeaturedConsultants() {
  return (
    <section className="bg-gray-50 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
          <div>
            <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
              Top Consultants
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-5 mb-2">Featured Consultants</h2>
            <p className="font-urdu text-gold text-lg">نمایاں کنسلٹنٹس</p>
          </div>
          <Link href="/consultants"
            className="font-heading text-sm font-semibold text-navy hover:text-gold transition-colors flex items-center gap-1 shrink-0">
            View all consultants →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {consultants.map((c) => (
            <div key={c.id}
              className={`bg-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 relative ${
                c.recommended
                  ? 'border-2 border-gold shadow-[0_8px_30px_rgba(201,162,39,0.15)]'
                  : 'border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
              }`}>

              {c.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="font-heading font-bold text-xs text-white px-3 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)' }}>
                    ★ Recommended
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white font-heading font-bold text-lg shrink-0">
                    {c.initials}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-navy text-base leading-tight">{c.name}</h3>
                    <p className="font-urdu text-gray-400 text-xs">{c.urduName}</p>
                  </div>
                </div>
                {c.verified && (
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                    <BadgeCheck size={11} /> Verified
                  </div>
                )}
              </div>

              <p className="font-body text-sm text-gray-500 mb-2">{c.title}</p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-body text-gray-400 mb-4">
                <span className="flex items-center gap-1"><MapPin size={11} className="text-gold" />{c.city}</span>
                <span className="flex items-center gap-1"><Clock size={11} />~{c.responseTime} response</span>
                <span className="flex items-center gap-1"><TrendingUp size={11} className="text-emerald-500" />{c.experience}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {c.tags.map(tag => (
                  <span key={tag} className="font-body text-xs font-medium bg-navy-light text-navy px-2.5 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-2 mb-5 p-3 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <Star size={12} className="text-gold fill-gold" />
                    <span className="font-heading font-bold text-navy text-sm">{c.rating}</span>
                  </div>
                  <p className="font-body text-gray-400 text-xs mt-0.5">({c.reviews})</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="font-heading font-bold text-navy text-sm">{c.success}%</p>
                  <p className="font-body text-gray-400 text-xs mt-0.5">Success</p>
                </div>
                <div className="text-center">
                  <p className="font-heading font-bold text-navy text-sm">{c.experience}</p>
                  <p className="font-body text-gray-400 text-xs mt-0.5">Exp</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-body text-xs text-gray-400">PKR </span>
                  <span className="font-heading font-bold text-gold text-lg">{c.price.replace('PKR ', '')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/consultants/${c.id}`}
                    className="font-heading text-xs font-bold text-navy border border-navy px-4 py-2 rounded-xl hover:bg-navy hover:text-white transition-all duration-200">
                    View Profile
                  </Link>
                  <button className="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                    <Phone size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}