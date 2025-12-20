import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Building2, TrendingUp, TreePine, Palmtree } from "lucide-react";
const categories = [{
  icon: Home,
  label: "Family Homes",
  description: "Perfect spaces for growing families",
  value: "house",
  image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop"
}, {
  icon: Building2,
  label: "Apartments",
  description: "Modern urban living spaces",
  value: "apartment",
  image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop"
}, {
  icon: TrendingUp,
  label: "Investment Properties",
  description: "High yield rental income",
  value: "investment",
  image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"
}, {
  icon: TreePine,
  label: "Land & Plots",
  description: "Build your dream from scratch",
  value: "land",
  image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop"
}, {
  icon: Palmtree,
  label: "Vacation Rentals",
  description: "Getaway properties awaiting",
  value: "vacation",
  image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=300&fit=crop"
}];
export function PropertyTypes() {
  return <section className="py-20 sm:py-28 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5
      }} className="text-center mb-12">
          <span className="font-medium text-sm tracking-wide uppercase mb-2 block text-primary">
            Browse by Category
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground">
            Find exactly what you're looking for
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Explore our curated categories to discover your perfect property
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => <motion.div key={category.value} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.4,
          delay: index * 0.1
        }}>
              <Link to={`/properties?type=${category.value}`} className="group block h-full">
                <div className="relative overflow-hidden rounded-2xl bg-card h-64 transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{
                backgroundImage: `url(${category.image})`
              }} />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/40 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 backdrop-blur-sm flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-accent group-hover:shadow-gold">
                      <category.icon className="w-6 h-6 text-accent transition-colors group-hover:text-accent-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white mb-1">
                      {category.label}
                    </h3>
                    <p className="text-sm text-white/70">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>)}
        </div>
      </div>
    </section>;
}