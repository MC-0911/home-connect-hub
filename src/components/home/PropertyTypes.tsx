import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Building2, Castle, TreePine, Warehouse, Building } from "lucide-react";

const propertyTypes = [
  {
    icon: Home,
    label: "Houses",
    count: 1234,
    value: "house",
    description: "Single-family homes",
  },
  {
    icon: Building2,
    label: "Apartments",
    count: 856,
    value: "apartment",
    description: "Urban living spaces",
  },
  {
    icon: Building,
    label: "Condos",
    count: 567,
    value: "condo",
    description: "Modern condominiums",
  },
  {
    icon: TreePine,
    label: "Land",
    count: 234,
    value: "land",
    description: "Development plots",
  },
  {
    icon: Warehouse,
    label: "Townhouses",
    count: 345,
    value: "townhouse",
    description: "Multi-level homes",
  },
  {
    icon: Castle,
    label: "Villas",
    count: 123,
    value: "villa",
    description: "Luxury estates",
  },
];

export function PropertyTypes() {
  return (
    <section className="py-20 sm:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-accent font-medium text-sm tracking-wide uppercase mb-2 block">
            Browse by Category
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground">
            Explore Property Types
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Find the perfect property type that matches your lifestyle and investment goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {propertyTypes.map((type, index) => (
            <motion.div
              key={type.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/properties?type=${type.value}`}
                className="group block"
              >
                <div className="bg-card rounded-xl p-6 text-center transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 border border-transparent hover:border-accent/20">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:bg-accent group-hover:shadow-gold">
                    <type.icon className="w-7 h-7 text-accent transition-colors group-hover:text-accent-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {type.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {type.description}
                  </p>
                  <span className="text-sm font-medium text-accent">
                    {type.count.toLocaleString()} listings
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
