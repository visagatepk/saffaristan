import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import TrustBadges from '@/components/TrustBadges'
import HowItWorks from '@/components/HowItWorks'
import VisaCategories from '@/components/VisaCategories'
import FeaturedConsultants from '@/components/home/FeaturedConsultants'
import Destinations from '@/components/Destinations'
import WhyVisaGate from '@/components/WhyVisaGate'
import Testimonials from '@/components/Testimonials'
import ConsultantCTA from '@/components/ConsultantCTA'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'VisaGate.pk — Find Verified Visa Consultants in Pakistan',
  description: "Pakistan's most trusted platform for finding verified immigration consultants in Islamabad, Rawalpindi, Lahore, Karachi and across Pakistan.",
  keywords: 'visa consultant Pakistan, immigration agent Islamabad, student visa Pakistan, work visa consultant',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <TrustBadges />
      <HowItWorks />
      <VisaCategories />
      <FeaturedConsultants />
      <Destinations />
      <WhyVisaGate />
      <Testimonials />
      <ConsultantCTA />
      <Footer />
    </main>
  )
}