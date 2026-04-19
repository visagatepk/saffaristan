import { Star, Quote } from 'lucide-react'

const testimonials = [
  { rating: 5, text: 'VisaGate.pk made my UK student visa process so smooth. The consultant guided me at every single step. Highly recommended!', name: 'Ayesha R.', city: 'Lahore', initials: 'AR', visa: 'UK Student Visa', highlight: 'so smooth' },
  { rating: 5, text: 'Very professional service. I got my Canada work permit within the expected timeline. Great support and transparent process.', name: 'Ali Khan', city: 'Karachi', initials: 'AK', visa: 'Canada Work Permit', highlight: 'transparent process' },
  { rating: 5, text: 'Best platform to find genuine visa consultants. Fast response and authentic guidance made all the difference.', name: 'Maryam S.', city: 'Islamabad', initials: 'MS', visa: 'Australia PR', highlight: 'authentic guidance' },
]

export default function Testimonials() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
            What Our Users Say
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-3">Success Stories</h2>
          <p className="font-urdu text-gold text-lg">ہمارے صارفین کیا کہتے ہیں</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name}
              className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-gold/20 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all duration-300 group relative overflow-hidden">

              {/* Quote decoration */}
              <div className="absolute top-5 right-5 text-gray-100 group-hover:text-gold/10 transition-colors duration-300">
                <Quote size={36} />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className={i < t.rating ? 'text-gold fill-gold' : 'text-gray-200'} />
                ))}
                <span className="font-heading font-bold text-navy text-sm ml-1">{t.rating}.0</span>
              </div>

              {/* Review text with highlight */}
              <p className="font-body text-gray-600 text-sm leading-relaxed mb-4">
                "{t.text.split(t.highlight).map((part, i, arr) => (
                  i < arr.length - 1
                    ? <span key={i}>{part}<mark className="bg-gold-light text-navy font-semibold px-0.5 rounded">{t.highlight}</mark></span>
                    : <span key={i}>{part}</span>
                ))}"
              </p>

              {/* Visa tag */}
              <span className="font-body text-xs font-semibold bg-navy-light text-navy px-3 py-1 rounded-full mb-5 inline-block">
                {t.visa}
              </span>

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white font-heading font-bold text-xs shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-heading font-bold text-navy text-sm">{t.name}</p>
                  <p className="font-body text-gray-400 text-xs">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}