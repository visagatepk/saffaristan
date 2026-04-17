import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const perks = [
  'Free profile listing — no credit card',
  'Reach thousands of visa seekers across Pakistan',
  'Showcase your BEOE registration & credentials',
  'Receive leads and manage bookings easily',
]

export default function ConsultantCTA() {
  return (
    <section className="bg-navy py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">

        <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold/10 border border-gold/20 px-4 py-1.5 rounded-full">
          For Consultants
        </span>

        <h2 className="font-heading font-extrabold text-white text-3xl lg:text-5xl mt-8 mb-4 leading-tight">
          Are You a Visa Consultant?
        </h2>
        <p className="font-urdu text-gold text-xl mb-4">
          کیا آپ ویزا کنسلٹنٹ ہیں؟
        </p>
        <p className="font-body text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          List your agency on VisaGate.pk for free and connect with
          thousands of verified visa seekers across Pakistan.
        </p>

        {/* Perks */}
        <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-12 text-left">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <CheckCircle size={16} className="text-gold shrink-0" />
              <span className="font-body text-white/75 text-sm">{perk}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register?role=consultant"
            className="font-heading font-bold text-base bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Register Now — It's Free
            <span>→</span>
          </Link>
          <Link
            href="/for-consultants"
            className="font-heading font-bold text-base border-2 border-white/20 text-white hover:border-white hover:bg-white/5 px-10 py-4 rounded-xl transition-colors"
          >
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