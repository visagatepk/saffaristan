import HeroClient from './HeroClient'

// Fallback cities until real consultants register
const DEFAULT_CITIES = [
  'Islamabad',
  'Rawalpindi', 
  'Lahore',
  'Karachi',
  'Peshawar',
  'Quetta',
  'Multan',
  'Faisalabad',
  'Hyderabad',
  'Sargodha',
]

export default function HeroSection() {
  return <HeroClient cities={DEFAULT_CITIES} />
}