import { LucideIcon, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  index: number;
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  link: string;
  backgroundImage: string;
}

export function ServiceCard({
  index,
  icon: Icon,
  title,
  description,
  benefits,
  cta,
  link,
  backgroundImage,
}: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
    >
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
      
      {/* Background Image with Overlay */}
      <div className="relative h-40 overflow-hidden">
        <motion.img
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent group-hover:via-card/40 transition-all duration-300" />
        
        {/* Icon Badge with pulse effect */}
        <motion.div 
          className="absolute bottom-3 left-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shadow-lg group-hover:shadow-primary/25 transition-shadow duration-300">
            <Icon className="w-6 h-6" />
            {/* Pulse ring on hover */}
            <span className="absolute inset-0 rounded-lg bg-primary opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDuration: '1.5s' }} />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5 pt-3 relative z-20">
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 group-hover:text-muted-foreground/90 transition-colors">
          {description}
        </p>

        {/* Benefits with staggered animation */}
        <ul className="space-y-2 mb-5">
          {benefits.map((benefit, i) => (
            <motion.li 
              key={i} 
              className="flex items-start gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + i * 0.05, duration: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
              </motion.div>
              <span className="text-muted-foreground">{benefit}</span>
            </motion.li>
          ))}
        </ul>

        {/* CTA Button with enhanced hover */}
        <Link
          to={link}
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium",
            "text-primary hover:text-primary/80 transition-all duration-300",
            "group/link relative"
          )}
        >
          <span className="relative">
            {cta}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover/link:w-full transition-all duration-300" />
          </span>
          <motion.span
            className="inline-block"
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </Link>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </motion.div>
  );
}
