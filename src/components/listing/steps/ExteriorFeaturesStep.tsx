import { useListingForm } from '../ListingFormContext';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const architecturalStyles = [
  "Modern",
  "Contemporary",
  "Traditional",
  "Colonial",
  "Craftsman",
  "Ranch",
  "Bungalow",
  "Victorian",
  "Mediterranean",
  "Tudor",
  "Cape Cod",
  "Farmhouse",
  "Mid-Century Modern",
  "Other",
];

const parkingOptions = [
  "Attached Garage",
  "Detached Garage",
  "Carport",
  "Driveway",
  "On-Street",
  "Covered Parking",
  "EV Charging",
];

const roofingTypes = [
  "Asphalt Shingles",
  "Metal",
  "Tile",
  "Slate",
  "Wood Shingles",
  "Flat/Built-up",
  "Composite",
  "Other",
];

const outdoorAmenityOptions = [
  "Pool",
  "Hot Tub/Spa",
  "Deck",
  "Patio",
  "Porch",
  "Garden",
  "Fenced Yard",
  "Outdoor Kitchen",
  "Fire Pit",
  "Gazebo",
  "Tennis Court",
  "Basketball Court",
  "Playground",
];

const viewOptions = [
  "City",
  "Mountain",
  "Waterfront",
  "Lake",
  "Ocean",
  "Golf Course",
  "Park",
  "Forest/Trees",
  "Valley",
  "Garden",
];

const ExteriorFeaturesStep = () => {
  const { formData, updateFormData } = useListingForm();

  const toggleArrayItem = (
    field: "parking" | "outdoorAmenities" | "views",
    item: string
  ) => {
    const current = formData[field];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateFormData({ [field]: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary font-serif mb-2">
          Building & Exterior Features
        </h2>
        <p className="text-muted-foreground">
          What's the vibe on the outside of your home? Let's make it stand out!
        </p>
      </div>

      <div className="space-y-8">
        {/* Architectural Style */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            🏛️ Architectural Style
          </Label>
          <Select
            value={formData.architecturalStyle}
            onValueChange={(value) => updateFormData({ architecturalStyle: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select architectural style..." />
            </SelectTrigger>
            <SelectContent>
              {architecturalStyles.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Parking */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            🚗 Parking Options
          </Label>
          <p className="text-sm text-muted-foreground">
            Select all parking options available
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {parkingOptions.map((option) => (
              <div
                key={option}
                onClick={() => toggleArrayItem("parking", option)}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.parking.includes(option)
                    ? "border-secondary bg-secondary/10"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <Checkbox
                  checked={formData.parking.includes(option)}
                  className="pointer-events-none"
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roofing Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            🏠 Roofing Type
          </Label>
          <Select
            value={formData.roofingType}
            onValueChange={(value) => updateFormData({ roofingType: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select roofing type..." />
            </SelectTrigger>
            <SelectContent>
              {roofingTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Outdoor Amenities */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            🌳 Outdoor Amenities
          </Label>
          <p className="text-sm text-muted-foreground">
            What outdoor features does your property offer?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {outdoorAmenityOptions.map((option) => (
              <div
                key={option}
                onClick={() => toggleArrayItem("outdoorAmenities", option)}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.outdoorAmenities.includes(option)
                    ? "border-secondary bg-secondary/10"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <Checkbox
                  checked={formData.outdoorAmenities.includes(option)}
                  className="pointer-events-none"
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Views */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            👀 Views
          </Label>
          <p className="text-sm text-muted-foreground">
            What scenic views can be enjoyed from your property?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {viewOptions.map((option) => (
              <div
                key={option}
                onClick={() => toggleArrayItem("views", option)}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.views.includes(option)
                    ? "border-secondary bg-secondary/10"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <Checkbox
                  checked={formData.views.includes(option)}
                  className="pointer-events-none"
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExteriorFeaturesStep;
