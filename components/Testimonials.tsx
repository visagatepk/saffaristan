import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    rating: 5,
    text: 'Found a verified UK consultant in just 2 days. Got my student visa approved on first try!',
    name: 'Ali R.',
    city: 'Lahore',
    initials: 'AR',
    visa: 'UK Student Visa',
  },
  {
    rating: 5,
    text: 'The chat feature let me compare 3 consultants before choosing. Saved me from a fraudulent agent.',
    name: 'Ayesha K.',
    city: 'Karachi',
    initials: 'AK',
    visa: 'Canada PR',
  },
  {
    rating: 4,
    text: 'Entire Canada PR process was handled professionally. Worth every penny spent on the consultation.',
    name: 'Hassan M.',
    city: 'Islamabad',
    initials: 'HM',
    visa: 'Canada PR',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
            Success Stories
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-4">
            What Our Users Say
          </h2>
          <p className="font-urdu text-gold text-lg">ہمارے صارفین کیا کہتے ہیں</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-gold/30 hover:bg-white hover:shadow-sm transition-all group relative"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-gray-100 group-hover:text-gold/20 transition-colors">
                <Quote size={32} />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < t.rating ? 'text-gold fill-gold' : 'text-gray-200'}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="font-body text-gray-600 text-sm leading-relaxed mb-6">
                "{t.text}"
              </p>

              {/* Visa tag */}
              <span className="font-body text-xs font-semibold bg-navy-light text-navy px-3 py-1 rounded-full mb-5 inline-block">
                {t.visa}
              </span>

              {/* User */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div className="w-9 h-9 bg-navy rounded-lg flex items-center justify-center text-white font-heading font-bold text-xs shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-heading font-semibold text-navy text-sm">
                    {t.name}
                  </p>
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