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
        "group relative h-[380px] w-full overflow-hidden rounded-2xl cursor-pointer",
        className
      )}
    >
      {/* Background Image with Zoom Effect on Hover */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 group-hover:from-black/95 group-hover:via-black/70 group-hover:to-black/30 transition-all duration-500" />

      {/* Content Container */}
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        {/* Top Section: Icon */}
        <div className="flex items-start">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 group-hover:bg-white/20">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Bottom Section: Always visible content + hover content */}
        <div className="flex flex-col">
          {/* Title - Always visible */}
          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">{title}</h3>
          
          {/* Description - Always visible but truncated, expands on hover */}
          <p className="text-sm text-white/70 mb-4 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
            {description}
          </p>

          {/* Benefits - Hidden by default, revealed on hover */}
          <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:max-h-28 group-hover:opacity-100 group-hover:mb-4">
            <ul className="space-y-1.5">
              {benefits.slice(0, 3).map((benefit, idx) => (
                <li
                  key={idx}
                  className="text-sm text-white/80 flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button - Always visible */}
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300"
            asChild
          >
            <Link to={link}>
              {cta} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
