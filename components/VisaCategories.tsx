import Link from 'next/link'
import {
  GraduationCap, Briefcase, Users, Building2,
  Globe, Heart, ArrowRight
} from 'lucide-react'

const categories = [
  {
    icon: <GraduationCap size={24} className="text-navy" />,
    title: 'Student Visa',
    urdu: 'طالب علم ویزا',
    count: '120+ consultants',
    href: '/consultants?type=student',
  },
  {
    icon: <Briefcase size={24} className="text-navy" />,
    title: 'Work Permit',
    urdu: 'ورک پرمٹ',
    count: '95+ consultants',
    href: '/consultants?type=work',
  },
  {
    icon: <Users size={24} className="text-navy" />,
    title: 'Family Visa',
    urdu: 'خاندانی ویزا',
    count: '80+ consultants',
    href: '/consultants?type=family',
  },
  {
    icon: <Building2 size={24} className="text-navy" />,
    title: 'Business Visa',
    urdu: 'کاروباری ویزا',
    count: '65+ consultants',
    href: '/consultants?type=business',
  },
  {
    icon: <Globe size={24} className="text-navy" />,
    title: 'Tourist Visa',
    urdu: 'سیاحتی ویزا',
    count: '110+ consultants',
    href: '/consultants?type=tourist',
  },
  {
    icon: <Heart size={24} className="text-navy" />,
    title: 'Umrah Visa',
    urdu: 'عمرہ ویزا',
    count: '45+ consultants',
    href: '/consultants?type=umrah',
  },
]

export default function VisaCategories() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
            Visa Categories
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-4">
            Choose Your Visa Type
          </h2>
          <p className="font-urdu text-gold text-lg">اپنا ویزا منتخب کریں</p>
          <p className="font-body text-gray-500 mt-3 leading-relaxed">
            Browse consultants specialized in the visa category that matches your need.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex items-center gap-5 p-6 bg-white border border-gray-100 rounded-2xl hover:border-gold/40 hover:bg-gold-light/30 transition-all"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-navy-light rounded-xl flex items-center justify-center shrink-0 group-hover:bg-navy transition-colors">
                <div className="group-hover:[&>svg]:text-white transition-colors">
                  {cat.icon}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-navy text-base">
                  {cat.title}
                </h3>
                <p className="font-urdu text-gold text-xs mt-0.5">
                  {cat.urdu}
                </p>
                <p className="font-body text-gray-400 text-xs mt-1">
                  {cat.count}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight
                size={16}
                className="text-gray-300 group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0"
              />
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}