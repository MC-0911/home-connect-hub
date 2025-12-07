import React from 'react';
import { useListingForm } from '../ListingFormContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { amenitiesList } from '@/lib/mockData';
import { motion } from 'framer-motion';

const AmenitiesStep = () => {
  const { formData, updateFormData } = useListingForm();

  const toggleAmenity = (amenity: string) => {
    const current = formData.amenities;
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    updateFormData({ amenities: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-semibold text-foreground">Amenities</h2>
        <p className="text-muted-foreground mt-1">Select all amenities your property offers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {amenitiesList.map((amenity, index) => {
          const isSelected = formData.amenities.includes(amenity);
          
          return (
            <motion.div
              key={amenity}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div
                onClick={() => toggleAmenity(amenity)}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                <Checkbox
                  id={amenity}
                  checked={isSelected}
                  onCheckedChange={() => toggleAmenity(amenity)}
                  className="pointer-events-none"
                />
                <Label 
                  htmlFor={amenity} 
                  className="cursor-pointer text-sm font-medium flex-1"
                >
                  {amenity}
                </Label>
              </div>
            </motion.div>
          );
        })}
      </div>

      {formData.amenities.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Selected amenities ({formData.amenities.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary text-primary-foreground"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AmenitiesStep;
