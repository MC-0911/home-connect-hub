import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRequirementsForm } from "../RequirementsFormContext";
import { Home } from "lucide-react";

const propertyTypes = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Land' },
  { value: 'townhouse', label: 'Townhouse' },
];

const bedroomOptions = [
  { value: '0', label: 'Studio' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5+' },
];

const bathroomOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4+' },
];

export const BasicRequirementsStep = () => {
  const { formData, updateFormData } = useRequirementsForm();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-primary">
        <Home className="h-6 w-6" />
        <h2 className="text-2xl font-display font-semibold">Property Basics</h2>
      </div>

      <div className="space-y-6">
        {/* Requirement Type */}
        <div className="space-y-3">
          <Label className="text-base font-medium">What are you looking for?</Label>
          <RadioGroup
            value={formData.requirementType}
            onValueChange={(value: 'buy' | 'rent' | 'both') => updateFormData({ requirementType: value })}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="buy" id="buy" />
              <Label htmlFor="buy" className="cursor-pointer font-normal">Buy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rent" id="rent" />
              <Label htmlFor="rent" className="cursor-pointer font-normal">Rent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="cursor-pointer font-normal">Both</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Property Type */}
        <div className="space-y-3">
          <Label htmlFor="propertyType" className="text-base font-medium">Property Type</Label>
          <Select
            value={formData.propertyType}
            onValueChange={(value) => updateFormData({ propertyType: value })}
          >
            <SelectTrigger id="propertyType" className="bg-background">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="minBedrooms" className="text-base font-medium">Minimum Bedrooms</Label>
            <Select
              value={formData.minBedrooms}
              onValueChange={(value) => updateFormData({ minBedrooms: value })}
            >
              <SelectTrigger id="minBedrooms" className="bg-background">
                <SelectValue placeholder="Select bedrooms" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {bedroomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="minBathrooms" className="text-base font-medium">Minimum Bathrooms</Label>
            <Select
              value={formData.minBathrooms}
              onValueChange={(value) => updateFormData({ minBathrooms: value })}
            >
              <SelectTrigger id="minBathrooms" className="bg-background">
                <SelectValue placeholder="Select bathrooms" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {bathroomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
