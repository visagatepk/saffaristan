'use client'
import { useState } from 'react'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface FaqItem {
  q: string
  a: string
}

interface FaqSection {
  category: string
  icon: string
  items: FaqItem[]
}

const FAQS: FaqSection[] = [
  {
    category: 'About VisaGate',
    icon: '🏛️',
    items: [
      {
        q: 'What is VisaGate.pk?',
        a: 'VisaGate.pk is Pakistan first verified visa consultant platform. We connect visa seekers with government-verified immigration consultants and agents across Pakistan, making the visa application process transparent, safe, and easy.',
      },
      {
        q: 'Is VisaGate.pk an official government service?',
        a: 'No. VisaGate.pk is a private platform operated by Defaste (Pvt) Ltd. We verify consultants against government registries (OEP, SECP, BEOE, FBR) but we are not affiliated with any government body. Always verify your consultant credentials independently.',
      },
      {
        q: 'Is VisaGate.pk free to use for visa seekers?',
        a: 'Yes! Browsing consultant profiles, searching services, and contacting consultants is completely free for visa seekers. You only pay the consultant fee directly. VisaGate does not charge any commission or platform fee on transactions.',
      },
      {
        q: 'Which cities does VisaGate cover?',
        a: 'VisaGate currently lists consultants from major cities including Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Faisalabad and more. We are expanding coverage across Pakistan continuously.',
      },
    ],
  },
  {
    category: 'Finding a Consultant',
    icon: '🔍',
    items: [
      {
        q: 'How do I find a verified visa consultant?',
        a: 'Go to the Find Consultants page, use the filters to select your visa type, destination country, and preferred city. You can also filter by verification type (SECP, BEOE, FBR). Look for the green Verified badge on consultant profiles.',
      },
      {
        q: 'What do the verification badges mean?',
        a: 'Each badge represents a different government verification. Verified means our internal review approved the consultant. SECP means registered with Securities and Exchange Commission of Pakistan. BEOE means Bureau of Emigration and Overseas Employment. OEP means Overseas Employment Promoter license. FBR means active on Federal Board of Revenue tax rolls.',
      },
      {
        q: 'Can I contact a consultant before booking?',
        a: 'Yes. Every consultant profile has a WhatsApp button and a messaging feature. You can send a message through the platform to discuss your case before committing to a booking or appointment.',
      },
      {
        q: 'How do I know if a consultant is trustworthy?',
        a: 'Check their verification badges, read client reviews, and look at their years of experience. Only book consultants with the green Verified badge. If you suspect fraud, use our Report a Fraud page to alert us immediately.',
      },
    ],
  },
  {
    category: 'Bookings and Appointments',
    icon: '📅',
    items: [
      {
        q: 'How does the appointment system work?',
        a: 'Click Book Appointment on any consultant profile. Fill in your contact details, visa type, preferred date and time slot, and a message. The consultant reviews your request and either accepts or declines. You get notified of every status change.',
      },
      {
        q: 'Are appointments paid through VisaGate?',
        a: 'No. VisaGate does not process any payments. All fees are agreed and paid directly between you and the consultant by cash, bank transfer, or however you both agree. VisaGate is not responsible for financial transactions.',
      },
      {
        q: 'Can I cancel an appointment?',
        a: 'Yes. Go to your Seeker Dashboard, open Appointments, and cancel any pending appointment. Already-accepted appointments should be cancelled by contacting the consultant directly through messaging as a courtesy.',
      },
      {
        q: 'What is the difference between an appointment and a booking?',
        a: 'On VisaGate, appointments are consultation discussion slots. They are a time to speak with a consultant and get advice. They are not formal visa application submissions. The actual visa process begins after your consultation.',
      },
    ],
  },
  {
    category: 'Safety and Fraud',
    icon: '🛡️',
    items: [
      {
        q: 'How does VisaGate protect me from fraud?',
        a: 'We manually verify each consultant government registration before approving their profile. We display clear verification badges and ratings. We strongly advise: never send money abroad based on a consultant request alone, never share passport copies unless necessary, and always get a signed agreement.',
      },
      {
        q: 'What should I do if I suspect a consultant is fraudulent?',
        a: 'Report them immediately using our Report a Fraud page. Provide as much detail as possible. Our team reviews all reports and will suspend the account pending investigation. For urgent matters, contact the FIA Cybercrime Wing directly.',
      },
      {
        q: 'Does VisaGate guarantee visa approval?',
        a: 'No. VisaGate and its listed consultants cannot guarantee visa approval. Visa decisions are made solely by foreign embassies and consulates. Be very wary of any consultant who guarantees a visa as this is a common fraud tactic.',
      },
    ],
  },
  {
    category: 'For Consultants',
    icon: '💼',
    items: [
      {
        q: 'How do I list my services on VisaGate?',
        a: 'Click Sign Up, select I am a Consultant, and complete the 4-step registration with your OEP license number and business details. After admin verification your profile goes live and you can add services from your dashboard.',
      },
      {
        q: 'Is there a fee to list on VisaGate?',
        a: 'Currently listing on VisaGate is free during our launch phase. We may introduce premium plans in future with enhanced visibility and analytics. Registered consultants will be notified well in advance.',
      },
      {
        q: 'What documents do I need to register as a consultant?',
        a: 'You need your OEP license number and SECP registration date. We do not require document uploads during registration. Our team manually verifies your details against government registries.',
      },
      {
        q: 'How long does consultant verification take?',
        a: 'Verification typically takes 1 to 3 business days after you complete your profile. You will receive an email notification once your account is approved or if additional information is needed.',
      },
    ],
  },
]

