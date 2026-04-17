import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import TrustBadges from '@/components/TrustBadges'
import HowItWorks from '@/components/HowItWorks'
import VisaCategories from '@/components/VisaCategories'
import FeaturedConsultants from '@/components/FeaturedConsultants'
import Destinations from '@/components/Destinations'
import WhyVisaGate from '@/components/WhyVisaGate'
import Testimonials from '@/components/Testimonials'
import ConsultantCTA from '@/components/ConsultantCTA'
import Footer from '@/components/Footer'

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