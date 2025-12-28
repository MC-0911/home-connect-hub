import React, { useState } from 'react';
import { useListingForm } from '../ListingFormContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
const basementOptions = ["Finished", "Partially Finished", "Unfinished", "None"];
const flooringOptions = ["Hardwood", "Carpet", "Tile", "Laminate", "Vinyl", "Concrete", "Marble", "Bamboo"];
const roomOptions = ["Family Room", "Living Room", "Dining Room", "Office/Study", "Breakfast Nook", "Bonus Room", "Loft", "Sunroom", "Game Room", "Library", "Media Room", "Laundry Room"];
const indoorFeatureOptions = ["Fireplace", "Skylights", "Jetted Tub", "Walk-in Closet", "Central Air", "Smart Home Features", "Security System", "Wet Bar", "Built-in Shelving", "Crown Molding", "Vaulted Ceilings", "In-law Suite"];
const AmenitiesStep = () => {
  const {
    formData,
    updateFormData
  } = useListingForm();
  const [customAmenity, setCustomAmenity] = useState('');
  const toggleArrayItem = (field: "flooring" | "rooms" | "indoorFeatures" | "amenities", item: string) => {
    const current = formData[field];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    updateFormData({
      [field]: updated
    });
  };
  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !formData.amenities.includes(trimmed)) {
      updateFormData({
        amenities: [...formData.amenities, trimmed]
      });
      setCustomAmenity('');
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomAmenity();
    }
  };
  return <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Room & Interior Features
        </h2>
        <p className="text-muted-foreground mt-1">
          Let's get into your home's interior. What makes it special inside?
        </p>
      </div>

      <div className="space-y-8">
        {/* Basement */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            🏚️ Basement
          </Label>
          <Select value={formData.basement} onValueChange={value => updateFormData({
          basement: value
        })}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select basement type..." />
            </SelectTrigger>
            <SelectContent>
              {basementOptions.map(option => <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Flooring */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            🪵 Flooring Types
          </Label>
          <p className="text-sm text-muted-foreground">
            Select all that apply
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {flooringOptions.map((option, index) => <motion.div key={option} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.03
          }}>
                <div onClick={() => toggleArrayItem("flooring", option)} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.flooring.includes(option) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <Checkbox checked={formData.flooring.includes(option)} className="pointer-events-none" />
                  <span className="text-sm">{option}</span>
                </div>
              </motion.div>)}
          </div>
        </div>

        {/* Rooms */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            🚪 Additional Rooms
          </Label>
          <p className="text-sm text-muted-foreground">
            Beyond the standard bedrooms, what other rooms does your home have?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roomOptions.map((option, index) => <motion.div key={option} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.03
          }}>
                <div onClick={() => toggleArrayItem("rooms", option)} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.rooms.includes(option) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <Checkbox checked={formData.rooms.includes(option)} className="pointer-events-none" />
                  <span className="text-sm">{option}</span>
                </div>
              </motion.div>)}
          </div>
        </div>

        {/* Indoor Features */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            ✨ Indoor Features
          </Label>
          <p className="text-sm text-muted-foreground">
            What special features make your home stand out?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {indoorFeatureOptions.map((option, index) => <motion.div key={option} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.03
          }}>
                <div onClick={() => toggleArrayItem("indoorFeatures", option)} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.indoorFeatures.includes(option) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <Checkbox checked={formData.indoorFeatures.includes(option)} className="pointer-events-none" />
                  <span className="text-sm">{option}</span>
                </div>
              </motion.div>)}
          </div>
        </div>

        {/* Other - Custom Amenities */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium text-foreground mb-3">Other</h3>
          <p className="text-sm text-muted-foreground mb-4">Add any amenities not listed above</p>
          
          <div className="flex gap-2">
            <Input placeholder="Enter custom amenity..." value={customAmenity} onChange={e => setCustomAmenity(e.target.value)} onKeyDown={handleKeyDown} className="flex-1" />
            <Button type="button" onClick={addCustomAmenity} disabled={!customAmenity.trim()} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.amenities.length > 0 && <div className="flex flex-wrap gap-2 mt-4">
              {formData.amenities.map(amenity => <span key={amenity} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground border border-border">
                  {amenity}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-destructive transition-colors" onClick={() => toggleArrayItem("amenities", amenity)} />
                </span>)}
            </div>}
        </div>
      </div>
    </div>;
};
export default AmenitiesStep;