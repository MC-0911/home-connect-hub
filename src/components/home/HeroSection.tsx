import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export function HeroSection() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (propertyType) params.set("type", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    navigate(`/properties?${params.toString()}`);
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: `url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      mixBlendMode: "overlay"
    }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

      {/* Decorative elements */}
      <motion.div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-accent/10 blur-3xl" animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3]
    }} transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }} />
      <motion.div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl" animate={{
      scale: [1.2, 1, 1.2],
      opacity: [0.2, 0.4, 0.2]
    }} transition={{
      duration: 10,
      repeat: Infinity,
      ease: "easeInOut"
    }} />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full text-primary-foreground/90 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Discover Your Dream Property
          </motion.div>

          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }} className="font-display italic text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-primary-foreground leading-[1.1] tracking-tight mb-8">
            The premier marketplace to{" "}
            <span className="text-accent">buy and sell</span> premium properties
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-lg sm:text-xl text-primary-foreground/50 max-w-2xl mx-auto mb-12 font-normal leading-relaxed">
            Join thousands of buyers and sellers closing life-changing deals. Buy and sell houses, apartments, condos, villas, townhouses, and land.
          </motion.p>

          {/* Search Box */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="bg-card p-2 shadow-lg max-w-5xl mx-auto border border-border rounded-xl">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <div className="relative flex-1 w-full md:w-auto">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-10 h-11 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State, or ZIP" />
              </div>

              <div className="hidden md:block w-px h-8 bg-border" />

              <div className="relative flex-1 w-full md:w-auto">
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="h-11 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 pl-4">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden md:block w-px h-8 bg-border" />

              <div className="relative flex-1 w-full md:w-auto">
                <Input type="number" placeholder="Min Price" className="h-11 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-4" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              </div>

              <div className="hidden md:block w-px h-8 bg-border" />

              <div className="relative flex-1 w-full md:w-auto">
                <Input type="number" placeholder="Max Price" className="h-11 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-4" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>

              <Button variant="gold" size="lg" className="h-11 px-6 rounded-full shrink-0" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.5
        }} className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-12">
            {[{
            value: "2,500+",
            label: "Active Listings"
          }, {
            value: "1,200+",
            label: "Happy Buyers"
          }, {
            value: "98%",
            label: "Satisfaction Rate"
          }].map(stat => <div key={stat.label} className="text-center">
                <div className="font-display text-3xl sm:text-4xl font-semibold text-accent">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/60 text-sm mt-1">
                  {stat.label}
                </div>
              </div>)}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{
      y: [0, 10, 0]
    }} transition={{
      duration: 2,
      repeat: Infinity
    }}>
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-accent" animate={{
          y: [0, 12, 0]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
        </div>
      </motion.div>
    </section>;
}