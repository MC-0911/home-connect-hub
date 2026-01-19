import { ServiceCard } from "@/components/ui/service-card";
import { motion } from "framer-motion";
import { servicesData } from "@/lib/servicesData";

export function ServicesSection({ className }: { className?: string }) {
  return (
    <section id="services" className={`py-20 sm:py-28 ${className || ''}`}>
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
          {servicesData.map((service, index) => (
            <ServiceCard
              key={service.slug}
              index={index}
              icon={service.icon}
              title={service.title}
              description={service.shortDescription}
              benefits={service.benefits.slice(0, 3)}
              cta={service.cta}
              link={`/services/${service.slug}`}
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
