import { Search, ClipboardCheck, FileText, Truck } from "lucide-react";
import { ServiceCard } from "@/components/ui/service-card";
import { motion } from "framer-motion";

const services = [
  {
    icon: Search,
    title: "Smart Property Matching",
    description: "AI-powered matching that finds properties aligned with your specific requirements, budget, and lifestyle preferences.",
    benefits: [
      "Personalized property recommendations",
      "Saves 80% of your search time",
      "Real-time alerts for new matches",
    ],
    cta: "Find My Match",
    link: "/property-requirements",
    backgroundImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: ClipboardCheck,
    title: "Professional Home Inspection",
    description: "Certified inspectors provide comprehensive property evaluation to identify potential issues before purchase.",
    benefits: [
      "200+ point detailed inspection",
      "Certified expert reports",
      "Prevent costly surprises",
    ],
    cta: "Schedule Inspection",
    link: "/properties",
    backgroundImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: FileText,
    title: "Title Search & Verification",
    description: "Thorough legal verification ensuring clear property ownership and preventing future disputes.",
    benefits: [
      "100% ownership guarantee",
      "Legal document verification",
      "Dispute prevention",
    ],
    cta: "Verify Title",
    link: "/properties",
    backgroundImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Truck,
    title: "Moving & Relocation",
    description: "Seamless moving solutions with vetted partners for packing, transport, and settling in.",
    benefits: [
      "Vetted moving partners",
      "Insurance-covered transport",
      "Stress-free relocation",
    ],
    cta: "Plan My Move",
    link: "/properties",
    backgroundImage: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

export function ServicesSection({ className }: { className?: string }) {
  return (
    <section className={`py-20 sm:py-28 ${className || ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            Our Services
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
            Complete Real Estate Services
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We handle every step of your property journey - from search to settlement and moving in.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              index={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              benefits={service.benefits}
              cta={service.cta}
              link={service.link}
              backgroundImage={service.backgroundImage}
            />
          ))}
        </div>

        {/* Footer Statement */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-muted-foreground mt-12"
        >
          All services available individually or as complete packages for buyers and sellers.
        </motion.p>
      </div>
    </section>
  );
}
