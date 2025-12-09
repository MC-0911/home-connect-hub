import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useRequirementsForm } from "../RequirementsFormContext";
import { MapPin, X } from "lucide-react";
import { useState } from "react";

export const LocationBudgetStep = () => {
  const { formData, updateFormData } = useRequirementsForm();
  const [locationInput, setLocationInput] = useState('');

  const addLocation = () => {
    if (locationInput.trim() && !formData.preferredLocations.includes(locationInput.trim())) {
      updateFormData({
        preferredLocations: [...formData.preferredLocations, locationInput.trim()]
      });
      setLocationInput('');
    }
  };

  const removeLocation = (location: string) => {
    updateFormData({
      preferredLocations: formData.preferredLocations.filter(l => l !== location)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLocation();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-primary">
        <MapPin className="h-6 w-6" />
        <h2 className="text-2xl font-display font-semibold">Location & Budget</h2>
      </div>

      <div className="space-y-6">
        {/* Preferred Locations */}
        <div className="space-y-3">
          <Label htmlFor="locations" className="text-base font-medium">
            Preferred Neighborhoods/Cities
          </Label>
          <div className="flex gap-2">
            <Input
              id="locations"
              placeholder="Type a location and press Enter"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-background"
            />
          </div>
          {formData.preferredLocations.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.preferredLocations.map((location) => (
                <Badge
                  key={location}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {location}
                  <button
                    onClick={() => removeLocation(location)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${location}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Max Distance */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-base font-medium">Maximum Distance from City Center</Label>
            <span className="text-sm text-muted-foreground font-medium">
              {formData.maxDistance} km
            </span>
          </div>
          <Slider
            value={[formData.maxDistance]}
            onValueChange={(value) => updateFormData({ maxDistance: value[0] })}
            min={1}
            max={50}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Budget Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="minBudget" className="text-base font-medium">
              Minimum Budget
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="minBudget"
                type="number"
                placeholder="0"
                value={formData.minBudget}
                onChange={(e) => updateFormData({ minBudget: e.target.value })}
                className="pl-7 bg-background"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="maxBudget" className="text-base font-medium">
              Maximum Budget
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="maxBudget"
                type="number"
                placeholder="1,000,000"
                value={formData.maxBudget}
                onChange={(e) => updateFormData({ maxBudget: e.target.value })}
                className="pl-7 bg-background"
              />
            </div>
          </div>
        </div>

        {formData.minBudget && formData.maxBudget && 
         Number(formData.minBudget) > Number(formData.maxBudget) && (
          <p className="text-sm text-destructive">
            Minimum budget cannot be greater than maximum budget
          </p>
        )}
      </div>
    </div>
  );
};
