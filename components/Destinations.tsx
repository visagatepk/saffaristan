import Link from 'next/link'

const destinations = [
  { name: 'Canada', urdu: 'کینیڈا', flag: '🇨🇦', code: 'CA', count: '85 consultants' },
  { name: 'United Kingdom', urdu: 'برطانیہ', flag: '🇬🇧', code: 'GB', count: '92 consultants' },
  { name: 'United States', urdu: 'امریکہ', flag: '🇺🇸', code: 'US', count: '78 consultants' },
  { name: 'Australia', urdu: 'آسٹریلیا', flag: '🇦🇺', code: 'AU', count: '67 consultants' },
  { name: 'UAE', urdu: 'متحدہ عرب امارات', flag: '🇦🇪', code: 'AE', count: '110 consultants' },
  { name: 'Saudi Arabia', urdu: 'سعودی عرب', flag: '🇸🇦', code: 'SA', count: '95 consultants' },
]
export default function Destinations() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
            Popular Destinations
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-4">
            Where Do You Want to Go?
          </h2>
          <p className="font-urdu text-gold text-lg">آپ کہاں جانا چاہتے ہیں؟</p>
          <p className="font-body text-gray-500 mt-3 leading-relaxed">
            Explore consultants for the most popular destinations from Pakistan.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.name}
              href={`/consultants?destination=${encodeURIComponent(dest.name)}`}
              className="group relative bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gold/40 hover:bg-navy-light/40 transition-all overflow-hidden"
            >
              {/* Flag emoji as background decoration */}
              <div className="absolute -right-2 -top-2 text-6xl opacity-10 select-none">
                {dest.flag}
              </div>

              <div className="relative">
                <div className="w-10 h-7 bg-navy rounded flex items-center justify-center mb-3">
  <span className="font-heading font-bold text-white text-xs">{dest.code}</span>
</div>
                <h3 className="font-heading font-bold text-navy text-base mb-0.5">
                  {dest.name}
                </h3>
                <p className="font-urdu text-gold text-xs mb-2">{dest.urdu}</p>
                <p className="font-body text-gray-400 text-xs">
                  {dest.count}
                </p>
              </div>

              <div className="mt-4 font-heading text-xs font-semibold text-navy group-hover:text-gold transition-colors flex items-center gap-1">
                Explore <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}