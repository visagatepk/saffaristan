import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData'
import './globals.css'
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://visagate.pk'),
  title: {
    default: 'VisaGate.pk — Find Verified Visa Consultants in Pakistan',
    template: '%s | VisaGate.pk',
  },
  description: "Pakistan's first platform to find verified visa consultants and immigration agents in Islamabad, Rawalpindi, Lahore, Karachi and across Pakistan. Compare experts, read reviews and apply with confidence.",
  keywords: [
    'visa consultant Pakistan',
    'immigration agent Islamabad',
    'visa consultant Rawalpindi',
    'UK visa consultant Pakistan',
    'Canada PR consultant Pakistan',
    'student visa consultant',
    'work permit Pakistan',
    'Schengen visa consultant',
    'UAE visa agent Pakistan',
    'visa consultancy Lahore',
    'visa consultancy Karachi',
    'BEOE registered consultant',
    'OEP licensed agent',
    'immigration consultant Pakistan',
    'visagate',
    'visagate.pk',
  ],
  authors: [{ name: 'VisaGate.pk', url: 'https://visagate.pk' }],
  creator: 'VisaGate.pk',
  publisher: 'VisaGate.pk',
  category: 'Immigration & Visa Services',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://visagate.pk',
    siteName: 'VisaGate.pk',
    title: 'VisaGate.pk — Find Verified Visa Consultants in Pakistan',
    description: "Pakistan's first verified visa consultant platform. Compare 300+ verified immigration experts across Pakistan.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VisaGate.pk — Find Verified Visa Consultants in Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisaGate.pk — Find Verified Visa Consultants in Pakistan',
    description: "Pakistan's first verified visa consultant platform.",
    images: ['/og-image.png'],
    creator: '@visagatepk',
  },
  alternates: {
    canonical: 'https://visagate.pk',
  },
  verification: {
    google: 'ADD_YOUR_GOOGLE_VERIFICATION_CODE_HERE',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <WebsiteStructuredData />
  <OrganizationStructuredData />
</head>
      <body className={`${jakarta.variable} ${inter.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  )
}