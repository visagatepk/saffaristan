import type { Metadata } from 'next'
import InsightsClient from './InsightsClient'

export const metadata: Metadata = {
  title: 'Visa Insights & Guides',
  description: 'Expert visa guides, immigration tips and travel insights from verified consultants across Pakistan. Stay informed on UK, Canada, UAE, Schengen and more.',
  alternates: { canonical: 'https://visagate.pk/insights' },
  openGraph: {
    title: 'Visa Insights & Guides — VisaGate.pk',
    description: 'Expert visa guides and immigration tips from verified consultants. UK, Canada, UAE, Schengen and more.',
    url: 'https://visagate.pk/insights',
    siteName: 'VisaGate.pk',
    locale: 'en_PK',
    type: 'website',
    images: [{ url: 'https://visagate.pk/og-image.png', width: 1200, height: 630, alt: 'Visa Insights & Guides — VisaGate.pk' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visa Insights & Guides — VisaGate.pk',
    description: 'Expert visa guides and immigration tips from verified consultants in Pakistan.',
    images: ['https://visagate.pk/og-image.png'],
    creator: '@visagatepk',
  },
}

export default function InsightsPage() {
  return <InsightsClient />
}