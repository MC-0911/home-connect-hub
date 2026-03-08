import React from 'react';
import { useListingForm } from './ListingFormContext';
import { MapPin, Bed, Bath, Square, Ruler, Heart, Calendar, Tag, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/mockData';
import { Separator } from '@/components/ui/separator';

const ListingPreview = () => {
  const { formData } = useListingForm();

  const isLand = formData.propertyType === 'land';
  const coverImage =
    formData.imagePreviewUrls[0] ||
    formData.existingImageUrls[0] ||
    '/placeholder.svg';

  const allImages = [...formData.existingImageUrls, ...formData.imagePreviewUrls];
  const price = formData.price ? parseFloat(formData.price) : 0;
  const listingType = formData.listingType || 'sale';

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-display font-semibold text-foreground">Listing Preview</h2>
        <p className="text-muted-foreground mt-1">This is how buyers will see your listing</p>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border">
        <img
          src={coverImage}
          alt={formData.title || 'Property'}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="secondary" className="backdrop-blur-sm border-0 bg-secondary">
            {listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </Badge>
          <Badge variant="secondary" className="backdrop-blur-sm border-0 bg-secondary capitalize">
            {formData.propertyType || 'Property'}
          </Badge>
        </div>
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center cursor-default">
          <Heart className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent h-24" />
        <div className="absolute bottom-4 left-4">
          <span className="font-display text-2xl font-bold text-white">
            {price > 0 ? formatPrice(price, listingType) : '$0'}
          </span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.slice(0, 6).map((url, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0"
            >
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute inset-0 ring-2 ring-primary rounded-lg" />
              )}
            </div>
          ))}
          {allImages.length > 6 && (
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border">
              <span className="text-sm font-medium text-muted-foreground">+{allImages.length - 6}</span>
            </div>
          )}
        </div>
      )}

      {/* Title & Location */}
      <div className="space-y-2">
        <h3 className="text-xl font-display font-bold text-foreground">
          {formData.title || 'Untitled Property'}
        </h3>
        {(formData.address || formData.city) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
            <span>
              {[formData.address, formData.city, formData.state, formData.zipCode]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {!isLand ? (
          <>
            <StatItem icon={Bed} label="Bedrooms" value={formData.bedrooms || '—'} />
            <StatItem icon={Bath} label="Bathrooms" value={formData.bathrooms || '—'} />
            <StatItem icon={Square} label="Sq Ft" value={formData.squareFeet ? parseInt(formData.squareFeet).toLocaleString() : '—'} />
            <StatItem icon={Calendar} label="Year Built" value={formData.yearBuilt || '—'} />
          </>
        ) : (
          <>
            <StatItem icon={Ruler} label="Lot Size" value={formData.lotSize ? `${parseInt(formData.lotSize).toLocaleString()} ${formData.lotSizeUnit || 'sqft'}` : '—'} />
            <StatItem icon={Tag} label="Zoning" value={formData.zoningType || '—'} />
            <StatItem icon={Home} label="Buildable" value={formData.buildable ? (formData.buildable === 'yes' ? 'Yes' : 'No') : '—'} />
            <StatItem icon={MapPin} label="Road Access" value={formData.roadAccess || '—'} />
          </>
        )}
      </div>

      <Separator />

      {/* Description */}
      {formData.description && (
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">About this property</h4>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {formData.description}
          </p>
        </div>
      )}

      {/* Amenities */}
      {formData.amenities.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-sm">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Preview Note */}
      <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          This is a preview. Publish your listing to make it visible to buyers.
        </p>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/40 border border-border">
    <Icon className="w-5 h-5 text-accent" />
    <span className="text-lg font-semibold text-foreground">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export default ListingPreview;
