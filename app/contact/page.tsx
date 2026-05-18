import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the VisaGate.pk team. Report an issue, ask a question or send us a message via our contact form or WhatsApp.',
  alternates: { canonical: 'https://visagate.pk/contact' },
  openGraph: {
    title: 'Contact VisaGate.pk',
    description: 'Get in touch with the VisaGate.pk team via contact form or WhatsApp.',
    url: 'https://visagate.pk/contact',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'Contact VisaGate.pk' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact VisaGate.pk',
    description: 'Get in touch with the VisaGate.pk team via contact form or WhatsApp.',
    images: ['https://visagate.pk/og-image.png'],
    creator: '@visagatepk',
  },
}

export default function ContactPage() {
  return <ContactClient />
}