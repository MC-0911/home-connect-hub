import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PropertyTypes } from "@/components/home/PropertyTypes";
import { MapExplore } from "@/components/home/MapExplore";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CTASection } from "@/components/home/CTASection";
import { Resources } from "@/components/home/Resources";
import { Newsletter } from "@/components/home/Newsletter";
const Index = () => {
  return <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProperties />
        <HowItWorks />
        <PropertyTypes className="bg-primary-foreground" />
        <MapExplore />
        <WhyChooseUs />
        <CTASection />
        <Resources className="bg-primary-foreground" />
        <Newsletter className="bg-secondary-foreground" />
      </main>
      <Footer />
    </div>;
};
export default Index;