import HeroSection from '@/components/home/HeroSection'
import ServicesSection from '@/components/home/ServicesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import AnnouncementsSection from '@/components/home/AnnouncementsSection'
import AboutSection from '@/components/home/AboutSection'
import ContactSection from '@/components/home/ContactSection'

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <AnnouncementsSection />
      <AboutSection />
      <ContactSection />
    </div>
  )
}