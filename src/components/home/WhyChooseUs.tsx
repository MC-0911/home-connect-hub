import { motion } from "framer-motion";
import { Users, DollarSign, Home, Star, Shield, CheckCircle, Clock, Quote } from "lucide-react";

const stats = [
  { icon: Users, value: "50,000+", label: "Happy Users" },
  { icon: DollarSign, value: "$2B+", label: "Value Transacted" },
  { icon: Home, value: "5,000+", label: "Active Listings" },
  { icon: Star, value: "4.9", label: "Average Rating" },
];

const badges = [
  { icon: Shield, text: "Secure Transactions" },
  { icon: CheckCircle, text: "Verified Listings" },
  { icon: Clock, text: "24/7 Support" },
];

const testimonial = {
  quote: "Sold my property 30% above asking price. The platform connected me with serious buyers instantly.",
  author: "Emily Rodriguez",
  role: "Property Seller",
  rating: 5.0,
  avatar: "ER",
};

export function WhyChooseUs() {
  return (
    <section className="py-20 sm:py-28 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold">
            Why Choose Us?
          </h2>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            Trusted by thousands of buyers and sellers across the country
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7 text-accent" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-accent mb-1">{stat.value}</p>
              <p className="text-primary-foreground/80 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-primary-foreground/10">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Quote */}
              <div className="flex-1">
                <Quote className="w-10 h-10 text-accent mb-4" />
                <p className="text-xl sm:text-2xl font-display leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-primary-foreground/80 text-sm">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 bg-accent/20 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="text-sm font-medium">{testimonial.rating} Rating</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-row lg:flex-col gap-3">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.text}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2"
                  >
                    <badge.icon className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium whitespace-nowrap">{badge.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
