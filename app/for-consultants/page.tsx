import type { Metadata } from 'next'
import ForConsultantsClient from './ForConsultantsClient'
import { HowToGetListedStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData'

export const metadata: Metadata = {
  title: 'List Your Visa Consultancy — Join VisaGate',
  description: 'Join Pakistan\'s first verified visa consultant platform. Get listed, reach verified seekers and grow your consultancy. OEP/SECP verified profiles only.',
  alternates: { canonical: 'https://visagate.pk/for-consultants' },
  openGraph: {
    title: 'List Your Visa Consultancy on VisaGate.pk',
    description: 'Join Pakistan\'s first verified visa consultant platform and reach thousands of seekers. Free to apply — OEP/SECP verified profiles only.',
    url: 'https://visagate.pk/for-consultants',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'Join VisaGate.pk as a Consultant' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Visa Consultancy on VisaGate.pk',
    description: 'Join Pakistan\'s first verified visa consultant platform. Free to apply.',
    images: ['https://visagate.pk/og-image.png'],
    creator: '@visagatepk',
  },
}

export default function ForConsultantsPage() {
  return (
    <>
      <HowToGetListedStructuredData />
      <BreadcrumbStructuredData items={[
        { name: 'Home', url: 'https://visagate.pk' },
        { name: 'For Consultants', url: 'https://visagate.pk/for-consultants' },
      ]} />
      <ForConsultantsClient />
    </>
  )
}