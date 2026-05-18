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
      'https://www.twitter.com/visagatepk',
      'https://www.youtube.com/@visagatepk',
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
      telephone: '+92-314-9354655',
      contactType: 'customer service',
      availableLanguage: ['English', 'Urdu'],
    },
    sameAs: [
      'https://www.facebook.com/visagatepk',
      'https://www.twitter.com/visagatepk',
      'https://www.youtube.com/@visagatepk',
    ],
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

export function FAQStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is VisaGate.pk?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "VisaGate.pk is Pakistan's first verified visa consultant platform. We connect visa seekers with government-verified immigration consultants and agents across Pakistan, making the visa application process transparent, safe, and easy.",
        },
      },
      {
        '@type': 'Question',
        name: 'Is VisaGate.pk free to use for visa seekers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Browsing consultant profiles, searching services, and contacting consultants is completely free for visa seekers. You only pay the consultant fee directly. VisaGate does not charge any commission or platform fee on transactions.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find a verified visa consultant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Go to the Find Consultants page, use the filters to select your visa type, destination country, and preferred city. Look for the green Verified badge on consultant profiles.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the appointment system work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Click Book Appointment on any consultant profile. Fill in your contact details, visa type, preferred date and time slot, and a message. The consultant reviews your request and either accepts or declines.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does VisaGate guarantee visa approval?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. VisaGate and its listed consultants cannot guarantee visa approval. Visa decisions are made solely by foreign embassies and consulates. Be very wary of any consultant who guarantees a visa as this is a common fraud tactic.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does consultant verification take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Verification typically takes 1 to 3 business days after you complete your profile. You will receive an email notification once your account is approved.',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Issue #10 — HowTo Schema for About page verification process
export function HowToVerificationStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How VisaGate.pk Verifies Visa Consultants',
    description: 'The 4-step process VisaGate.pk uses to verify visa consultants against government registries in Pakistan.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Registration Submission',
        text: 'Consultant submits their OEP license number, SECP registration date and business details during signup.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Government Registry Check',
        text: 'Our team cross-checks submitted details against OEP, SECP, BEOE and FBR government registries.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Manual Review',
        text: 'A VisaGate team member manually reviews the submitted credentials and registry matches.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Verified Badge Awarded',
        text: 'Approved consultants receive the green Verified badge on their profile within 1-3 business days.',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Issue #10 — HowTo Schema for For-Consultants get listed process
export function HowToGetListedStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Get Listed as a Visa Consultant on VisaGate.pk',
    description: 'A 3-step process to create your verified consultant profile on VisaGate.pk.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create Your Profile',
        text: 'Sign up and complete your consultant profile with your specializations, experience, and services. Takes about 5 minutes.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Get Verified',
        text: 'Submit your OEP license number and SECP registration. Our team verifies and adds your official badge within 24-48 hours.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Start Getting Clients',
        text: 'Your profile goes live and clients start finding you. Respond to inquiries and grow your business immediately.',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Issue #14 — BreadcrumbList Schema
export function BreadcrumbStructuredData({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}