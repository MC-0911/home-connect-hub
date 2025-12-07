import React from 'react';
import { useListingForm } from '../ListingFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const LocationStep = () => {
  const { formData, updateFormData } = useListingForm();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-semibold text-foreground">Property Location</h2>
        <p className="text-muted-foreground mt-1">Where is your property located?</p>
      </div>

      {/* Map Preview Placeholder */}
      <div className="relative bg-muted rounded-lg overflow-hidden h-48 flex items-center justify-center border border-border">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Map preview will appear here</p>
          <p className="text-sm text-muted-foreground">Enter address below</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            placeholder="e.g., 1842 Heritage Lane"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="San Francisco"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => updateFormData({ state: e.target.value })}
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              placeholder="94115"
              value={formData.zipCode}
              onChange={(e) => updateFormData({ zipCode: e.target.value })}
              className="mt-1"
              maxLength={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
