import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CarouselItem {
  id: number | string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  rating?: number;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
}

interface OffersCarouselProps {
  offerIcon?: ReactNode;
  offerTitle: string;
  offerSubtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  items: CarouselItem[];
  className?: string;
}

export function OffersCarousel({
  offerIcon,
  offerTitle,
  offerSubtitle,
  ctaText,
  onCtaClick,
  items,
  className,
}: OffersCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          {offerIcon && (
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {offerIcon}
            </div>
          )}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {offerTitle}
            </h2>
            {offerSubtitle && (
              <p className="text-sm text-muted-foreground mt-1">{offerSubtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ctaText && onCtaClick && (
            <Button variant="ghost" onClick={onCtaClick} className="text-accent hover:text-accent">
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="snap-start shrink-0 w-[260px] sm:w-[280px] group cursor-pointer"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-xl transition-all duration-300">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {item.discountPercentage !== undefined && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-md">
                  {item.discountPercentage}% OFF
                </div>
              )}

              {item.rating !== undefined && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-card/95 backdrop-blur text-xs font-semibold text-foreground">
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  {item.rating}
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="font-semibold text-base leading-tight truncate">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-xs text-white/80 mt-0.5 truncate">{item.subtitle}</p>
                )}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-lg font-bold">${item.price.toLocaleString()}</span>
                  {item.originalPrice && (
                    <span className="text-xs line-through text-white/60">
                      ${item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
