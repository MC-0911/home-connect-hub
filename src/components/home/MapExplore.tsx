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
            <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden shadow-elegant relative">
              {/* Stylized map preview */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-secondary">
                {/* Map grid lines */}
                <div className="absolute inset-0 opacity-20">
                  <div 
                    className="h-full w-full" 
                    style={{ 
                      backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                    }} 
                  />
                </div>
                
                {/* Animated Pins */}
                <motion.div 
                  className="absolute top-1/4 left-1/3"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-accent-foreground font-bold text-xs">$250K</span>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute top-1/2 left-1/2"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-xs">$180K</span>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute top-2/3 left-1/4"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                >
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-accent-foreground font-bold text-xs">$320K</span>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute top-1/3 right-1/4"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-xs">$450K</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
            </div>

            {/* Floating card */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 -right-6 bg-card rounded-xl shadow-elegant p-4 max-w-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="font-bold text-foreground">500+ Properties</div>
                  <div className="text-sm text-muted-foreground">In your area</div>
                </div>
              </div>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
