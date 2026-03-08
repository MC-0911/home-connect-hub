import { motion } from "framer-motion";
import { Search, MessageSquare, Home } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find Your Match",
    description: "Use our smart search to find your next property with the perfect location, amenities, and more.",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Connect Directly",
    description: "Message buyers or sellers instantly through our platform with no middlemen – direct communication.",
  },
  {
    number: "03",
    icon: Home,
    title: "Make It Yours",
    description: "Negotiate freely and close the deal on your terms. Move into your new place. Make it home.",
  },
];

export function HowItWorks({ className }: { className?: string }) {
  return (
    <section className={`py-24 sm:py-32 ${className || ""}`}>
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
          <p className="text-muted-foreground mt-5 max-w-xl mx-auto text-lg leading-relaxed">
            Finding or selling a property has never been easier. Follow these simple steps.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Desktop connector line */}
          <div className="hidden md:block absolute top-[5.5rem] left-[22%] right-[22%] z-0">
            <div className="h-px bg-border relative">
              {/* Animated dots on the line */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent/40" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                className="relative flex flex-col items-center text-center group cursor-default rounded-3xl p-6 transition-shadow duration-300 hover:shadow-[0_20px_50px_-12px_hsl(var(--accent)/0.15)]"
              >
                {/* Icon container with layered circles */}
                <div className="relative mb-10">
                  {/* Outer glow ring on hover */}
                  <div className="absolute inset-0 w-[7.5rem] h-[7.5rem] rounded-full bg-accent/5 scale-100 group-hover:scale-125 transition-transform duration-700 ease-out" />
                  
                  {/* Main circle */}
                  <div className="relative w-[7.5rem] h-[7.5rem] rounded-full bg-card border-2 border-border/60 flex items-center justify-center shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.12)] group-hover:border-accent/30 group-hover:shadow-[0_12px_40px_-8px_hsl(var(--accent)/0.2)] transition-all duration-500">
                    {/* Inner accent circle */}
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors duration-300">
                      <step.icon className="w-7 h-7 text-accent" strokeWidth={1.8} />
                    </div>
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-[0_4px_14px_hsl(var(--accent)/0.4)] ring-[3px] ring-background">
                    <span className="text-accent-foreground font-bold text-xs tracking-wide">{step.number}</span>
                  </div>
                </div>

                {/* Mobile down arrow */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center -mt-4 mb-4">
                    <div className="w-px h-10 bg-gradient-to-b from-border to-transparent" />
                  </div>
                )}

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-[260px] text-[0.95rem]">
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