function AccordionItem({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string
  a: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={[
        'border rounded-xl overflow-hidden transition-all duration-200',
        isOpen ? 'border-[#1B3060]/20 shadow-sm' : 'border-gray-100',
      ].join(' ')}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span
          className={[
            'text-sm font-semibold leading-snug transition-colors',
            isOpen ? 'text-[#1B3060]' : 'text-gray-800',
          ].join(' ')}
        >
          {q}
        </span>
        <div
          className={[
            'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300',
            isOpen ? 'bg-[#1B3060] rotate-180' : 'bg-gray-100',
          ].join(' ')}
        >
          <ChevronDown size={13} className={isOpen ? 'text-white' : 'text-gray-500'} />
        </div>
      </button>
      <div
        className={[
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96' : 'max-h-0',
        ].join(' ')}
      >
        <div className="px-5 pb-5 bg-white">
          <div className="h-px bg-gray-100 mb-4" />
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function FaqsClient() {
  const [openItem, setOpenItem] = useState<string | null>('0-0')

  const toggle = (key: string) => {
    setOpenItem((prev) => (prev === key ? null : key))
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <Navbar />

      <div className="bg-[#1B3060] py-14 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #C9A227 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-5">
            <HelpCircle size={28} className="text-[#C9A227]" />
          </div>
          <h1 className="font-heading font-extrabold text-white text-3xl lg:text-4xl mb-2">
            Frequently Asked Questions
          </h1>
          <p className="font-urdu text-[#C9A227]/80 text-lg mb-3">
            اکثر پوچھے جانے والے سوالات
          </p>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Everything you need to know about using VisaGate.pk — finding consultants,
            booking appointments, staying safe and more.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {FAQS.map((section, si) => (
          <div key={si} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="font-heading font-bold text-[#1B3060] text-lg">
                {section.category}
              </h2>
            </div>
            <div className="space-y-2">
              {section.items.map((item, ii) => (
                <AccordionItem
                  key={ii}
                  q={item.q}
                  a={item.a}
                  isOpen={openItem === `${si}-${ii}`}
                  onToggle={() => toggle(`${si}-${ii}`)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="bg-[#1B3060] rounded-2xl p-8 text-center mt-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4">
            <MessageCircle size={22} className="text-[#C9A227]" />
          </div>
          <h3 className="font-heading font-bold text-white text-xl mb-2">
            Still have questions?
          </h3>
          <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">
            Our team is here to help. Reach out via WhatsApp or send us a message
            and we will get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            
              <a href="https://wa.me/923149354655"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-[#1fb855] transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition border border-white/20"
            >
              Send a Message
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}