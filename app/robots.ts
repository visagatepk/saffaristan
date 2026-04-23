import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://visagate.pk/sitemap.xml',
    host: 'https://visagate.pk',
  }
}