import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Buyers CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy-light to-navy p-8 sm:p-12"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6">
                For Buyers
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-primary-foreground mb-4">
                Find Your Dream Home Today
              </h3>
              <p className="text-primary-foreground/70 mb-8 max-w-md">
                Browse thousands of verified listings and connect directly with sellers. Your perfect property is just a search away.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/properties">
                  Explore Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Sellers CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 sm:p-12"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                For Sellers
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                List Your Property for Free
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Reach thousands of qualified buyers. Create your listing in minutes and start receiving inquiries today.
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link to="/auth?mode=signup">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your Listing
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
