import React from 'react';
import { useListingForm } from './ListingFormContext';
import { MapPin, Bed, Bath, Square, Ruler, Heart, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/mockData';
import { cn } from '@/lib/utils';

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
          {/* Title */}
          <h3 className={cn(
            "font-display font-semibold text-foreground line-clamp-1 text-sm",
            !formData.title && "text-muted-foreground italic"
          )}>
            {formData.title || 'Property title...'}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className={cn(
              "text-xs line-clamp-1",
              !(formData.city || formData.state) && "italic"
            )}>
              {formData.city || formData.state
                ? [formData.city, formData.state].filter(Boolean).join(', ')
                : 'Location...'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {!isLand ? (
              <>
                <div className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" />
                  <span>{formData.bedrooms || '—'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" />
                  <span>{formData.bathrooms || '—'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-3.5 h-3.5" />
                  <span>{formData.squareFeet ? `${parseInt(formData.squareFeet).toLocaleString()} sqft` : '—'}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                <span>{formData.lotSize ? `${parseInt(formData.lotSize).toLocaleString()} ${formData.lotSizeUnit || 'sqft'}` : 'Land'}</span>
              </div>
            )}
          </div>

          {/* Description snippet */}
          {formData.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {formData.description}
            </p>
          )}

          {/* Amenities preview */}
          {formData.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.amenities.slice(0, 3).map((a) => (
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

          {/* Completion indicator */}
          <div className="pt-2 border-t border-border">
            <CompletionBar formData={formData} isLand={isLand} />
          </div>
        </div>
      </div>
    </div>
  );
};

const CompletionBar = ({ formData, isLand }: { formData: any; isLand: boolean }) => {
  const checks = [
    !!formData.propertyType,
    !!formData.price,
    !!formData.title,
    !!formData.address && !!formData.city,
    formData.existingImageUrls.length > 0 || formData.imagePreviewUrls.length > 0,
    !!formData.description,
  ];
  if (!isLand) {
    checks.push(!!formData.bedrooms, !!formData.bathrooms);
  }
  const filled = checks.filter(Boolean).length;
  const total = checks.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Listing completeness</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ListingLivePreviewCard;
