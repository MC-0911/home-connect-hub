import { motion } from "framer-motion";
import { Search, MessageSquare, Home, ArrowRight } from "lucide-react";

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
    <section className={`py-20 sm:py-28 bg-muted/30 ${className || ""}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Finding or selling a property has never been easier. Follow these simple steps.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connector line between steps */}
          <div className="hidden md:block absolute top-[4.5rem] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative text-center group"
              >
                {/* Large background circle */}
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="w-28 h-28 rounded-full bg-accent/[0.06] flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <div className="w-20 h-20 rounded-full bg-accent/[0.08] flex items-center justify-center">
                      <step.icon className="w-9 h-9 text-accent transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                  {/* Number badge */}
                  <span className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center shadow-[0_4px_12px_hsl(var(--accent)/0.35)] ring-4 ring-background">
                    {step.number}
                  </span>
                </div>

                {/* Arrow connector on mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-2">
                    <ArrowRight className="w-5 h-5 text-muted-foreground/40 rotate-90" />
                  </div>
                )}

                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
