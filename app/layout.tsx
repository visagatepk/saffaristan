import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
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
  title: 'VisaGate.pk — Find Verified Visa Consultants in Pakistan',
  description: "Pakistan's most trusted platform for finding verified immigration consultants in Islamabad, Rawalpindi, Lahore, Karachi and across Pakistan.",
  keywords: 'visa consultant Pakistan, immigration agent Islamabad, student visa Pakistan, work visa consultant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head> 
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${jakarta.variable} ${inter.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  )
}