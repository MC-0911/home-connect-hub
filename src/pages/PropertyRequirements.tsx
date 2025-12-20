import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RequirementsFormWizard } from "@/components/property-requirements/RequirementsFormWizard";
import { Helmet } from "react-helmet-async";
const PropertyRequirements = () => {
  return <>
      <Helmet>
        <title>Find Your Perfect Property | Royal Landmark</title>
        <meta name="description" content="Tell us what you're looking for and we'll match you with perfect properties within 24 hours. Fill out our quick property requirements form." />
        <meta name="keywords" content="property search, find property, property matchmaker, real estate requirements" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary via-primary to-navy-light overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-3xl mx-auto text-center text-primary-foreground">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
                  Find Your Dream Property
                </h1>
                <p className="text-lg sm:text-xl opacity-90 mb-4">
                  Tell Us What You're Looking For
                </p>
                <p className="text-base sm:text-lg opacity-75">
                  Fill out this quick form and we'll match you with perfect properties within 24 hours
                </p>
              </div>
            </div>
          </section>

          {/* Form Section */}
          <section className="py-12 sm:py-16 bg-primary-foreground">
            <div className="container mx-auto px-4 bg-primary-foreground">
              <div className="max-w-3xl mx-auto">
                <RequirementsFormWizard />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>;
};
export default PropertyRequirements;