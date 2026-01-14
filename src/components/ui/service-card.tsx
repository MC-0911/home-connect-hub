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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Background Image with Overlay */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
        
        {/* Icon Badge */}
        <div className="absolute bottom-3 left-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shadow-lg">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-3">
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Benefits */}
        <ul className="space-y-2 mb-5">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link
          to={link}
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium",
            "text-primary hover:text-primary/80 transition-colors",
            "group/link"
          )}
        >
          {cta}
          <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
