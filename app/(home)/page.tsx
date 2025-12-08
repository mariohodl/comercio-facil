import { HeroSection } from '@/components/shared/home/hero-section'
import { FeaturesSection } from '@/components/shared/home/features-section'
import { MetricsSection } from '@/components/shared/home/metrics-section'
import { TechnicalModulesSection } from '@/components/shared/home/technical-modules-section'
import { ScalabilitySection } from '@/components/shared/home/scalability-section'
import { FooterSection } from '@/components/shared/home/footer-section'

export default async function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <MetricsSection />
      <TechnicalModulesSection />
      <ScalabilitySection />
      <FooterSection />
    </>
  )
}