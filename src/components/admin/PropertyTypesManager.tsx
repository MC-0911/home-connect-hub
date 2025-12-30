import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, X, Building2, Home, Trees, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Default property types
const DEFAULT_PROPERTY_TYPES = ['house', 'apartment', 'condo', 'land', 'townhouse', 'villa'];

// Interior Features defaults
const DEFAULT_BASEMENT_OPTIONS = ['Full Basement', 'Partial Basement', 'Crawl Space', 'Slab', 'Walk-out Basement', 'Finished Basement', 'Unfinished Basement', 'None'];
const DEFAULT_FLOORING_OPTIONS = ['Hardwood', 'Carpet', 'Tile', 'Laminate', 'Vinyl', 'Marble', 'Concrete', 'Bamboo', 'Stone'];
const DEFAULT_ROOM_OPTIONS = ['Office/Study', 'Home Theater', 'Bonus Room', 'Sunroom', 'Wine Cellar', 'Workshop', 'Game Room', 'Library', 'Guest Suite', 'Mudroom', 'Butler\'s Pantry'];
const DEFAULT_INDOOR_FEATURES = ['Central Air', 'Central Heat', 'Fireplace', 'Smart Home System', 'Security System', 'Built-in Speakers', 'Wet Bar', 'Walk-in Closet', 'Ceiling Fans', 'Skylight', 'Crown Molding', 'High Ceilings', 'Recessed Lighting'];

// Exterior Features defaults
const DEFAULT_ARCHITECTURAL_STYLES = ['Modern', 'Contemporary', 'Traditional', 'Colonial', 'Craftsman', 'Ranch', 'Bungalow', 'Victorian', 'Mediterranean', 'Tudor', 'Cape Cod', 'Farmhouse', 'Mid-Century Modern', 'Other'];
const DEFAULT_PARKING_OPTIONS = ['Attached Garage', 'Detached Garage', 'Carport', 'Driveway', 'On-Street', 'Covered Parking', 'EV Charging'];
const DEFAULT_ROOFING_TYPES = ['Asphalt Shingles', 'Metal', 'Tile', 'Slate', 'Wood Shingles', 'Flat/Built-up', 'Composite', 'Other'];
const DEFAULT_OUTDOOR_AMENITIES = ['Pool', 'Hot Tub/Spa', 'Deck', 'Patio', 'Porch', 'Garden', 'Fenced Yard', 'Outdoor Kitchen', 'Fire Pit', 'Gazebo', 'Tennis Court', 'Basketball Court', 'Playground'];
const DEFAULT_VIEW_OPTIONS = ['City', 'Mountain', 'Waterfront', 'Lake', 'Ocean', 'Golf Course', 'Park', 'Forest/Trees', 'Valley', 'Garden'];

interface OptionManagerProps {
  title: string;
  description: string;
  options: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  onEdit: (oldValue: string, newValue: string) => void;
  placeholder: string;
}

