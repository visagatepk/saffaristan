import { Search, MessageSquare, FileCheck, Plane } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <Search size={26} className="text-navy" />,
    title: 'Search & Compare',
    urdu: 'تلاش کریں',
    desc: 'Browse verified consultants filtered by country, visa type, and city.',
  },
  {
    number: '02',
    icon: <MessageSquare size={26} className="text-navy" />,
    title: 'Chat & Consult',
    urdu: 'مشاورت کریں',
    desc: 'Message consultants directly. Ask questions before committing.',
  },
  {
    number: '03',
    icon: <FileCheck size={26} className="text-navy" />,
    title: 'Book & Apply',
    urdu: 'درخواست دیں',
    desc: 'Book a consultation, submit documents and track your application.',
  },
  {
    number: '04',
    icon: <Plane size={26} className="text-navy" />,
    title: 'Get Your Visa',
    urdu: 'ویزا حاصل کریں',
    desc: 'Receive expert guidance every step of the way to your destination.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest bg-gold-light px-4 py-1.5 rounded-full">
            How It Works
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl mt-6 mb-4">
            Your Journey to a Successful Visa
          </h2>
          <p className="font-urdu text-gold text-lg">
            کامیاب ویزا کا سفر
          </p>
          <p className="font-body text-gray-500 mt-3 leading-relaxed">
            Four simple steps to connect with the right consultant and get your visa approved.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%_-_12px)] w-6 h-px bg-gray-200 z-10" />
              )}

              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gold/30 hover:shadow-sm transition-all h-full">

                {/* Step number + icon */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-navy-light rounded-xl flex items-center justify-center group-hover:bg-navy transition-colors">
                    <div className="group-hover:[&>svg]:text-white transition-colors">
                      {step.icon}
                    </div>
                  </div>
                  <span className="font-heading font-extrabold text-3xl text-gray-100 group-hover:text-gold/30 transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-navy text-lg mb-1">
                  {step.title}
                </h3>
                <p className="font-urdu text-gold text-sm mb-3">
                  {step.urdu}
                </p>
                <p className="font-body text-gray-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}