import { ShieldCheck, Star, MapPin, Zap } from 'lucide-react'

const badges = [
  { icon: ShieldCheck, title: 'Verified Consultants', urdu: 'تصدیق شدہ', sub: '100% Vetted', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Star, title: '10+ Visa Categories', urdu: 'ویزا اقسام', sub: 'All Major Types', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: MapPin, title: 'All Over Pakistan', urdu: 'پاکستان بھر', sub: 'Major Cities Covered', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Zap, title: 'Fast & Secure', urdu: 'تیز اور محفوظ', sub: 'End-to-End Support', color: 'text-purple-600', bg: 'bg-purple-50' },
]

export default function TrustBadges() {
  return (
    <section className="bg-white border-b border-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b) => (
            <div key={b.title}
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-navy/20 hover:bg-navy-light/30 transition-all duration-200 group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${b.bg} transition-transform duration-200 group-hover:scale-105`}>
                <b.icon size={20} className={b.color} />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-navy leading-tight">{b.title}</p>
                <p className="font-body text-gray-400 text-xs mt-0.5">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}