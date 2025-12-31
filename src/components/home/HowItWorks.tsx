import { motion } from "framer-motion";
import { Search, MessageSquare, Home } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Search,
    title: "Find Your Match",
    description: "Use our smart search to find your next property with the perfect location, amenities, and more.",
  },
  {
    number: "2",
    icon: MessageSquare,
    title: "Connect Directly",
    description: "Message buyers or sellers instantly through our platform with no middlemen – direct communication.",
  },
  {
    number: "3",
    icon: Home,
    title: "Make It Yours",
    description: "Negotiate freely and close the deal on your terms. Move into your new place. Make it home.",
  },
];

export function HowItWorks({ className }: { className?: string }) {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Finding or selling a property has never been easier. Follow these simple steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-accent/50 to-accent/10" />
              )}
              
              {/* Step number badge */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 mb-6">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center shadow-gold">
                  {step.number}
                </span>
                <step.icon className="w-10 h-10 text-accent" />
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
