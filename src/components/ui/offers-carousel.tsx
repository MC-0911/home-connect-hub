import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Gift } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CarouselItem {
  id: number | string;
  imageUrl: string;
  title: string;
  subtitle: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
}

export interface OffersCarouselProps {
  offerIcon?: React.ReactNode;
  offerTitle: string;
  offerSubtitle: string;
  ctaText: string;
  onCtaClick: () => void;
  items: CarouselItem[];
  className?: string;
  autoScrollIntervalMs?: number;
}

const ItemCard = ({ item }: { item: CarouselItem }) => (
  <motion.div
    className="group flex-shrink-0 w-full"
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm h-full flex flex-col">
      <div className="relative">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.discountPercentage && (
          <div className="absolute bottom-2 right-2 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            {item.discountPercentage}% OFF
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold leading-tight line-clamp-1">{item.title}</h3>
          <div className="ml-2 flex flex-shrink-0 items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent-foreground">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{item.subtitle}</p>
        <div className="mt-auto pt-3 flex items-end gap-2">
          <p className="text-lg font-bold">${item.price.toLocaleString()}</p>
          {item.originalPrice && (
            <p className="text-sm text-muted-foreground line-through">
              ${item.originalPrice.toLocaleString()}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">/ night</p>
      </div>
    </div>
  </motion.div>
);

export const OffersCarousel = React.forwardRef<HTMLDivElement, OffersCarouselProps>(
  (
    { offerIcon, offerTitle, offerSubtitle, ctaText, onCtaClick, items, className, autoScrollIntervalMs = 3000 },
    ref
  ) => {
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const [isAtStart, setIsAtStart] = React.useState(true);
    const [isAtEnd, setIsAtEnd] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);

    const getCardWidth = () => {
      const el = carouselRef.current?.querySelector<HTMLElement>("[data-carousel-card]");
      if (!el) return 280;
      const style = window.getComputedStyle(el);
      const marginRight = parseFloat(style.marginRight || "0");
      return el.getBoundingClientRect().width + marginRight + 16; // 16 = gap
    };

    const scroll = (direction: "left" | "right") => {
      if (!carouselRef.current) return;
      const amount = getCardWidth();
      carouselRef.current.scrollBy({
        left: direction === "right" ? amount : -amount,
        behavior: "smooth",
      });
    };

    const checkScrollPosition = React.useCallback(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setIsAtStart(scrollLeft < 10);
        setIsAtEnd(scrollWidth - scrollLeft - clientWidth < 10);
      }
    }, []);

    React.useEffect(() => {
      const el = carouselRef.current;
      if (!el) return;
      el.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
      return () => el.removeEventListener("scroll", checkScrollPosition);
    }, [checkScrollPosition, items]);

    // Auto-scroll
    React.useEffect(() => {
      if (isPaused) return;
      const id = setInterval(() => {
        const el = carouselRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        if (scrollWidth - scrollLeft - clientWidth < 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: getCardWidth(), behavior: "smooth" });
        }
      }, autoScrollIntervalMs);
      return () => clearInterval(id);
    }, [isPaused, autoScrollIntervalMs, items.length]);

    return (
      <div
        ref={ref}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={cn(
          "w-full rounded-2xl border bg-card p-4 shadow-sm md:p-6",
          className
        )}
      >
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          <div className="flex flex-col items-center text-center lg:col-span-3 lg:items-start lg:text-left justify-center">
            <div className="flex items-center gap-3">
              {offerIcon || <Gift className="h-6 w-6 text-primary" />}
              <p className="text-sm text-muted-foreground">Exclusive member perk!</p>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-primary">{offerTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{offerSubtitle}</p>
            <Button variant="outline" className="mt-6 w-full max-w-xs lg:w-auto" onClick={onCtaClick}>
              {ctaText}
            </Button>
          </div>

          <div className="relative lg:col-span-9 min-w-0">
            <div
              ref={carouselRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex gap-4 px-1 py-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    data-carousel-card
                    className="flex-shrink-0 w-[calc((100%-2rem)/3)] min-w-[240px]"
                  >
                    <ItemCard item={item} />
                  </div>
                ))}
              </div>
            </div>

            {!isAtStart && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-9 w-9 shadow-md z-10 hidden md:flex bg-background"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {!isAtEnd && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rounded-full h-9 w-9 shadow-md z-10 hidden md:flex bg-background"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
OffersCarousel.displayName = "OffersCarousel";
