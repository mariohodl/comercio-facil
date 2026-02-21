import { HeroSection } from '@/components/shared/home/hero-section'
import { ProblemSection } from '@/components/shared/home/problem-section'
import { FeaturesSection } from '@/components/shared/home/features-section'
import { ComparisonSection } from '@/components/shared/home/comparison-section'
import { PricingSection } from '@/components/shared/home/pricing-section'
import { MetricsSection } from '@/components/shared/home/metrics-section'
import { TechnicalModulesSection } from '@/components/shared/home/technical-modules-section'
import { ScalabilitySection } from '@/components/shared/home/scalability-section'
import { FooterSection } from '@/components/shared/home/footer-section'
import { PromoPopup } from '@/components/shared/home/promo-popup'

export default async function HomePage() {
  return (
    <>
      <PromoPopup />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <ComparisonSection />
      <MetricsSection />
      <TechnicalModulesSection />
      <PricingSection />

      <ScalabilitySection />
      <FooterSection />
    </>
  )
}