// data/scholarships.ts

export interface Scholarship {
  id: string
  flag: string
  countryCode: string
  name: string
  country: string
  type: string
  externalUrl: string
}

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 's1',
    flag: '🇬🇧',
    countryCode: 'GB',
    name: 'Chevening Scholarship',
    country: 'United Kingdom',
    type: 'Fully Funded',
    externalUrl: 'https://www.chevening.org/',
  },
  {
    id: 's2',
    flag: '🇬🇧',
    countryCode: 'GB',
    name: 'Commonwealth Scholarship',
    country: 'United Kingdom',
    type: 'Postgraduate',
    externalUrl: 'https://cscuk.fcdo.gov.uk/',
  },
  {
    id: 's3',
    flag: '🇨🇦',
    countryCode: 'CA',
    name: 'Canada Study Permit',
    country: 'Canada',
    type: 'Student Visa',
    externalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html',
  },
  {
    id: 's4',
    flag: '🇦🇺',
    countryCode: 'AU',
    name: 'Australia Awards',
    country: 'Australia',
    type: 'Fully Funded',
    externalUrl: 'https://www.australiaawards.gov.au/',
  },
  {
    id: 's5',
    flag: '🇩🇪',
    countryCode: 'DE',
    name: 'DAAD Scholarship',
    country: 'Germany',
    type: 'Research / Masters',
    externalUrl: 'https://www.daad.de/en/',
  },
  {
    id: 's6',
    flag: '🇺🇸',
    countryCode: 'US',
    name: 'Fulbright Scholarship',
    country: 'USA',
    type: 'Fully Funded',
    externalUrl: 'https://www.fulbright.edu.pk/',
  },
  {
    id: 's7',
    flag: '🇳🇱',
    countryCode: 'NL',
    name: 'Holland Scholarship',
    country: 'Netherlands',
    type: 'Undergraduate',
    externalUrl: 'https://www.studyinholland.nl/finances/holland-scholarship',
  },
  {
    id: 's8',
    flag: '🇳🇿',
    countryCode: 'NZ',
    name: 'NZ ASEAN Scholarship',
    country: 'New Zealand',
    type: 'Fully Funded',
    externalUrl: 'https://www.mfat.govt.nz/en/aid-and-development/new-zealand-scholarships/',
  },
]