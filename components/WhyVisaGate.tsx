import { BadgeCheck, Star, Zap, Lock } from 'lucide-react'

const features = [
  { icon: BadgeCheck, title: 'Verified Consultants', urdu: 'تصدیق شدہ کنسلٹنٹس', desc: 'Every consultant is verified against BEOE & SECP records before listing.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Zap, title: 'Real-Time Updates', urdu: 'فوری اپڈیٹس', desc: 'Stay informed at every step with live tracking of your visa status.', color: 'text-gold', bg: 'bg-gold-light' },
  { icon: Star, title: 'Transparent Process', urdu: 'شفاف عمل', desc: 'Clear pricing, honest guidance, no hidden fees.', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Lock, title: 'Secure & Reliable', urdu: 'محفوظ اور قابل اعتماد', desc: 'Your data is safe with bank-level security protocols.', color: 'text-purple-600', bg: 'bg-purple-50' },
]

const stats = [
  { num: '500+', label: 'Active Consultants' },
  { num: '20+', label: 'Cities Covered' },
  { num: '50+', label: 'Visa Categories' },
  { num: '0', label: 'Hidden Charges' },
]

export default function WhyVisaGate() {
  return (
    <section className="bg-gray-50 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
              Why Choose Us
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-3">
              Why VisaGate.pk is <span className="text-gold">Different</span>
            </h2>
            <p className="font-urdu text-gold text-lg mb-4">ہم کیوں مختلف ہیں</p>
            <p className="font-body text-gray-500 leading-relaxed mb-10">
              Pakistan's most reliable immigration platform — built on transparency, verification and security.
            </p>

            <div className="space-y-4">
              {features.map((f) => (
                <div key={f.title}
                  className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gold/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200 group">
                  <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-200`}>
                    <f.icon size={18} className={f.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-heading font-bold text-navy text-sm">{f.title}</h3>
                      <span className="font-urdu text-gold text-xs">{f.urdu}</span>
                    </div>
                    <p className="font-body text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stats card */}
          <div className="bg-navy rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5"
              style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />

            <div className="relative">
              <div className="w-16 h-16 border-2 border-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(201,162,39,0.1)' }}>
                <BadgeCheck size={28} className="text-gold" />
              </div>
              <h3 className="font-heading font-bold text-white text-2xl text-center mb-2">Verified Platform</h3>
              <p className="font-urdu text-gold/70 text-base text-center mb-8">مکمل طور پر تصدیق شدہ</p>

              <div className="grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center hover:bg-white/10 transition-colors duration-200">
                    <div className="font-heading font-extrabold text-gold text-3xl mb-1">{s.num}</div>
                    <div className="font-body text-white/60 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}