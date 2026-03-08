import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, Filter, ArrowRight, Bed, Bath, Square, Navigation, Layers, ZoomIn, Minus, Plus, Locate } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Navigation, text: "Real-time map navigation" },
  { icon: Heart, text: "Save your favorite areas" },
  { icon: Layers, text: "Filter by property type" },
];

const propertyPins = [
  {
    id: 1,
    price: "$250K",
    position: { top: "22%", left: "30%" },
    delay: 0,
    type: "Houses",
    property: {
      title: "Modern Family Home",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop",
      beds: 3,
      baths: 2,
      sqft: 1850,
      location: "Downtown",
    },
  },
  {
    id: 2,
    price: "$180K",
    position: { top: "52%", left: "55%" },
    delay: 0.2,
    type: "Apartments",
    property: {
      title: "Cozy Studio Apartment",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop",
      beds: 1,
      baths: 1,
      sqft: 650,
      location: "Midtown",
    },
  },
  {
    id: 3,
    price: "$320K",
    position: { top: "68%", left: "22%" },
    delay: 0.4,
    type: "Houses",
    property: {
      title: "Spacious Townhouse",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=200&fit=crop",
      beds: 4,
      baths: 3,
      sqft: 2400,
      location: "Suburbs",
    },
  },
  {
    id: 4,
    price: "$450K",
    position: { top: "35%", right: "20%" },
    delay: 0.3,
    type: "Land",
    property: {
      title: "Premium Plot",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop",
      beds: 0,
      baths: 0,
      sqft: 5000,
      location: "City Center",
    },
  },
];

const roadPaths = [
  "M 0 120 Q 150 100 300 130 T 600 110",
  "M 0 220 Q 200 200 350 240 T 600 200",
  "M 150 0 Q 160 150 180 300 T 170 450",
  "M 400 0 Q 380 120 420 250 T 390 450",
];

export function MapExplore({ className }: { className?: string }) {
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Houses", "Apartments", "Land"];

  return (
    <section className="py-20 sm:py-28 overflow-hidden relative" style={{ background: "radial-gradient(ellipse at 30% 50%, hsl(var(--accent) / 0.06), hsl(var(--background)) 70%)" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-5 border border-accent/20">
            <MapPin className="w-4 h-4" />
            Interactive Map
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explore Properties <span className="text-accent">on the Map</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover properties visually with our interactive map. Browse, filter, and find your perfect home based on location.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-center">
          {/* Left info panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Feature cards */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.12 }}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm hover:border-accent/40 hover:bg-accent/5 transition-all duration-300 cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-foreground font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { value: "500+", label: "Properties" },
                { value: "50+", label: "Locations" },
                { value: "24/7", label: "Updates" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-card/80 border border-border/50">
                  <div className="text-xl font-bold text-accent">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <Button variant="gold" size="lg" className="w-full" asChild>
              <Link to="/properties">
                Explore Full Map
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
            className="lg:col-span-3 relative"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden relative border border-border/40 shadow-2xl" style={{ background: "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--secondary)))" }}>
              {/* Stylized map background */}
              <div className="absolute inset-0">
                {/* Terrain-like gradient zones */}
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-accent/[0.04] rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-primary/[0.05] rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 bg-accent/[0.06] rounded-full blur-2xl" />

                {/* SVG road network */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.12]" viewBox="0 0 600 450" preserveAspectRatio="none">
                  {roadPaths.map((d, i) => (
                    <path key={i} d={d} fill="none" stroke="hsl(var(--foreground))" strokeWidth={i < 2 ? "2.5" : "1.5"} strokeDasharray={i >= 2 ? "6 4" : undefined} />
                  ))}
                </svg>

                {/* Subtle grid dots */}
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
              </div>

              {/* Filter bar on map */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2"
              >
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/60 shadow-lg">
                  {filters.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        activeFilter === f
                          ? "bg-accent text-accent-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button className="w-8 h-8 rounded-xl bg-card/90 backdrop-blur-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition-all shadow-md">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Animated Pins */}
              {propertyPins.map((pin) => (
                <motion.div
                  key={pin.id}
                  className="absolute cursor-pointer z-10"
                  style={pin.position}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 + pin.delay }}
                  onMouseEnter={() => setHoveredPin(pin.id)}
                  onMouseLeave={() => setHoveredPin(null)}
                >
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-accent/20"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: pin.delay }}
                    style={{ width: "100%", height: "100%", top: "12%", left: "12%" }}
                  />

                  {/* Pin marker */}
                  <motion.div
                    className="relative flex flex-col items-center"
                    animate={hoveredPin === pin.id ? { y: -6 } : { y: [0, -4, 0] }}
                    transition={
                      hoveredPin === pin.id
                        ? { duration: 0.2 }
                        : { duration: 2, repeat: Infinity, ease: "easeInOut", delay: pin.delay }
                    }
                  >
                    <div
                      className={`px-3 py-1.5 rounded-full font-bold text-xs shadow-lg border transition-all duration-200 ${
                        hoveredPin === pin.id
                          ? "bg-accent text-accent-foreground border-accent scale-110 shadow-accent/30"
                          : "bg-card text-foreground border-border/80"
                      }`}
                    >
                      {pin.price}
                    </div>
                    {/* Pin tail */}
                    <div
                      className={`w-2.5 h-2.5 rotate-45 -mt-1.5 transition-colors duration-200 ${
                        hoveredPin === pin.id ? "bg-accent" : "bg-card"
                      }`}
                    />
                    {/* Shadow dot */}
                    <div className="w-3 h-1 rounded-full bg-foreground/10 blur-sm mt-0.5" />
                  </motion.div>

                  {/* Property Preview Card */}
                  <AnimatePresence>
                    {hoveredPin === pin.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-12 w-56 bg-card rounded-2xl shadow-2xl overflow-hidden z-30 border border-border/60"
                      >
                        <div className="relative">
                          <img
                            src={pin.property.image}
                            alt={pin.property.title}
                            className="w-full h-28 object-cover"
                          />
                          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center border border-border/40">
                            <Heart className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-bold">
                            {pin.price}
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-foreground text-sm truncate">
                            {pin.property.title}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            {pin.property.location}
                          </p>
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Map controls (right side) */}
              <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 z-20">
                <button className="w-9 h-9 rounded-xl bg-card/90 backdrop-blur-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition-all shadow-md">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-xl bg-card/90 backdrop-blur-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition-all shadow-md">
                  <Minus className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-xl bg-card/90 backdrop-blur-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition-all shadow-md mt-1">
                  <Locate className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
            </div>

            {/* Decorative blurs */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
