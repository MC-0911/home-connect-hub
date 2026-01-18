import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border h-full"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col h-full min-h-[400px]">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-accent/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
          <Icon className="w-7 h-7 text-accent" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
          {description}
        </p>

        {/* Benefits */}
        <ul className="space-y-2 mb-6 flex-grow">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          variant="outline"
          className="w-full group/btn border-accent/30 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
          asChild
        >
          <Link to={link}>
            {cta}
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
