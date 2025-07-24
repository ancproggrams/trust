
import { Header } from '@/components/home/header';
import { HeroSection } from '@/components/home/hero-section';
import { FeatureSection } from '@/components/home/feature-section';
import { PricingSection } from '@/components/home/pricing-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { Footer } from '@/components/home/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <div id="features">
          <FeatureSection />
        </div>
        <div id="pricing">
          <PricingSection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
