import ConsultantsClient from './ConsultantsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Verified Visa Consultants in Pakistan',
  description: 'Browse 300+ verified visa consultants and immigration agents across Islamabad, Lahore, Karachi and all major Pakistani cities. Filter by destination, visa type and city.',
  alternates: { canonical: 'https://visagate.pk/consultants' },
  openGraph: {
    title: 'Find Verified Visa Consultants in Pakistan — VisaGate.pk',
    description: 'Browse 300+ verified visa consultants across Pakistan. Filter by city, destination and visa type.',
    url: 'https://visagate.pk/consultants',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'Find Verified Visa Consultants in Pakistan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Verified Visa Consultants in Pakistan — VisaGate.pk',
    description: 'Browse 300+ verified visa consultants across Pakistan.',
    images: ['https://visagate.pk/og-image.png'],
    creator: '@visagatepk',
  },
}
export default function ConsultantsPage() {
  return <ConsultantsClient />
}