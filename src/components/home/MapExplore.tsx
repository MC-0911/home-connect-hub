import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, Filter, ArrowRight, Bed, Bath, Square } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: MapPin, text: "Real-time map updates" },
  { icon: Heart, text: "Save your favorite areas" },
  { icon: Filter, text: "Filter by property type" },
];

const propertyPins = [
  {
    id: 1,
    price: "$250K",
    position: { top: "25%", left: "33%" },
    variant: "accent" as const,
    delay: 0,
    property: {
      title: "Modern Family Home",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop",
      beds: 3,
      baths: 2,
      sqft: 1850,
      location: "Downtown"
    }
  },
  {
    id: 2,
    price: "$180K",
    position: { top: "50%", left: "50%" },
    variant: "primary" as const,
    delay: 0.2,
    property: {
      title: "Cozy Studio Apartment",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop",
      beds: 1,
      baths: 1,
      sqft: 650,
      location: "Midtown"
    }
  },
  {
    id: 3,
    price: "$320K",
    position: { top: "66%", left: "25%" },
    variant: "accent" as const,
    delay: 0.4,
    property: {
      title: "Spacious Townhouse",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=200&fit=crop",
      beds: 4,
      baths: 3,
      sqft: 2400,
      location: "Suburbs"
    }
  },
  {
    id: 4,
    price: "$450K",
    position: { top: "33%", right: "25%" },
    variant: "primary" as const,
    delay: 0.3,
    property: {
      title: "Luxury Penthouse",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop",
      beds: 3,
      baths: 2,
      sqft: 2100,
      location: "City Center"
    }
  },
];

export function MapExplore() {
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);

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
                
                {/* Animated Pins with Hover Cards */}
                {propertyPins.map((pin) => (
                  <motion.div
                    key={pin.id}
                    className="absolute cursor-pointer z-10"
                    style={pin.position}
                    animate={{ y: hoveredPin === pin.id ? -4 : [0, -8, 0] }}
                    transition={
                      hoveredPin === pin.id 
                        ? { duration: 0.2 } 
                        : { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: pin.delay }
                    }
                    onMouseEnter={() => setHoveredPin(pin.id)}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    <motion.div 
                      className={`w-12 h-12 ${pin.variant === 'accent' ? 'bg-accent' : 'bg-primary'} rounded-full flex items-center justify-center shadow-lg transition-transform`}
                      whileHover={{ scale: 1.15 }}
                    >
                      <span className={`${pin.variant === 'accent' ? 'text-accent-foreground' : 'text-primary-foreground'} font-bold text-xs`}>
                        {pin.price}
                      </span>
                    </motion.div>

                    {/* Property Preview Card */}
                    <AnimatePresence>
                      {hoveredPin === pin.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-52 bg-card rounded-lg shadow-xl overflow-hidden z-20"
                        >
                          <img 
                            src={pin.property.image} 
                            alt={pin.property.title}
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-foreground text-sm truncate">
                              {pin.property.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">{pin.property.location}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Bed className="w-3 h-3" />
                                {pin.property.beds}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="w-3 h-3" />
                                {pin.property.baths}
                              </span>
                              <span className="flex items-center gap-1">
                                <Square className="w-3 h-3" />
                                {pin.property.sqft}
                              </span>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-card rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
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
