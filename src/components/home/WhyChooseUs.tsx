import { motion } from "framer-motion";
import { Users, DollarSign, Home, Star, Shield, CheckCircle, Clock, Quote, Headphones, Rocket, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "50,000+", label: "Happy Users" },
  { icon: DollarSign, value: "$2B+", label: "Value Transacted" },
  { icon: Home, value: "5,000+", label: "Active Listings" },
  { icon: Star, value: "4.9", label: "Average Rating" },
];

const trustBadges = [
  { icon: Shield, text: "100% Secure" },
  { icon: CheckCircle, text: "Verified" },
  { icon: Clock, text: "24/7 Support" },
];

const testimonial = {
  quote: "Sold my property 30% above asking price. The platform connected me with serious buyers instantly.",
  author: "Emily Rodriguez",
  role: "Property Seller, Miami",
  rating: 5.0,
  avatar: "ER",
};

const features = [
  { icon: Shield, title: "Secure Transactions", desc: "End-to-end encrypted payments & contracts" },
  { icon: CheckCircle, title: "Verified Listings", desc: "All properties verified by our expert team" },
  { icon: Headphones, title: "24/7 Premium Support", desc: "Round-the-clock assistance from real people" },
  { icon: Rocket, title: "Fast & Efficient", desc: "Average closing time just 21 days" },
];

const bottomStats = [
  { value: "98%", label: "Satisfaction Rate", icon: CheckCircle },
  { value: "24/7", label: "Customer Support", icon: Clock },
  { value: "100%", label: "Secure Platform", icon: Lock },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 sm:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-[0_30px_60px_-20px_hsl(var(--navy)/0.12)] relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(var(--accent)/0.04)_0%,transparent_70%)] rounded-full z-0" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(var(--success)/0.04)_0%,transparent_70%)] rounded-full z-0" />

          <div className="relative z-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="max-w-lg"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold uppercase tracking-wider mb-6">
                  <Award className="w-4 h-4" />
                  Why Trust Us
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                  We're <span className="text-accent relative inline-block">redefining<span className="absolute bottom-1 left-0 w-full h-2 bg-accent/20 rounded-sm -z-10" /></span><br />
                  real estate experience
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Trusted by thousands of buyers and sellers across the country to make their property dreams come true.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-6 bg-muted/50 px-6 py-4 rounded-full border border-accent/10"
              >
                {trustBadges.map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2">
                    <badge.icon className="w-5 h-5 text-accent" />
                    <span className="font-medium text-foreground text-sm whitespace-nowrap">{badge.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group bg-muted/40 rounded-3xl p-6 border border-accent/5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_hsl(var(--accent)/0.15)] hover:border-accent/20"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-success transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/10 to-success/10 flex items-center justify-center mb-5">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Feature Grid: Testimonial + Features List */}
            <div className="grid lg:grid-cols-5 gap-8 mb-12">
              {/* Testimonial Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-3 bg-gradient-to-br from-[hsl(var(--navy))] to-[hsl(var(--navy-light))] rounded-[2rem] p-8 sm:p-10 text-primary-foreground relative overflow-hidden"
              >
                <div className="absolute top-5 right-8 text-[12rem] font-serif text-primary-foreground/[0.03] leading-none select-none pointer-events-none">"</div>
                <Quote className="w-10 h-10 text-primary-foreground/20 mb-6" />
                <p className="text-xl sm:text-2xl font-medium leading-relaxed mb-8 relative z-10">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-success flex items-center justify-center text-lg font-semibold text-primary-foreground">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{testimonial.author}</p>
                    <p className="text-primary-foreground/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                    ))}
                  </div>
                  <span className="bg-primary-foreground/10 px-4 py-1.5 rounded-full text-sm font-semibold">
                    {testimonial.rating} Rating
                  </span>
                </div>
              </motion.div>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2 bg-muted/40 rounded-[2rem] p-8"
              >
                <h3 className="text-xl font-bold text-foreground mb-6">Why customers love us</h3>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-card rounded-2xl transition-all duration-300 hover:translate-x-1 hover:shadow-[0_10px_25px_-10px_hsl(var(--accent)/0.12)]"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-success flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{feature.title}</p>
                        <p className="text-muted-foreground text-xs">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
