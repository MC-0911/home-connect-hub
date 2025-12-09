import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useRequirementsForm } from "../RequirementsFormContext";
import { Star } from "lucide-react";

const amenitiesList = [
  { id: 'parking', label: 'Parking', icon: '🚗' },
  { id: 'garden', label: 'Garden/Balcony', icon: '🌿' },
  { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'pet-friendly', label: 'Pet Friendly', icon: '🐕' },
  { id: 'furnished', label: 'Furnished', icon: '🛋️' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { id: 'elevator', label: 'Elevator', icon: '🛗' },
  { id: 'security', label: 'Security System', icon: '🔒' },
  { id: 'modern-kitchen', label: 'Modern Kitchen', icon: '🍳' },
  { id: 'near-schools', label: 'Near Schools', icon: '🏫' },
  { id: 'public-transport', label: 'Public Transport', icon: '🚌' },
  { id: 'garage', label: 'Parking Garage', icon: '🏠' },
  { id: 'mountain-view', label: 'Mountain View', icon: '🏔️' },
  { id: 'ocean-view', label: 'Ocean View', icon: '🌊' },
  { id: 'private-pool', label: 'Private Pool', icon: '🏖️' },
];

export const FeaturesAmenitiesStep = () => {
  const { formData, updateFormData } = useRequirementsForm();

  const toggleFeature = (featureId: string) => {
    const newFeatures = formData.mustHaveFeatures.includes(featureId)
      ? formData.mustHaveFeatures.filter(f => f !== featureId)
      : [...formData.mustHaveFeatures, featureId];
    updateFormData({ mustHaveFeatures: newFeatures });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-primary">
        <Star className="h-6 w-6" />
        <h2 className="text-2xl font-display font-semibold">Must-Have Features</h2>
      </div>

      <div className="space-y-6">
        {/* Amenities Grid */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Select your must-have features</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {amenitiesList.map((amenity) => (
              <div
                key={amenity.id}
                className={`
                  flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all
                  ${formData.mustHaveFeatures.includes(amenity.id)
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50 hover:bg-secondary/50'
                  }
                `}
                onClick={() => toggleFeature(amenity.id)}
              >
                <Checkbox
                  id={amenity.id}
                  checked={formData.mustHaveFeatures.includes(amenity.id)}
                  onCheckedChange={() => toggleFeature(amenity.id)}
                  className="pointer-events-none"
                />
                <Label 
                  htmlFor={amenity.id} 
                  className="cursor-pointer font-normal flex items-center gap-2 flex-1"
                >
                  <span>{amenity.icon}</span>
                  <span>{amenity.label}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Requirements */}
        <div className="space-y-3">
          <Label htmlFor="additionalRequirements" className="text-base font-medium">
            Any other specific requirements?
          </Label>
          <Textarea
            id="additionalRequirements"
            placeholder="Tell us about any other features or requirements that are important to you..."
            value={formData.additionalRequirements}
            onChange={(e) => updateFormData({ additionalRequirements: e.target.value })}
            className="min-h-[120px] bg-background resize-none"
          />
        </div>
      </div>
    </div>
  );
};
