import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  className?: string;
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
  className,
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
      className={cn(
        "group relative h-[420px] w-full overflow-hidden rounded-2xl cursor-pointer",
        className
      )}
    >
      {/* Background Image with Zoom Effect on Hover */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        {/* Top Section: Icon */}
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 group-hover:bg-white/20">
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Middle Section: Details (slides up on hover) */}
        <div className="translate-y-4 transition-transform duration-500 ease-out group-hover:translate-y-0">
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/70">Real Estate Service</p>
          </div>

          <div className="mb-4 max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:max-h-32 group-hover:opacity-100">
            <p className="text-xs uppercase tracking-wider text-white/60 mb-2">
              Benefits
            </p>
            <ul className="space-y-1">
              {benefits.slice(0, 3).map((benefit, idx) => (
                <li
                  key={idx}
                  className="text-sm text-white/80 flex items-center gap-2"
                >
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section: CTA (revealed on hover) */}
        <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:max-h-20 group-hover:opacity-100">
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <p className="text-sm text-white/80 line-clamp-2 max-w-[60%]">
              {description}
            </p>
            <Button
              variant="gold"
              size="sm"
              className="shrink-0"
              asChild
            >
              <Link to={link}>
                {cta} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
