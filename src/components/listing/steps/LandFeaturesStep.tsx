import React from 'react';
import { useListingForm } from '../ListingFormContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Landmark, Trees, MapPin, Compass } from 'lucide-react';

const zoningOptions = ['Residential', 'Agricultural', 'Commercial', 'Industrial', 'Mixed Use', 'Other'];
const roadAccessOptions = ['Paved', 'Gravel/Dirt', 'Private Road', 'No Direct Access'];
const utilitiesOptions = ['Electricity', 'Water Well', 'Natural Gas', 'Sewer System', 'Internet/Cable', 'Septic System Allowed'];
const waterRightsOptions = ['Included', 'Not Included', 'Municipal Available'];
const allowedUsesOptions = ['Can build single-family home', 'Can build multi-family', 'Can farm/agriculture', 'Can build business/commercial'];

const topographyOptions = ['Flat', 'Gentle Slope', 'Steep', 'Rolling Hills'];
const landViewOptions = ['Mountain', 'Water', 'City/Lights', 'Forest'];
const fencingOptions = ['Fully Fenced', 'Partially Fenced', 'Not Fenced'];
const vegetationOptions = ['Cleared', 'Light Trees', 'Heavily Wooded', 'Pasture/Rangeland', 'Farmland', 'Orchard/Vineyard'];

const distanceOptions = ['<5 miles', '5-10 miles', '10-20 miles', '20+ miles'];
const recreationalOptions = ['Hunting Allowed', 'Fishing Access', 'Hiking Trails', 'ATV Trails'];

const LandFeaturesStep = () => {
  const { formData, updateFormData } = useListingForm();

  const toggleArrayItem = (field: keyof typeof formData, item: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateFormData({ [field]: newArray });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">Land Features & Amenities</h2>
        <p className="text-muted-foreground mt-1">Provide details about your land property</p>
      </div>

      {/* SECTION 1: LAND CHARACTERISTICS */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground border-b border-border pb-2">
          <Landmark className="w-5 h-5 text-primary" />
          <span>Land Characteristics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Zoning Type</Label>
            <Select
              value={formData.zoningType || ''}
              onValueChange={(value) => updateFormData({ zoningType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select zoning type" />
              </SelectTrigger>
              <SelectContent>
                {zoningOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Road Access</Label>
            <Select
              value={formData.roadAccess || ''}
              onValueChange={(value) => updateFormData({ roadAccess: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select road access" />
              </SelectTrigger>
              <SelectContent>
                {roadAccessOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Water Rights</Label>
            <Select
              value={formData.waterRights || ''}
              onValueChange={(value) => updateFormData({ waterRights: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select water rights" />
              </SelectTrigger>
              <SelectContent>
                {waterRightsOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Buildable</Label>
            <Select
              value={formData.buildable || ''}
              onValueChange={(value) => updateFormData({ buildable: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Is it buildable?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Can Subdivide</Label>
            <Select
              value={formData.canSubdivide || ''}
              onValueChange={(value) => updateFormData({ canSubdivide: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Can it be subdivided?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Allowed Uses */}
        <div className="space-y-3">
          <Label>Allowed Uses</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allowedUsesOptions.map((option) => (
              <motion.div
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toggleArrayItem('allowedUses', option)}
              >
                <Checkbox
                  checked={(formData.allowedUses || []).includes(option)}
                  onCheckedChange={() => toggleArrayItem('allowedUses', option)}
                />
                <span className="text-sm">{option}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Utilities Available */}
        <div className="space-y-3">
          <Label>Utilities Available</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {utilitiesOptions.map((option) => (
              <motion.div
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toggleArrayItem('utilitiesAvailable', option)}
              >
                <Checkbox
                  checked={(formData.utilitiesAvailable || []).includes(option)}
                  onCheckedChange={() => toggleArrayItem('utilitiesAvailable', option)}
                />
                <span className="text-sm">{option}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: PROPERTY FEATURES */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground border-b border-border pb-2">
          <Trees className="w-5 h-5 text-primary" />
          <span>Property Features</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Topography</Label>
            <Select
              value={formData.topography || ''}
              onValueChange={(value) => updateFormData({ topography: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select topography" />
              </SelectTrigger>
              <SelectContent>
                {topographyOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fencing</Label>
            <Select
              value={formData.fencing || ''}
              onValueChange={(value) => updateFormData({ fencing: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fencing" />
              </SelectTrigger>
              <SelectContent>
                {fencingOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trees & Vegetation</Label>
            <Select
              value={formData.vegetation || ''}
              onValueChange={(value) => updateFormData({ vegetation: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vegetation" />
              </SelectTrigger>
              <SelectContent>
                {vegetationOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Views */}
        <div className="space-y-3">
          <Label>Views</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {landViewOptions.map((option) => (
              <motion.div
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toggleArrayItem('landViews', option)}
              >
                <Checkbox
                  checked={(formData.landViews || []).includes(option)}
                  onCheckedChange={() => toggleArrayItem('landViews', option)}
                />
                <span className="text-sm">{option}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: NEARBY AMENITIES */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground border-b border-border pb-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span>Nearby Amenities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Distance to Town</Label>
            <Select
              value={formData.distanceToTown || ''}
              onValueChange={(value) => updateFormData({ distanceToTown: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent>
                {distanceOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Grocery/Supplies</Label>
            <Select
              value={formData.distanceToGrocery || ''}
              onValueChange={(value) => updateFormData({ distanceToGrocery: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent>
                {distanceOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* SECTION 4: RECREATIONAL FEATURES */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground border-b border-border pb-2">
          <Compass className="w-5 h-5 text-primary" />
          <span>Recreational Features</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {recreationalOptions.map((option) => (
            <motion.div
              key={option}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => toggleArrayItem('recreationalFeatures', option)}
            >
              <Checkbox
                checked={(formData.recreationalFeatures || []).includes(option)}
                onCheckedChange={() => toggleArrayItem('recreationalFeatures', option)}
              />
              <span className="text-sm">{option}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ADDITIONAL NOTES */}
      <div className="space-y-3">
        <Label>Additional Notes</Label>
        <Textarea
          value={formData.landAdditionalNotes || ''}
          onChange={(e) => updateFormData({ landAdditionalNotes: e.target.value })}
          placeholder="Add any special features or notes not covered above..."
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  );
};

export default LandFeaturesStep;
