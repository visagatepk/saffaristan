import { ShieldCheck, Star, MapPin, Zap } from 'lucide-react'

const badges = [
  {
    icon: <ShieldCheck size={20} className="text-navy" />,
    title: 'Verified by BEOE & SECP',
    urdu: 'تصدیق شدہ ایجنٹس',
  },
  {
    icon: <Star size={20} className="text-navy" />,
    title: 'Top-Rated Visa Experts',
    urdu: 'بہترین ماہرین',
  },
  {
    icon: <MapPin size={20} className="text-navy" />,
    title: 'All Over Pakistan',
    urdu: 'پورے پاکستان میں',
  },
  {
    icon: <Zap size={20} className="text-navy" />,
    title: 'Free to Use',
    urdu: 'مفت سروس',
  },
]

export default function TrustBadges() {
  return (
    <section className="bg-white border-b border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-navy-light hover:bg-navy-light/50 transition-all"
            >
              <div className="w-10 h-10 bg-navy-light rounded-lg flex items-center justify-center shrink-0">
                {badge.icon}
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-navy leading-tight">
                  {badge.title}
                </p>
                <p className="font-urdu text-gold text-xs mt-0.5">
                  {badge.urdu}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}