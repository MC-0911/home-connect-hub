import React, { useState } from 'react';
import { useListingForm } from '../ListingFormContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { amenitiesList } from '@/lib/mockData';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const AmenitiesStep = () => {
  const { formData, updateFormData } = useListingForm();
  const [customAmenity, setCustomAmenity] = useState('');

  const toggleAmenity = (amenity: string) => {
    const current = formData.amenities;
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    updateFormData({ amenities: updated });
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !formData.amenities.includes(trimmed) && !amenitiesList.includes(trimmed)) {
      updateFormData({ amenities: [...formData.amenities, trimmed] });
      setCustomAmenity('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomAmenity();
    }
  };

  // Separate predefined and custom amenities for display
  const customAmenities = formData.amenities.filter(a => !amenitiesList.includes(a));

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

      {/* Other - Custom Amenities */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-medium text-foreground mb-3">Other</h3>
        <p className="text-sm text-muted-foreground mb-4">Add any amenities not listed above</p>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom amenity..."
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={addCustomAmenity}
            disabled={!customAmenity.trim()}
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {customAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {customAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground border border-border"
              >
                {amenity}
                <X 
                  className="w-3.5 h-3.5 cursor-pointer hover:text-destructive transition-colors" 
                  onClick={() => toggleAmenity(amenity)}
                />
              </span>
            ))}
          </div>
        )}
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
