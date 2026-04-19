import Link from 'next/link'

const destinations = [
  { name: 'Canada', urdu: 'کینیڈا', code: 'CA', count: '85', tags: ['PR & Family', 'High Success Rate'], color: '#D52B1E' },
  { name: 'United Kingdom', urdu: 'برطانیہ', code: 'GB', count: '92', tags: ['Study, Work & Visit', 'Fast Processing'], color: '#012169' },
  { name: 'United States', urdu: 'امریکہ', code: 'US', count: '78', tags: ['Study, Work & Visit', 'Multiple Categories'], color: '#3C3B6E' },
  { name: 'Australia', urdu: 'آسٹریلیا', code: 'AU', count: '67', tags: ['Skilled Migration', 'Family Sponsorship'], color: '#00008B' },
  { name: 'UAE', urdu: 'متحدہ عرب امارات', code: 'AE', count: '110', tags: ['Work & Business', 'Golden Visa'], color: '#009A44' },
  { name: 'Saudi Arabia', urdu: 'سعودی عرب', code: 'SA', count: '95', tags: ['Umrah & Work', 'Family Visit'], color: '#006C35' },
]

export default function Destinations() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
            Popular Destinations
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-3">
            Where Do You Want to Go?
          </h2>
          <p className="font-urdu text-gold text-lg mb-3">آپ کہاں جانا چاہتے ہیں؟</p>
          <p className="font-body text-gray-500 leading-relaxed">
            Explore visa opportunities for top countries preferred by Pakistanis.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {destinations.map((dest) => (
            <Link key={dest.name}
              href={`/consultants?destination=${encodeURIComponent(dest.name)}`}
              className="group relative rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden bg-white">

              {/* Top color accent */}
              <div className="h-1.5 w-full" style={{ background: dest.color }} />

              <div className="p-5">
                {/* Flag + code */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-heading font-extrabold text-sm shrink-0 shadow-sm"
                    style={{ background: dest.color }}>
                    {dest.code}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-navy text-base leading-tight group-hover:text-navy transition-colors">{dest.name}</h3>
                    <p className="font-urdu text-gray-400 text-xs">{dest.urdu}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1 mb-4">
                  {dest.tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dest.color }} />
                      <span className="font-body text-gray-500 text-xs">{tag}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-gray-400">{dest.count} consultants</span>
                  <span className="font-heading text-xs font-semibold text-navy group-hover:text-gold transition-colors flex items-center gap-1">
                    Explore <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}