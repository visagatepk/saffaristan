import { BadgeCheck, Star, Zap, Lock } from 'lucide-react'

const features = [
  {
    icon: <BadgeCheck size={18} className="text-gold" />,
    title: 'Verified Consultants',
    urdu: 'تصدیق شدہ کنسلٹنٹس',
    desc: 'Every consultant is verified against BEOE & SECP records before listing.',
  },
  {
    icon: <Star size={18} className="text-gold" />,
    title: 'Genuine Reviews',
    urdu: 'حقیقی جائزے',
    desc: 'Only real clients can leave reviews. No fake ratings, ever.',
  },
  {
    icon: <Zap size={18} className="text-gold" />,
    title: 'Free to Use',
    urdu: 'بالکل مفت',
    desc: 'Browse, compare and contact consultants at zero cost to you.',
  },
  {
    icon: <Lock size={18} className="text-gold" />,
    title: 'Secure Messaging',
    urdu: 'محفوظ پیغام رسانی',
    desc: 'Chat securely with consultants before sharing any documents.',
  },
]

export default function WhyVisaGate() {
  return (
    <section className="bg-gray-50 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div>
            <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
              Why Choose Us
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-3">
              Why VisaGate.pk is{' '}
              <span className="text-gold">Different</span>
            </h2>
            <p className="font-urdu text-gold text-lg mb-4">
              ہم کیوں مختلف ہیں
            </p>
            <p className="font-body text-gray-500 leading-relaxed mb-10">
              Pakistan's most reliable immigration platform — built on transparency,
              verification and security. We make sure you never get scammed.
            </p>

            <div className="space-y-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gold/30 transition-all"
                >
                  <div className="w-10 h-10 bg-gold-light rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-heading font-bold text-navy text-sm">
                        {f.title}
                      </h3>
                      <span className="font-urdu text-gold text-xs">
                        {f.urdu}
                      </span>
                    </div>
                    <p className="font-body text-gray-500 text-sm leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stats card */}
          <div className="bg-navy rounded-3xl p-10 text-center">
            <div className="w-20 h-20 bg-gold/10 border-2 border-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="font-heading font-extrabold text-gold text-2xl">
                100%
              </span>
            </div>
            <h3 className="font-heading font-bold text-white text-2xl mb-2">
              Verified Platform
            </h3>
            <p className="font-urdu text-gold/80 text-base mb-8">
              مکمل طور پر تصدیق شدہ
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '500+', label: 'Verified Consultants' },
                { num: '20+', label: 'Cities Covered' },
                { num: '50+', label: 'Countries' },
                { num: '0', label: 'Fraud Cases' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="font-heading font-extrabold text-gold text-2xl">
                    {stat.num}
                  </div>
                  <div className="font-body text-white/60 text-xs mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}