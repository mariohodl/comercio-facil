import { HeroSection } from '@/components/shared/home/hero-section'
import { ProblemSection } from '@/components/shared/home/problem-section'
import { FeaturesSection } from '@/components/shared/home/features-section'
import { PricingSection } from '@/components/shared/home/pricing-section'
import { MetricsSection } from '@/components/shared/home/metrics-section'
import { TechnicalModulesSection } from '@/components/shared/home/technical-modules-section'
import { ScalabilitySection } from '@/components/shared/home/scalability-section'
import { FooterSection } from '@/components/shared/home/footer-section'

export default async function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <MetricsSection />
      <TechnicalModulesSection />
      {/* <PricingSection /> */}

      <ScalabilitySection />
      <FooterSection />
    </>
  )
}