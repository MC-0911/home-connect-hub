import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, X, Building2, Sparkles, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// These are the current property types and amenities from the database enums
// In a real implementation, these would be fetched from a settings table
const DEFAULT_PROPERTY_TYPES = ['house', 'apartment', 'condo', 'land', 'townhouse', 'villa'];
const DEFAULT_AMENITIES = [
  'Swimming Pool',
  'Garden',
  'Garage',
  'Air Conditioning',
  'Heating',
  'Security System',
  'Gym',
  'Balcony',
  'Fireplace',
  'Storage',
  'Elevator',
  'Parking',
  'Pet Friendly',
  'Furnished',
  'Laundry',
  'Dishwasher',
];

export function PropertyTypesManager() {
  const [propertyTypes, setPropertyTypes] = useState<string[]>(DEFAULT_PROPERTY_TYPES);
  const [amenities, setAmenities] = useState<string[]>(DEFAULT_AMENITIES);
  const [newPropertyType, setNewPropertyType] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingAmenity, setEditingAmenity] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const addPropertyType = () => {
    if (!newPropertyType.trim()) {
      toast.error('Please enter a property type');
      return;
    }
    if (propertyTypes.includes(newPropertyType.toLowerCase())) {
      toast.error('Property type already exists');
      return;
    }
    setPropertyTypes([...propertyTypes, newPropertyType.toLowerCase()]);
    setNewPropertyType('');
    toast.success('Property type added successfully');
  };

  const removePropertyType = (type: string) => {
    setPropertyTypes(propertyTypes.filter(t => t !== type));
    toast.success('Property type removed');
  };

  const startEditType = (type: string) => {
    setEditingType(type);
    setEditValue(type);
  };

  const saveEditType = () => {
    if (!editValue.trim() || !editingType) return;
    setPropertyTypes(propertyTypes.map(t => t === editingType ? editValue.toLowerCase() : t));
    setEditingType(null);
    setEditValue('');
    toast.success('Property type updated');
  };

  const addAmenity = () => {
    if (!newAmenity.trim()) {
      toast.error('Please enter an amenity');
      return;
    }
    if (amenities.some(a => a.toLowerCase() === newAmenity.toLowerCase())) {
      toast.error('Amenity already exists');
      return;
    }
    setAmenities([...amenities, newAmenity]);
    setNewAmenity('');
    toast.success('Amenity added successfully');
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
    toast.success('Amenity removed');
  };

  const startEditAmenity = (amenity: string) => {
    setEditingAmenity(amenity);
    setEditValue(amenity);
  };

  const saveEditAmenity = () => {
    if (!editValue.trim() || !editingAmenity) return;
    setAmenities(amenities.map(a => a === editingAmenity ? editValue : a));
    setEditingAmenity(null);
    setEditValue('');
    toast.success('Amenity updated');
  };

  return (
    <Tabs defaultValue="property-types" className="space-y-6">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="property-types" className="gap-2">
          <Building2 className="h-4 w-4" />
          Property Types
        </TabsTrigger>
        <TabsTrigger value="amenities" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Amenities
        </TabsTrigger>
      </TabsList>

      <TabsContent value="property-types">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Property Types</CardTitle>
            <CardDescription>
              Manage the property types available for listings. Changes here affect the dropdown options in listing forms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter new property type..."
                value={newPropertyType}
                onChange={(e) => setNewPropertyType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPropertyType()}
                className="max-w-xs"
              />
              <Button onClick={addPropertyType} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Type
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Current property types ({propertyTypes.length})
              </p>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {propertyTypes.map((type) => (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      {editingType === type ? (
                        <div className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-6 w-24 text-xs px-2"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && saveEditType()}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={saveEditType}
                            className="h-5 w-5 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="gap-1.5 py-1.5 px-3 text-sm capitalize group hover:bg-secondary/80"
                        >
                          {type}
                          <button
                            onClick={() => startEditType(type)}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive">
                                <X className="h-3 w-3" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Property Type</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{type}"? This won't affect existing listings.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removePropertyType(type)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Property types are stored as database enums. Adding new types here updates the local state only. 
                To permanently add new property types, a database migration is required.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="amenities">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Amenities</CardTitle>
            <CardDescription>
              Manage the amenities that can be selected for property listings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter new amenity..."
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAmenity()}
                className="max-w-xs"
              />
              <Button onClick={addAmenity} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Amenity
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Current amenities ({amenities.length})
              </p>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {amenities.map((amenity) => (
                    <motion.div
                      key={amenity}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      {editingAmenity === amenity ? (
                        <div className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-6 w-32 text-xs px-2"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && saveEditAmenity()}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={saveEditAmenity}
                            className="h-5 w-5 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1.5 py-1.5 px-3 text-sm group hover:bg-muted"
                        >
                          {amenity}
                          <button
                            onClick={() => startEditAmenity(amenity)}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive">
                                <X className="h-3 w-3" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Amenity</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{amenity}"? This won't affect existing listings.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeAmenity(amenity)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Amenities are stored as text arrays in listings. Changes here will affect 
                the amenity selection options in the listing form. Existing listings will keep their current amenities.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}