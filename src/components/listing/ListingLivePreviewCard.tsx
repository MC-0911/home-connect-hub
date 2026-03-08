import React from 'react';
import { useListingForm } from './ListingFormContext';
import { MapPin, Bed, Bath, Square, Ruler, Heart, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface FieldCheck {
  label: string;
  filled: boolean;
}

const useFieldChecks = (formData: any, isLand: boolean): FieldCheck[] => {
  const checks: FieldCheck[] = [
    { label: 'Property type', filled: !!formData.propertyType },
    { label: 'Title', filled: !!formData.title },
    { label: 'Price', filled: !!formData.price },
    { label: 'Address', filled: !!formData.address },
    { label: 'City', filled: !!formData.city },
    { label: 'State', filled: !!formData.state },
    { label: 'Photos', filled: formData.existingImageUrls.length > 0 || formData.imagePreviewUrls.length > 0 },
    { label: 'Description', filled: !!formData.description },
  ];
  if (!isLand) {
    checks.splice(3, 0,
      { label: 'Bedrooms', filled: !!formData.bedrooms },
      { label: 'Bathrooms', filled: !!formData.bathrooms },
      { label: 'Square feet', filled: !!formData.squareFeet },
    );
  } else {
    checks.splice(3, 0,
      { label: 'Lot size', filled: !!formData.lotSize },
    );
  }
  return checks;
};

const ListingLivePreviewCard = () => {
  const { formData } = useListingForm();

  const coverImage =
    formData.existingImageUrls[0] ||
    formData.imagePreviewUrls[0] ||
    '/placeholder.svg';

  const price = formData.price ? parseFloat(formData.price) : 0;
  const listingType = formData.listingType || 'sale';
  const isLand = formData.propertyType === 'land';
  const hasImage = formData.existingImageUrls.length > 0 || formData.imagePreviewUrls.length > 0;
  const fieldChecks = useFieldChecks(formData, isLand);
  const missingFields = fieldChecks.filter(f => !f.filled);
  const filledCount = fieldChecks.filter(f => f.filled).length;
  const pct = Math.round((filledCount / fieldChecks.length) * 100);

  return (
    <div className="sticky top-28">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
      </div>

      <div className="bg-card rounded-xl overflow-hidden border border-border shadow-md">
        {/* Cover Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={coverImage}
            alt={formData.title || 'Property preview'}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              !hasImage && "opacity-30"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {formData.propertyType && (
              <Badge variant="secondary" className="backdrop-blur-sm border-0 bg-secondary/90 text-xs capitalize">
                {formData.propertyType}
              </Badge>
            )}
            <Badge variant="secondary" className="backdrop-blur-sm border-0 bg-secondary/90 text-xs">
              {listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </Badge>
          </div>

          {/* Faux favorite */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
            <Heart className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Price overlay */}
          {price > 0 && (
            <div className="absolute bottom-3 left-3">
              <span className="font-display text-lg font-bold text-white drop-shadow-md">
                {formatPrice(price, listingType)}
              </span>
            </div>
          )}

          {/* No image hint */}
          {!hasImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground font-medium bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                Add photos to preview
              </p>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">

          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className={cn("w-3.5 h-3.5 flex-shrink-0", formData.city ? "text-accent" : "text-destructive/60")} />
            <span className={cn(
              "text-xs line-clamp-1",
              formData.city || formData.state ? "text-muted-foreground" : "text-destructive/60 italic"
            )}>
              {formData.city || formData.state
                ? [formData.city, formData.state].filter(Boolean).join(', ')
                : '⚠ Add location'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs">
            {!isLand ? (
              <>
                <StatChip icon={Bed} value={formData.bedrooms} fallback="—" missing={!formData.bedrooms} />
                <StatChip icon={Bath} value={formData.bathrooms} fallback="—" missing={!formData.bathrooms} />
                <StatChip icon={Square} value={formData.squareFeet ? `${parseInt(formData.squareFeet).toLocaleString()}` : undefined} fallback="—" missing={!formData.squareFeet} />
              </>
            ) : (
              <StatChip icon={Ruler} value={formData.lotSize ? `${parseInt(formData.lotSize).toLocaleString()} ${formData.lotSizeUnit || 'sqft'}` : undefined} fallback="Lot size" missing={!formData.lotSize} />
            )}
          </div>

          {/* Description snippet */}
          {formData.description ? (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {formData.description}
            </p>
          ) : (
            <p className="text-xs text-destructive/60 italic">⚠ Add a description</p>
          )}

          {/* Amenities preview */}
          {formData.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.amenities.slice(0, 3).map((a: string) => (
                <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">
                  {a}
                </Badge>
              ))}
              {formData.amenities.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{formData.amenities.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Completion + Missing Fields */}
          <div className="pt-2 border-t border-border space-y-2.5">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Listing completeness</span>
                <span className={cn("font-medium", pct === 100 && "text-accent")}>{pct}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    pct === 100 ? "bg-accent" : pct >= 60 ? "bg-accent/70" : "bg-destructive/60"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Missing fields list */}
            {missingFields.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-destructive/80 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} missing
                </p>
                <div className="flex flex-wrap gap-1">
                  {missingFields.map((f) => (
                    <span
                      key={f.label}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive/80 border border-destructive/20"
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[10px] font-medium text-accent flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Ready to publish!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatChip = ({ icon: Icon, value, fallback, missing }: { icon: React.ElementType; value?: string; fallback: string; missing: boolean }) => (
  <div className={cn("flex items-center gap-1", missing ? "text-destructive/50" : "text-muted-foreground")}>
    <Icon className="w-3.5 h-3.5" />
    <span>{value || fallback}</span>
  </div>
);

export default ListingLivePreviewCard;
