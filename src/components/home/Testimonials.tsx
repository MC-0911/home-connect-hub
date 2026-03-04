import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote:
      "Found our dream home in just two weeks! The property matching feature connected us with listings we never would have found on our own.",
    author: "Sarah & James Mitchell",
    role: "Home Buyers",
    rating: 5,
    avatar: "SM",
    location: "Austin, TX",
  },
  {
    quote:
      "Sold my property 30% above asking price. The platform connected me with serious, verified buyers almost instantly.",
    author: "Emily Rodriguez",
    role: "Property Seller",
    rating: 5,
    avatar: "ER",
    location: "Miami, FL",
  },
  {
    quote:
      "The agent dashboard transformed my workflow. I manage 40+ listings and all my leads from one place — it's a game changer.",
    author: "David Chen",
    role: "Real Estate Agent",
    rating: 5,
    avatar: "DC",
    location: "San Francisco, CA",
  },
  {
    quote:
      "As a first-time renter, I was nervous. The verification system and direct messaging made me feel safe every step of the way.",
    author: "Priya Sharma",
    role: "Tenant",
    rating: 5,
    avatar: "PS",
    location: "Chicago, IL",
  },
  {
    quote:
      "Listed my rental property and had three qualified tenants within a week. The screening tools saved me hours of work.",
    author: "Marcus Williams",
    role: "Landlord",
    rating: 5,
    avatar: "MW",
    location: "Denver, CO",
  },
];

export function Testimonials({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleCount = 3;
  const maxIndex = testimonials.length - visibleCount;

  const prev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const next = () => setActiveIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className={`py-20 sm:py-28 overflow-hidden ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground text-lg mt-3 max-w-xl">
              Real stories from real people who found success on our platform.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              disabled={activeIndex === 0}
              className="rounded-full h-10 w-10 border-border"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              disabled={activeIndex >= maxIndex}
              className="rounded-full h-10 w-10 border-border"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        <div className="relative">
          <motion.div
            className="flex gap-6"
            animate={{ x: `-${activeIndex * (100 / visibleCount + 2)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {testimonials.map((t, index) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="min-w-[calc(33.333%-16px)] max-w-[calc(33.333%-16px)] flex-shrink-0 max-md:min-w-[calc(100%-16px)] max-md:max-w-[calc(100%-16px)] max-lg:min-w-[calc(50%-16px)] max-lg:max-w-[calc(50%-16px)]"
              >
                <div className="bg-card border border-border rounded-2xl p-7 h-full flex flex-col hover:shadow-elegant transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-accent fill-accent"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative flex-1 mb-6">
                    <Quote className="absolute -top-1 -left-1 w-8 h-8 text-accent/15" />
                    <p className="text-foreground leading-relaxed pl-5 text-[15px]">
                      "{t.quote}"
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-5 border-t border-border">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-accent/10 text-accent font-semibold text-sm">
                        {t.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">
                        {t.author}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t.role} · {t.location}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-8 bg-accent"
                  : "w-2 bg-border hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
