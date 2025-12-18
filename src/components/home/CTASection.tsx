import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, TrendingUp, DollarSign, Clock, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const sellerBenefits = ["List your property for free", "Reach real buyers instantly", "Get real-time views, no middlemen", "Secure transactions & support"];
const sellerStats = [{
  icon: TrendingUp,
  value: "30%",
  label: "Price Drop"
}, {
  icon: DollarSign,
  value: "$0",
  label: "Listing Fee"
}, {
  icon: Users,
  value: "10K+",
  label: "Sell Requests"
}];
export function CTASection() {
  return <section className="py-20 sm:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Sellers CTA */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-light to-navy p-8 sm:p-12 lg:p-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="font-display text-3xl sm:text-4xl font-semibold text-primary-foreground mb-4">
                Ready to Sell Your Property?
              </h3>
              <p className="text-primary-foreground/70 mb-8 text-lg">
                Join thousands of successful sellers who've found buyers on our platform. List your property today and connect with serious buyers.
              </p>
              
              <ul className="space-y-3 mb-8">
                {sellerBenefits.map((benefit, index) => <motion.li key={benefit} initial={{
                opacity: 0,
                x: -20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.4,
                delay: index * 0.1
              }} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-primary-foreground">{benefit}</span>
                  </motion.li>)}
              </ul>

              <div className="flex flex-wrap gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/auth?mode=signup">
                    List Your Property
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="hero" size="lg" asChild>
                  <Link to="/properties">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-6">
              {sellerStats.map((stat, index) => <motion.div key={stat.label} initial={{
              opacity: 0,
              scale: 0.8
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.4,
              delay: 0.3 + index * 0.1
            }} className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[120px]">
                  <stat.icon className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-primary-foreground">{stat.label}</p>
                </motion.div>)}
            </div>
          </div>
        </motion.div>

        {/* Buyers CTA */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }} className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 sm:p-12">
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
    </section>;
}