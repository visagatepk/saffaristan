import Link from 'next/link'
import { MapPin, Star, Phone, BadgeCheck } from 'lucide-react'

const consultants = [
  {
    id: 1,
    initials: 'AH',
    name: 'Ahmed Hassan',
    urduName: 'احمد حسن',
    title: 'UK Immigration Specialist',
    city: 'Islamabad',
    experience: '10 yrs',
    rating: 4.9,
    reviews: 127,
    success: 98,
    price: 'PKR 5,000',
    tags: ['UK Student', 'UK Work'],
    verified: true,
  },
  {
    id: 2,
    initials: 'SM',
    name: 'Sara Malik',
    urduName: 'سارہ ملک',
    title: 'Canada PR Expert',
    city: 'Rawalpindi',
    experience: '8 yrs',
    rating: 4.8,
    reviews: 98,
    success: 96,
    price: 'PKR 8,000',
    tags: ['Canada PR', 'Express Entry'],
    verified: true,
  },
  {
    id: 3,
    initials: 'UK',
    name: 'Usman Khalid',
    urduName: 'عثمان خالد',
    title: 'Australia Migration Agent',
    city: 'Islamabad',
    experience: '12 yrs',
    rating: 4.7,
    reviews: 76,
    success: 94,
    price: 'PKR 6,000',
    tags: ['Australia Student', 'Skilled Worker'],
    verified: true,
  },
]

export default function FeaturedConsultants() {
  return (
    <section className="bg-gray-50 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
          <div>
            <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
              Top Rated
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-5 mb-2">
              Featured Consultants
            </h2>
            <p className="font-urdu text-gold text-lg"></p>
            <p className="font-body text-gray-500 mt-2">
            
            </p>
          </div>
          <Link
            href="/consultants"
            className="font-heading text-sm font-semibold text-navy hover:text-gold transition-colors flex items-center gap-1 shrink-0"
          >
            View All Consultants
            <span className="text-gold">→</span>
          </Link>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {consultants.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gold/30 hover:shadow-sm transition-all group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white font-heading font-bold text-lg shrink-0">
                    {c.initials}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-navy text-base leading-tight">
                      {c.name}
                    </h3>
                    <p className="font-urdu text-gray-400 text-xs">{c.urduName}</p>
                  </div>
                </div>
                {c.verified && (
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                    <BadgeCheck size={12} />
                    Verified
                  </div>
                )}
              </div>

              {/* Details */}
              <p className="font-body text-sm text-gray-500 mb-2">{c.title}</p>
              <div className="flex items-center gap-1 text-gray-400 text-xs font-body mb-4">
                <MapPin size={12} className="text-gold" />
                <span>{c.city}</span>
                <span className="mx-1.5">·</span>
                <span>{c.experience} experience</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-body text-xs font-medium bg-navy-light text-navy px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Rating + success */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-gold fill-gold" />
                  <span className="font-heading font-bold text-navy text-sm">
                    {c.rating}
                  </span>
                  <span className="font-body text-gray-400 text-xs">
                    ({c.reviews})
                  </span>
                </div>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="font-body text-gray-500 text-xs">
                  {c.success}% success rate
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-body text-xs text-gray-400">Starting from</span>
                  <div className="font-heading font-bold text-gold text-base">
                    {c.price}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/consultant/${c.id}`}
                    className="font-heading text-xs font-semibold text-navy border border-navy px-4 py-2 rounded-lg hover:bg-navy hover:text-white transition-colors"
                  >
                    View Profile
                  </Link>
                  <button className="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors shrink-0">
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