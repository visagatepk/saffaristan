import Link from 'next/link'
import { GraduationCap, Briefcase, Users, Building2, Globe, Heart, ArrowRight } from 'lucide-react'

const categories = [
  { icon: GraduationCap, title: 'Student Visa', urdu: 'طالب علم ویزا', count: '120+ consultants', href: '/consultants?type=student', color: 'text-blue-600', bg: 'bg-blue-50', hoverBg: 'hover:bg-blue-600' },
  { icon: Briefcase, title: 'Work Permit', urdu: 'ورک پرمٹ', count: '95+ consultants', href: '/consultants?type=work', color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'hover:bg-emerald-600' },
  { icon: Users, title: 'Family Visa', urdu: 'خاندانی ویزا', count: '80+ consultants', href: '/consultants?type=family', color: 'text-purple-600', bg: 'bg-purple-50', hoverBg: 'hover:bg-purple-600' },
  { icon: Building2, title: 'Business Visa', urdu: 'کاروباری ویزا', count: '65+ consultants', href: '/consultants?type=business', color: 'text-orange-600', bg: 'bg-orange-50', hoverBg: 'hover:bg-orange-600' },
  { icon: Globe, title: 'Tourist Visa', urdu: 'سیاحتی ویزا', count: '110+ consultants', href: '/consultants?type=tourist', color: 'text-teal-600', bg: 'bg-teal-50', hoverBg: 'hover:bg-teal-600' },
  { icon: Heart, title: 'Umrah Visa', urdu: 'عمرہ ویزا', count: '45+ consultants', href: '/consultants?type=umrah', color: 'text-rose-600', bg: 'bg-rose-50', hoverBg: 'hover:bg-rose-600' },
]

export default function VisaCategories() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
            Explore Options
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-3">
            Choose Your Visa Type
          </h2>
          <p className="font-urdu text-gold text-lg mb-3">اپنا ویزا منتخب کریں</p>
          <p className="font-body text-gray-500 leading-relaxed">
            Browse consultants specialized in the visa category that matches your need.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link key={cat.title} href={cat.href}
              className="group flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5">

              <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105`}>
                <cat.icon size={24} className={cat.color} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-navy text-base group-hover:text-gold transition-colors duration-200">{cat.title}</h3>
                <p className="font-urdu text-gray-400 text-xs mt-0.5">{cat.urdu}</p>
                <p className="font-body text-gray-400 text-xs mt-1">{cat.count}</p>
              </div>

              <ArrowRight size={16} className="text-gray-300 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}