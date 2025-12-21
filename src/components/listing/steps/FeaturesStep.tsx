import React from 'react';
import { useListingForm } from '../ListingFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bed, Bath, Ruler, TreePine, Calendar } from 'lucide-react';

const FeaturesStep = () => {
  const { formData, updateFormData } = useListingForm();
  const isLand = formData.propertyType === 'land';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-semibold text-foreground">Property Features</h2>
        <p className="text-muted-foreground mt-1">Provide details about your property</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!isLand && (
          <>
            <div>
              <Label htmlFor="bedrooms" className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-primary" />
                Bedrooms *
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                placeholder="3"
                value={formData.bedrooms}
                onChange={(e) => updateFormData({ bedrooms: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms" className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-primary" />
                Bathrooms *
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                placeholder="2"
                value={formData.bathrooms}
                onChange={(e) => updateFormData({ bathrooms: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="squareFeet" className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                Square Feet *
              </Label>
              <Input
                id="squareFeet"
                type="number"
                min="0"
                placeholder="2500"
                value={formData.squareFeet}
                onChange={(e) => updateFormData({ squareFeet: e.target.value })}
                className="mt-1"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="lotSize" className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-primary" />
            Lot Size (sq ft)
          </Label>
          <Input
            id="lotSize"
            type="number"
            min="0"
            placeholder="5000"
            value={formData.lotSize}
            onChange={(e) => updateFormData({ lotSize: e.target.value })}
            className="mt-1"
          />
        </div>

        {!isLand && (
          <>
            <div>
              <Label htmlFor="yearBuilt" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Year Built
              </Label>
              <Input
                id="yearBuilt"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                placeholder="2020"
                value={formData.yearBuilt}
                onChange={(e) => updateFormData({ yearBuilt: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="annualTax" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Annual Tax
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="annualTax"
                  type="number"
                  min="0"
                  placeholder="5000"
                  value={formData.annualTax}
                  onChange={(e) => updateFormData({ annualTax: e.target.value })}
                  className="pl-7"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {isLand && (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-muted-foreground">
            For land properties, bedrooms, bathrooms, and square feet are not applicable.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeaturesStep;
