import ConsultantsClient from './ConsultantsClient'

export const metadata = {
  title: 'Find Visa Consultants in Pakistan — VisaGate.pk',
  description: 'Browse verified visa consultants across Pakistan.',
}

export default function ConsultantsPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; type?: string; destination?: string }
}) {
  return <ConsultantsClient searchParams={searchParams} />
}