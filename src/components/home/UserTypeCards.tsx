import { motion } from "framer-motion";
import { Search, Home, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cardBuyers from "@/assets/card-buyers.jpg";
import cardSellers from "@/assets/card-sellers.jpg";
import cardAgents from "@/assets/card-agents.jpg";

const userTypes = [
  {
    icon: Search,
    title: "Buyers & Tenants",
    description: "Find your perfect home with powerful search tools and expert guidance.",
    benefits: [
      "Browse thousands of verified listings",
      "Schedule visits & make offers online",
      "Get personalized property recommendations",
    ],
    cta: "Start Searching",
    link: "/properties",
    accent: "accent",
    image: cardBuyers,
  },
  {
    icon: Home,
    title: "Sellers & Landlords",
    description: "List your property and reach qualified buyers or tenants effortlessly.",
    benefits: [
      "Free property listing with photos & details",
      "Access to a wide pool of verified buyers",
      "Track offers, visits & inquiries in one place",
    ],
    cta: "List Your Property",
    link: "/add-property",
    accent: "primary",
    image: cardSellers,
  },
  {
    icon: Briefcase,
    title: "Real Estate Agents",
    description: "Grow your business with tools designed for real estate professionals.",
    benefits: [
      "Dedicated agent dashboard & CRM tools",
      "Manage leads, appointments & documents",
      "Performance analytics & commission tracking",
    ],
    cta: "Join as Agent",
    link: "/agent-dashboard",
    accent: "accent",
    image: cardAgents,
  },
];

export function UserTypeCards({ className }: { className?: string }) {
  return (
    <section className={`py-20 sm:py-28 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            For Everyone
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            How Can We Help You?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're buying, selling, or managing properties — we have the tools you need.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {userTypes.map((type, index) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={type.image}
                  alt={type.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                {/* Icon overlaid on image */}
                <div
                  className={`absolute bottom-4 left-7 w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-sm ${
                    type.accent === "accent"
                      ? "bg-accent/20 text-accent"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  <type.icon className="w-7 h-7" />
                </div>
              </div>

              {/* Content */}
              <div className="p-7 pt-4 flex flex-col flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {type.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                  {type.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-3 mb-7 flex-1">
                  {type.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                      <span
                        className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                          type.accent === "accent" ? "bg-accent" : "bg-primary"
                        }`}
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={type.accent === "accent" ? "gold" : "default"}
                  className="w-full"
                  asChild
                >
                  <Link to={type.link}>
                    {type.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
