import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Square, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";

type SupabaseProperty = Tables<"properties">;

interface PropertyCardProps {
  property: SupabaseProperty;
  index?: number;
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = property.images?.[0] || '/placeholder.svg';
  const priceType = property.listing_type;
  const propertyType = property.property_type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/property/${property.id}`}>
        <div className="bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <div
              className={cn(
                "absolute inset-0 bg-secondary animate-pulse",
                imageLoaded && "hidden"
              )}
            />
            <img
              src={imageUrl}
              alt={property.title}
              className={cn(
                "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {property.featured && (
                <Badge className="bg-accent text-accent-foreground border-0">
                  Featured
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="bg-card/90 backdrop-blur-sm border-0"
              >
                {priceType === "rent" ? "For Rent" : "For Sale"}
              </Badge>
            </div>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-card hover:scale-110"
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-colors",
                  isFavorite
                    ? "fill-destructive text-destructive"
                    : "text-muted-foreground"
                )}
              />
            </button>

            {/* View Details on Hover */}
            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              <Button variant="hero" size="sm" className="w-full">
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col h-[200px]">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {property.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="line-clamp-1">
                {property.city}, {property.state}
              </span>
            </div>

            {/* Features - always show space for consistent height */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 min-h-[24px]">
              {propertyType !== "land" ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms || 0} Beds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms || 0} Baths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Square className="w-4 h-4" />
                    <span>{(property.square_feet || 0).toLocaleString()} sqft</span>
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground/70">Land Property</span>
              )}
            </div>

            {/* Price - pushed to bottom */}
            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              <span className="font-display text-xl font-semibold text-accent">
                {formatPrice(property.price, priceType)}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {propertyType}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
