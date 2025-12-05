import { motion } from "framer-motion";
import { Shield, Users, TrendingUp, HeartHandshake, Clock, Award } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Listings",
    description:
      "Every property is thoroughly verified to ensure authenticity and accuracy of information.",
  },
  {
    icon: Users,
    title: "Trusted Network",
    description:
      "Connect with verified sellers and buyers in our trusted community marketplace.",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description:
      "Access real-time market data and trends to make informed property decisions.",
  },
  {
    icon: HeartHandshake,
    title: "Personal Support",
    description:
      "Our dedicated team is here to guide you through every step of your property journey.",
  },
  {
    icon: Clock,
    title: "Quick Transactions",
    description:
      "Streamlined processes ensure faster closings and seamless property transfers.",
  },
  {
    icon: Award,
    title: "Best Prices",
    description:
      "Direct buyer-seller connections mean better deals without middleman markups.",
  },
];

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
          <span className="text-accent font-medium text-sm tracking-wide uppercase mb-2 block">
            Why Royal Landmark
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold">
            The Smarter Way to
            <br />
            <span className="text-accent">Buy & Sell Property</span>
          </h2>
          <p className="text-primary-foreground/70 mt-4 max-w-2xl mx-auto">
            We've reimagined the real estate experience to be simpler, more transparent, and more rewarding for everyone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-primary-foreground/10 transition-all duration-300 hover:bg-primary-foreground/10 hover:border-accent/30">
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-accent group-hover:shadow-gold">
                  <feature.icon className="w-7 h-7 text-accent transition-colors group-hover:text-accent-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-primary-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
