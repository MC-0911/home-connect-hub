import React from 'react';
import { useListingForm } from '../ListingFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { propertyTypes } from '@/lib/mockData';
import { Bed, Bath, Ruler, TreePine, Calendar } from 'lucide-react';
const BasicInfoStep = () => {
  const {
    formData,
    updateFormData
  } = useListingForm();
  const isLand = formData.propertyType === 'land';
  return <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-semibold text-foreground">Basic Information</h2>
        <p className="text-muted-foreground mt-1">Tell us about your property</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Property Type *</Label>
            <Select value={formData.propertyType} onValueChange={value => updateFormData({
            propertyType: value
          })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map(type => <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Listing Type *</Label>
            <Select value={formData.listingType} onValueChange={(value: 'sale' | 'rent') => updateFormData({
            listingType: value
          })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select listing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="price">
            {formData.listingType === 'rent' ? 'Monthly Rent' : 'Price'} *
          </Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input id="price" type="number" placeholder={formData.listingType === 'rent' ? '2500' : '500000'} value={formData.price} onChange={e => updateFormData({
            price: e.target.value
          })} className="pl-7" />
          </div>
          {formData.listingType === 'rent' && <p className="text-sm text-muted-foreground mt-1">per month</p>}
        </div>
      </div>

      {/* Property Features Section */}
      <div className="pt-6 border-t border-border">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isLand && <>
              <div>
                <Label htmlFor="bedrooms" className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-primary" />
                  Bedrooms *
                </Label>
                <Input id="bedrooms" type="number" min="0" placeholder="3" value={formData.bedrooms} onChange={e => updateFormData({
              bedrooms: e.target.value
            })} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="bathrooms" className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-primary" />
                  Bathrooms *
                </Label>
                <Input id="bathrooms" type="number" min="0" step="0.5" placeholder="2" value={formData.bathrooms} onChange={e => updateFormData({
              bathrooms: e.target.value
            })} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="squareFeet" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" />
                  Living Area (Sq Ft) *
                </Label>
                <Input id="squareFeet" type="number" min="0" placeholder="2500" value={formData.squareFeet} onChange={e => updateFormData({
              squareFeet: e.target.value
            })} className="mt-1" />
              </div>
            </>}

          <div>
            <Label htmlFor="lotSize" className="flex items-center gap-2">
              <TreePine className="w-4 h-4 text-primary" />
              Lot Size
            </Label>
            <div className="flex gap-2 mt-1">
              <Input id="lotSize" type="number" min="0" placeholder="5000" value={formData.lotSize} onChange={e => updateFormData({
              lotSize: e.target.value
            })} className="flex-1" />
              <Select value={formData.lotSizeUnit || 'sqft'} onValueChange={value => updateFormData({
              lotSizeUnit: value
            })}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqft">Sq Ft</SelectItem>
                  <SelectItem value="acres">Acres</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isLand && <>
              <div>
                <Label htmlFor="yearBuilt" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Year Built
                </Label>
                <Input id="yearBuilt" type="number" min="1800" max={new Date().getFullYear()} placeholder="2020" value={formData.yearBuilt} onChange={e => updateFormData({
              yearBuilt: e.target.value
            })} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="yearRenovated" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Year Renovated
                </Label>
                <Input id="yearRenovated" type="number" min="1800" max={new Date().getFullYear()} placeholder="2022" value={formData.yearRenovated} onChange={e => updateFormData({
                yearRenovated: e.target.value
              })} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="parcelNumber" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Parcel No. (APN) *
                </Label>
                <Input id="parcelNumber" type="text" placeholder="e.g., 123-456-789" value={formData.parcelNumber} onChange={e => updateFormData({
                parcelNumber: e.target.value
              })} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="annualTax" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Annual Tax
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="annualTax" type="number" min="0" placeholder="5000" value={formData.annualTax} onChange={e => updateFormData({
                annualTax: e.target.value
              })} className="pl-7" />
                </div>
              </div>
            </>}
        </div>

        {isLand && <div className="bg-muted/50 rounded-lg p-4 text-center mt-4">
            <p className="text-muted-foreground">
              For land properties, bedrooms, bathrooms, and square feet are not applicable.
            </p>
          </div>}
      </div>
    </div>;
};
export default BasicInfoStep;