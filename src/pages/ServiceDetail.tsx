import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ServiceBookingForm } from "@/components/services/ServiceBookingForm";
import { getServiceBySlug, servicesData } from "@/lib/servicesData";
import NotFound from "./NotFound";

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getServiceBySlug(slug) : undefined;

  if (!service) {
    return <NotFound />;
  }

  const Icon = service.icon;

  // Get related services (excluding current)
  const relatedServices = servicesData.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{service.title} | Royal Landmark Services</title>
        <meta name="description" content={service.shortDescription} />
        <meta name="keywords" content={`${service.title.toLowerCase()}, real estate services, property services`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative h-[400px] sm:h-[450px] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${service.bannerImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

            <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-end pb-12">
              {/* Back Button */}
              <Link
                to="/#services"
                className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6 w-fit"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white">
                    {service.title}
                  </h1>
                </div>
                <p className="text-lg sm:text-xl text-white/80 max-w-2xl">
                  {service.shortDescription}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Left Content */}
                <div className="lg:col-span-2 space-y-10">
                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h2 className="text-2xl font-semibold text-foreground mb-4">About This Service</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {service.fullDescription}
                    </p>
                  </motion.div>

                  {/* Benefits */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-card rounded-xl border border-border p-6"
                  >
                    <h2 className="text-xl font-semibold text-foreground mb-4">Key Benefits</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                            <Check className="h-3 w-3 text-accent" />
                          </div>
                          <span className="text-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Features */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-foreground mb-4">What's Included</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-foreground text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Process */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h2 className="text-xl font-semibold text-foreground mb-6">How It Works</h2>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden sm:block" />
                      
                      <div className="space-y-6">
                        {service.process.map((step, idx) => (
                          <div key={idx} className="flex gap-4 sm:gap-6">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg relative z-10">
                              {step.step}
                            </div>
                            <div className="pt-2">
                              <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                              <p className="text-muted-foreground text-sm">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Pricing */}
                  {service.pricing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="bg-primary/5 rounded-xl p-6 border border-primary/20"
                    >
                      <h2 className="text-xl font-semibold text-foreground mb-2">Pricing</h2>
                      <p className="text-lg text-primary font-medium">{service.pricing}</p>
                    </motion.div>
                  )}
                </div>

                {/* Right Sidebar - Booking Form */}
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="sticky top-24"
                  >
                    <ServiceBookingForm
                      serviceName={service.title}
                      serviceSlug={service.slug}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Services */}
          <section className="py-12 sm:py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-semibold text-foreground mb-8">Other Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedServices.map((relatedService) => {
                  const RelatedIcon = relatedService.icon;
                  return (
                    <Link
                      key={relatedService.slug}
                      to={`/services/${relatedService.slug}`}
                      className="group bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <RelatedIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {relatedService.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {relatedService.shortDescription}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ServiceDetail;
