import { motion } from "framer-motion";
import { MapPin, Heart, Filter, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: MapPin, text: "Real-time map updates" },
  { icon: Heart, text: "Save your favorite areas" },
  { icon: Filter, text: "Filter by property type" },
];

export function MapExplore() {
  return (
    <section className="py-20 sm:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              Interactive Map
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              Explore Properties on the Map
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Discover properties near you visually! Explore with our interactive map that lets you browse, sort, and customize listings based on location and find the perfect home for your needs.
            </p>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-foreground font-medium">{feature.text}</span>
                </motion.li>
              ))}
            </ul>

            <Button variant="gold" size="lg" asChild>
              <Link to="/properties">
                Explore Map
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop"
                alt="Interactive property map"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              {/* Floating badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">5,000+</p>
                    <p className="text-sm text-muted-foreground">Properties</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
