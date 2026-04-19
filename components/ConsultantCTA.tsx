import Link from 'next/link'
import { CheckCircle, Users } from 'lucide-react'

const perks = [
  'Reach more clients · Grow your business',
  'Build your reputation · Free listing',
  'Connect with thousands of visa seekers',
  'Verified badge & priority placement',
]

export default function ConsultantCTA() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f1e3d 0%, #1B3060 60%, #0f1e3d 100%)' }}>

      {/* Pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Gold orb */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">

        <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest border border-gold/20 bg-gold/10 px-4 py-1.5 rounded-full">
          Get Started Today
        </span>

        <h2 className="font-heading font-extrabold text-white text-3xl lg:text-5xl mt-8 mb-4 leading-tight">
          Are You a Visa Consultant?
        </h2>
        <p className="font-urdu text-gold text-xl mb-3">کیا آپ ویزا کنسلٹنٹ ہیں؟</p>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex -space-x-2">
            {['AH', 'SM', 'UK', 'FZ'].map((i, idx) => (
              <div key={idx} className="w-8 h-8 rounded-full bg-navy border-2 border-white/20 flex items-center justify-center text-xs font-heading font-bold text-white">{i}</div>
            ))}
          </div>
          <span className="font-body text-white/60 text-sm">500+ consultants already trusted us</span>
        </div>

        <p className="font-body text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Join Pakistan's fastest-growing platform and connect with thousands of applicants looking for trusted visa experts.
        </p>

        {/* Perks */}
        <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-12 text-left">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <CheckCircle size={15} className="text-gold shrink-0" />
              <span className="font-body text-white/70 text-sm">{perk}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register/consultant"
            className="font-heading font-bold text-base text-white px-10 py-4 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #C9A227 0%, #a8861f 100%)', boxShadow: '0 8px 25px rgba(201,162,39,0.3)' }}>
            Register Now — It's Free →
          </Link>
          <Link href="/for-consultants"
            className="font-heading font-bold text-base border-2 border-white/20 text-white hover:border-white/50 hover:bg-white/5 px-10 py-4 rounded-xl transition-all duration-200">
            Learn More
          </Link>
        </div>

        <p className="font-urdu text-white/30 text-sm mt-8">
          مفت رجسٹریشن · تصدیق شدہ بیج · ہزاروں ویزا متلاشی
        </p>
      </div>
    </section>
  )
}