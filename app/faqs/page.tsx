import type { Metadata } from 'next'
import FaqsClient from './FaqsClient'
import { FAQStructuredData } from '@/components/StructuredData'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about VisaGate.pk — how to find verified consultants, book appointments, stay safe from fraud, and join as a consultant.',
  alternates: { canonical: 'https://visagate.pk/faqs' },
  openGraph: {
    title: 'FAQs — VisaGate.pk',
    description: 'Answers to common questions about finding verified visa consultants, booking appointments and staying safe from fraud in Pakistan.',
    url: 'https://visagate.pk/faqs',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'VisaGate.pk FAQs' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs — VisaGate.pk',
    description: 'Answers to common questions about finding verified visa consultants in Pakistan.',
    images: ['https://visagate.pk/og-image.png'],
    creator: '@visagatepk',
  },
}

export default function FaqsPage() {
  return (
    <>
      <FAQStructuredData />
      <FaqsClient />
    </>
  )
}