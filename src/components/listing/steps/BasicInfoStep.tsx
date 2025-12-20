import React from 'react';
import { useListingForm } from '../ListingFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { propertyTypes } from '@/lib/mockData';

const BasicInfoStep = () => {
  const { formData, updateFormData } = useListingForm();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-semibold text-foreground">Basic Information</h2>
        <p className="text-muted-foreground mt-1">Tell us about your property</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Property Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Elegant Victorian Estate"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your property in detail..."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            className="mt-1 min-h-[120px]"
          />
        </div>

        <div>
          <Label>Property Type *</Label>
          <Select
            value={formData.propertyType}
            onValueChange={(value) => updateFormData({ propertyType: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Listing Type *</Label>
          <RadioGroup
            value={formData.listingType}
            onValueChange={(value: 'sale' | 'rent') => updateFormData({ listingType: value })}
            className="flex gap-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sale" id="sale" />
              <Label htmlFor="sale" className="cursor-pointer">For Sale</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rent" id="rent" />
              <Label htmlFor="rent" className="cursor-pointer">For Rent</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="price">
            {formData.listingType === 'rent' ? 'Monthly Rent' : 'Price'} *
          </Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="price"
              type="number"
              placeholder={formData.listingType === 'rent' ? '2500' : '500000'}
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value })}
              className="pl-7"
            />
          </div>
          {formData.listingType === 'rent' && (
            <p className="text-sm text-muted-foreground mt-1">per month</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
