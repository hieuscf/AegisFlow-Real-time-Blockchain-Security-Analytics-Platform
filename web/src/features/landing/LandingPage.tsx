import Navbar from '@/features/landing/components/Navbar';
import Hero from '@/features/landing/components/sections/Hero';
import TrustSection from '@/features/landing/components/sections/TrustSection';
import FeaturesSection from '@/features/landing/components/sections/FeaturesSection';
import ArchitectureSection from '@/features/landing/components/sections/ArchitectureSection';
import LiveAnalytics from '@/features/landing/components/sections/LiveAnalytics';
import AlertsPreview from '@/features/landing/components/sections/AlertsPreview';
import DashboardPreview from '@/features/landing/components/sections/DashboardPreview';
import WhyAegisFlow from '@/features/landing/components/sections/WhyAegisFlow';
import CTASection from '@/features/landing/components/sections/CTASection';
import Footer from '@/features/landing/components/sections/Footer';
import '@/styles/landing.css';

export function LandingPage() {
  return (
    <main className="landing-page min-h-screen bg-aegis-bg overflow-hidden">
      <Navbar />
      <Hero />
      <TrustSection />
      <FeaturesSection />
      <ArchitectureSection />
      <LiveAnalytics />
      <AlertsPreview />
      <DashboardPreview />
      <WhyAegisFlow />
      <CTASection />
      <Footer />
    </main>
  );
}
