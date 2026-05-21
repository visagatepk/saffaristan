import Link from 'next/link'
import { Search, MessageSquare, FileCheck, Plane, ArrowRight } from 'lucide-react'

const steps = [
  { number: '01', icon: Search, title: 'Search & Compare', urdu: 'تلاش کریں', desc: 'Browse verified consultants by city, visa type or destination.' },
  { number: '02', icon: MessageSquare, title: 'Chat & Consult', urdu: 'مشاورت کریں', desc: 'Message directly. Ask questions before committing.' },
  { number: '03', icon: FileCheck, title: 'Book & Apply', urdu: 'درخواست دیں', desc: 'Book a consultation and track your application status.' },
  { number: '04', icon: Plane, title: 'Get Your Visa', urdu: 'ویزا حاصل کریں', desc: 'Receive expert guidance every step of the way.' },
]

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
            How It Works
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-3">
            Your Journey to a Successful Visa
          </h2>
          <p className="font-urdu text-gold text-lg mb-3">آپ کا کامیاب ویزہ کا سفر</p>
          <p className="font-body text-gray-500 text-base leading-relaxed">
            Get your visa approved in 4 simple steps — fast, transparent & reliable.
          </p>
        </div>

        {/* Steps with connector */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[calc(12.5%+32px)] right-[calc(12.5%+32px)] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative group">
                <div className="flex flex-col items-center">
                  <div className="relative z-10 w-16 h-16 bg-white border-2 border-gray-200 group-hover:border-gold group-hover:shadow-[0_0_0_4px_rgba(201,162,39,0.1)] rounded-2xl flex items-center justify-center mb-5 transition-all duration-300">
                    <step.icon size={24} className="text-navy group-hover:text-gold transition-colors duration-300" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-navy group-hover:bg-gold rounded-full flex items-center justify-center font-heading font-bold text-white text-xs transition-colors duration-300">
                      {i + 1}
                    </span>
                  </div>
                  <div className="text-center px-2">
                    <h3 className="font-heading font-bold text-navy text-base mb-1 group-hover:text-gold transition-colors duration-200">
                      {step.title}
                    </h3>
                    <p className="font-urdu text-gold text-sm mb-2">{step.urdu}</p>
                    <p className="font-body text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — links to /how-it-works page */}
        <div className="text-center mt-12">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 bg-[#1B3060] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#243d7a] transition-all duration-200 text-sm shadow-sm"
          >
            Watch Full Guides & Video Tutorials
            <ArrowRight size={18} />
          </Link>
          <p className="text-gray-400 text-xs mt-3">
            Step-by-step videos, scholarship resources & more
          </p>
        </div>

      </div>
    </section>
  )
}