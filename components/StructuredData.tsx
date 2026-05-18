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
          text: 'VisaGate.pk is Pakistan\'s first verified visa consultant platform. We connect visa seekers with government-verified immigration consultants and agents across Pakistan, making the visa application process transparent, safe, and easy.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is VisaGate.pk an official government service?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. VisaGate.pk is a private platform operated by Defaste (Pvt) Ltd. We verify consultants against government registries (OEP, SECP, BEOE, FBR) but we are not affiliated with any government body. Always verify your consultant credentials independently.',
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
        name: 'Which cities does VisaGate cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'VisaGate currently lists consultants from major cities including Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Faisalabad and more. We are expanding coverage across Pakistan continuously.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find a verified visa consultant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Go to the Find Consultants page, use the filters to select your visa type, destination country, and preferred city. You can also filter by verification type (SECP, BEOE, FBR). Look for the green Verified badge on consultant profiles.',
        },
      },
      {
        '@type': 'Question',
        name: 'What do the verification badges mean?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each badge represents a different government verification. Verified means our internal review approved the consultant. SECP means registered with Securities and Exchange Commission of Pakistan. BEOE means Bureau of Emigration and Overseas Employment. OEP means Overseas Employment Promoter license. FBR means active on Federal Board of Revenue tax rolls.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I contact a consultant before booking?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Every consultant profile has a WhatsApp button and a messaging feature. You can send a message through the platform to discuss your case before committing to a booking or appointment.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I know if a consultant is trustworthy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Check their verification badges, read client reviews, and look at their years of experience. Only book consultants with the green Verified badge. If you suspect fraud, use our Report a Fraud page to alert us immediately.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the appointment system work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Click Book Appointment on any consultant profile. Fill in your contact details, visa type, preferred date and time slot, and a message. The consultant reviews your request and either accepts or declines. You get notified of every status change.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are appointments paid through VisaGate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. VisaGate does not process any payments. All fees are agreed and paid directly between you and the consultant by cash, bank transfer, or however you both agree. VisaGate is not responsible for financial transactions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel an appointment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Go to your Seeker Dashboard, open Appointments, and cancel any pending appointment. Already-accepted appointments should be cancelled by contacting the consultant directly through messaging as a courtesy.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does VisaGate protect me from fraud?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We manually verify each consultant government registration before approving their profile. We display clear verification badges and ratings. We strongly advise: never send money abroad based on a consultant request alone, never share passport copies unless necessary, and always get a signed agreement.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should I do if I suspect a consultant is fraudulent?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Report them immediately using our Report a Fraud page. Provide as much detail as possible. Our team reviews all reports and will suspend the account pending investigation. For urgent matters, contact the FIA Cybercrime Wing directly.',
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
        name: 'How do I list my services on VisaGate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Click Sign Up, select I am a Consultant, and complete the 4-step registration with your OEP license number and business details. After admin verification your profile goes live and you can add services from your dashboard.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does consultant verification take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Verification typically takes 1 to 3 business days after you complete your profile. You will receive an email notification once your account is approved or if additional information is needed.',
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