function OptionManager({ title, description, options, onAdd, onRemove, onEdit, placeholder }: OptionManagerProps) {
  const [newValue, setNewValue] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (!newValue.trim()) {
      toast.error(`Please enter a ${title.toLowerCase()}`);
      return;
    }
    if (options.some(o => o.toLowerCase() === newValue.toLowerCase())) {
      toast.error(`${title} already exists`);
      return;
    }
    onAdd(newValue.trim());
    setNewValue('');
    toast.success(`${title} added successfully`);
  };

  const handleRemove = (item: string) => {
    onRemove(item);
    toast.success(`${title} removed`);
  };

  const startEdit = (item: string) => {
    setEditingItem(item);
    setEditValue(item);
  };

  const saveEdit = () => {
    if (!editValue.trim() || !editingItem) return;
    onEdit(editingItem, editValue.trim());
    setEditingItem(null);
    setEditValue('');
    toast.success(`${title} updated`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      
      <div className="flex gap-2">
        <Input 
          placeholder={placeholder}
          value={newValue} 
          onChange={e => setNewValue(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleAdd()} 
          className="max-w-xs h-9 text-sm" 
        />
        <Button onClick={handleAdd} size="sm" className="gap-1">
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {options.map(item => (
            <motion.div 
              key={item} 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }} 
              layout
            >
              {editingItem === item ? (
                <div className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
                  <Input 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    className="h-6 w-28 text-xs px-2" 
                    autoFocus 
                    onKeyDown={e => e.key === 'Enter' && saveEdit()} 
                  />
                  <Button variant="ghost" size="sm" onClick={saveEdit} className="h-5 w-5 p-0">
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Badge variant="outline" className="gap-1 py-1 px-2 text-xs group hover:bg-muted">
                  {item}
                  <button onClick={() => startEdit(item)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="h-2.5 w-2.5" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {title}</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove "{item}"? This won't affect existing listings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemove(item)} className="bg-destructive hover:bg-destructive/90">
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
  );
}

export function PropertyTypesManager() {
  // Property Types
  const [propertyTypes, setPropertyTypes] = useState<string[]>(DEFAULT_PROPERTY_TYPES);
  
  // Interior Features
  const [basementOptions, setBasementOptions] = useState<string[]>(DEFAULT_BASEMENT_OPTIONS);
  const [flooringOptions, setFlooringOptions] = useState<string[]>(DEFAULT_FLOORING_OPTIONS);
  const [roomOptions, setRoomOptions] = useState<string[]>(DEFAULT_ROOM_OPTIONS);
  const [indoorFeatures, setIndoorFeatures] = useState<string[]>(DEFAULT_INDOOR_FEATURES);
  
  // Exterior Features
  const [architecturalStyles, setArchitecturalStyles] = useState<string[]>(DEFAULT_ARCHITECTURAL_STYLES);
  const [parkingOptions, setParkingOptions] = useState<string[]>(DEFAULT_PARKING_OPTIONS);
  const [roofingTypes, setRoofingTypes] = useState<string[]>(DEFAULT_ROOFING_TYPES);
  const [outdoorAmenities, setOutdoorAmenities] = useState<string[]>(DEFAULT_OUTDOOR_AMENITIES);
  const [viewOptions, setViewOptions] = useState<string[]>(DEFAULT_VIEW_OPTIONS);

  const [newPropertyType, setNewPropertyType] = useState('');
  const [editingType, setEditingType] = useState<string | null>(null);
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

  // Helper functions for state updates
  const createArrayUpdaters = (
    state: string[], 
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => ({
    onAdd: (value: string) => setState([...state, value]),
    onRemove: (value: string) => setState(state.filter(i => i !== value)),
    onEdit: (oldValue: string, newValue: string) => setState(state.map(i => i === oldValue ? newValue : i))
  });

  return (
    <Tabs defaultValue="property-types" className="space-y-6">
      <TabsList className="bg-muted/50">
        <TabsTrigger value="property-types" className="gap-2">
          <Building2 className="h-4 w-4" />
          Property Types
        </TabsTrigger>
        <TabsTrigger value="interior" className="gap-2">
          <Home className="h-4 w-4" />
          Interior Features
        </TabsTrigger>
        <TabsTrigger value="exterior" className="gap-2">
          <Trees className="h-4 w-4" />
          Exterior Features
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
                onChange={e => setNewPropertyType(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && addPropertyType()} 
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
                  {propertyTypes.map(type => (
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
                            onChange={e => setEditValue(e.target.value)} 
                            className="h-6 w-24 text-xs px-2" 
                            autoFocus 
                            onKeyDown={e => e.key === 'Enter' && saveEditType()} 
                          />
                          <Button variant="ghost" size="sm" onClick={saveEditType} className="h-5 w-5 p-0">
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-sm capitalize group bg-primary">
                          {type}
                          <button onClick={() => startEditType(type)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                <AlertDialogAction onClick={() => removePropertyType(type)} className="bg-destructive hover:bg-destructive/90">
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

            <div className="p-4 rounded-lg border bg-secondary-foreground">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Property types are stored as database enums. Adding new types here updates the local state only. 
                To permanently add new property types, a database migration is required.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="interior">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Interior Features</CardTitle>
            <CardDescription>
              Manage interior feature options for property listings. Changes affect the selection options in the listing form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2" defaultValue={["basement", "flooring", "rooms", "indoor"]}>
              <AccordionItem value="basement" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  🏠 Basement Options ({basementOptions.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <OptionManager
                    title="Basement Type"
                    description="Types of basement options available"
                    options={basementOptions}
                    {...createArrayUpdaters(basementOptions, setBasementOptions)}
                    placeholder="Enter basement type..."
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="flooring" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  🪵 Flooring Types ({flooringOptions.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <OptionManager
                    title="Flooring Type"
                    description="Types of flooring available for selection"
                    options={flooringOptions}
                    {...createArrayUpdaters(flooringOptions, setFlooringOptions)}
                    placeholder="Enter flooring type..."
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rooms" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  🚪 Additional Rooms ({roomOptions.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <OptionManager
                    title="Room"
                    description="Additional room types that can be selected"
                    options={roomOptions}
                    {...createArrayUpdaters(roomOptions, setRoomOptions)}
                    placeholder="Enter room type..."
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="indoor" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  ✨ Indoor Features ({indoorFeatures.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <OptionManager
                    title="Indoor Feature"
                    description="Interior features and amenities"
                    options={indoorFeatures}
                    {...createArrayUpdaters(indoorFeatures, setIndoorFeatures)}
                    placeholder="Enter indoor feature..."
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="p-4 rounded-lg bg-muted/50 border mt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Changes here affect the options available in the listing form. 
                Existing listings will keep their current selections.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exterior">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Exterior Features</CardTitle>
            <CardDescription>
              Manage exterior feature options for property listings. Changes affect the selection options in the listing form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2" defaultValue={["arch", "parking", "roofing", "outdoor", "views"]}>
              <AccordionItem value="arch" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  🏛️ Architectural Styles ({architecturalStyles.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <OptionManager
                    title="Architectural Style"
                    description="Building architectural style options"
                    options={architecturalStyles}
                    {...createArrayUpdaters(architecturalStyles, setArchitecturalStyles)}
                    placeholder="Enter architectural style..."
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="parking" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  🚗 Parking Options ({parkingOptions.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <OptionManager
                    title="Parking Option"
                    description="Available parking types"
                    options={parkingOptions}
                    {...createArrayUpdaters(parkingOptions, setParkingOptions)}
                    placeholder="Enter parking option..."
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="roofing" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  🏠 Roofing Types ({roofingTypes.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <OptionManager
                    title="Roofing Type"
                    description="Types of roofing materials"
                    options={roofingTypes}
                    {...createArrayUpdaters(roofingTypes, setRoofingTypes)}
                    placeholder="Enter roofing type..."
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="outdoor" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  🌳 Outdoor Amenities ({outdoorAmenities.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <OptionManager
                    title="Outdoor Amenity"
                    description="Outdoor features and amenities"
                    options={outdoorAmenities}
                    {...createArrayUpdaters(outdoorAmenities, setOutdoorAmenities)}
                    placeholder="Enter outdoor amenity..."
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="views" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  👀 View Options ({viewOptions.length})
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <OptionManager
                    title="View"
                    description="Scenic view options"
                    options={viewOptions}
                    {...createArrayUpdaters(viewOptions, setViewOptions)}
                    placeholder="Enter view type..."
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="p-4 rounded-lg bg-muted/50 border mt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Changes here affect the options available in the listing form. 
                Existing listings will keep their current selections.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
