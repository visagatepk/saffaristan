export function WebsiteStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VisaGate.pk',
    url: 'https://visagate.pk',
    description: "Pakistan's first verified visa consultant platform",
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://visagate.pk/consultants?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      'https://www.facebook.com/visagatepk',
      'https://www.youtube.com/visagatepk',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function OrganizationStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VisaGate.pk',
    url: 'https://visagate.pk',
    logo: 'https://visagate.pk/logo.png',
    description: "Pakistan's first verified visa consultant marketplace",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Islamabad',
      addressCountry: 'PK',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Urdu'],
    },
    areaServed: 'PK',
    serviceType: 'Visa Consultancy Marketplace',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ConsultantStructuredData({ consultant }: { consultant: any }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://visagate.pk/consultants/${consultant.id}`,
    name: consultant.business_name || consultant.display_name,
    description: consultant.bio,
    url: `https://visagate.pk/consultants/${consultant.id}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: consultant.city,
      addressCountry: 'PK',
    },
    telephone: consultant.phone,
    aggregateRating: consultant.avgRating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: consultant.avgRating,
      reviewCount: consultant.reviewCount,
      bestRating: 5,
    } : undefined,
    priceRange: consultant.minPrice ? `PKR ${consultant.minPrice}+` : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}