import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, DollarSign, Clock, Sparkles, TrendingUp, Eye, Zap, ShieldCheck, BarChart3, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sellerSteps = [
  { icon: Zap, step: "01", title: "Create Your Listing", desc: "Add photos, details, and set your price in minutes" },
  { icon: Eye, step: "02", title: "Get Discovered", desc: "Your property reaches thousands of active buyers instantly" },
  { icon: ShieldCheck, step: "03", title: "Close with Confidence", desc: "Secure transactions with full support from our team" },
];

const sellerMetrics = [
  { icon: TrendingUp, value: "3x", label: "Faster Sales" },
  { icon: Users, value: "10K+", label: "Active Buyers" },
  { icon: BarChart3, value: "$0", label: "Listing Fee" },
];

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Sellers CTA - New design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[hsl(var(--navy))] via-[hsl(var(--navy-light))] to-[hsl(var(--navy-dark))] p-8 sm:p-12 lg:p-16"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/[0.06] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-success/[0.04] rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/[0.02] rounded-full blur-[120px]" />

          <div className="relative z-10">
            {/* Top row: headline + metrics */}
            <div className="grid lg:grid-cols-2 gap-10 items-start mb-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 text-accent text-sm font-semibold uppercase tracking-wider mb-6"
                >
                  <TrendingUp className="w-4 h-4" />
                  For Property Sellers
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-5"
                >
                  Sell Smarter,{" "}
                  <span className="text-accent relative inline-block">
                    Not Harder
                    <span className="absolute -bottom-1 left-0 w-full h-1.5 bg-accent/30 rounded-full" />
                  </span>
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-primary-foreground/70 text-lg leading-relaxed max-w-lg"
                >
                  List your property for free and connect with serious, verified buyers. Our platform handles the heavy lifting so you can focus on what matters.
                </motion.p>
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap justify-center lg:justify-end gap-4">
                {sellerMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="bg-primary-foreground/[0.06] backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-5 text-center min-w-[130px] hover:bg-primary-foreground/10 transition-colors duration-300"
                  >
                    <metric.icon className="w-7 h-7 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-primary-foreground">{metric.value}</p>
                    <p className="text-xs text-primary-foreground/60 font-medium">{metric.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="grid sm:grid-cols-3 gap-5 mb-12">
              {sellerSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="group relative bg-primary-foreground/[0.04] backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-6 hover:bg-primary-foreground/[0.08] hover:border-accent/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <span className="text-accent/50 text-xs font-bold tracking-wider">{step.step}</span>
                      <h4 className="text-primary-foreground font-semibold mt-0.5 mb-1">{step.title}</h4>
                      <p className="text-primary-foreground/50 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button variant="gold" size="lg" asChild>
                <Link to="/auth?mode=signup">
                  List Your Property Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="hero" size="lg" asChild>
                <Link to="/properties">
                  See How It Works
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Buyers CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl bg-background border border-border p-8 sm:p-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Property Matching Service
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                Find Your Dream Property
              </h3>
              <p className="text-muted-foreground mb-8 text-lg max-w-xl">
                Tell us exactly what you're looking for and we'll match you with perfect properties within 24 hours. Our experts do the searching so you don't have to.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/property-requirements">
                    Submit Buyer Inquiry
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/properties">
                    Browse Properties
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full px-4 py-2 text-white bg-secondary">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-sm font-medium">Personalized Matches</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">24hr Response Time</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
                <DollarSign className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-primary-foreground">Free Service</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
