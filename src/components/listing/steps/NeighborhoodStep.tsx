import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, ShoppingCart, Coffee, Train, Trees, Heart, ShoppingBag, Theater, Building2 } from 'lucide-react';
import { useListingForm } from '../ListingFormContext';

const amenityCategories = [{
  id: 'education',
  icon: GraduationCap,
  title: 'Education',
  emoji: '🏫',
  items: ['Elementary Schools', 'Middle Schools', 'High Schools', 'Daycares & Preschools', 'Colleges & Universities']
}, {
  id: 'dailyEssentials',
  icon: ShoppingCart,
  title: 'Daily Essentials',
  emoji: '🛒',
  items: ['Supermarkets/Grocery Stores', 'Pharmacies', 'Banks & ATMs', 'Post Office']
}, {
  id: 'diningLeisure',
  icon: Coffee,
  title: 'Dining & Leisure',
  emoji: '☕',
  items: ['Restaurants & Cafes', 'Coffee Shops', 'Bars & Pubs']
}, {
  id: 'transportation',
  icon: Train,
  title: 'Transportation',
  emoji: '🚉',
  items: ['Subway/Metro Stations', 'Bus Stops & Routes', 'Bike Lanes & Share Stations', 'Major Highways/Freeways']
}, {
  id: 'parksRecreation',
  icon: Trees,
  title: 'Parks & Recreation',
  emoji: '🌳',
  items: ['Parks & Playgrounds', 'Hiking/Biking Trails', 'Community Centers', 'Public Pools & Sports Fields']
}, {
  id: 'healthWellness',
  icon: Heart,
  title: 'Health & Wellness',
  emoji: '🏥',
  items: ['Hospitals & Urgent Care', 'Medical Clinics', 'Gyms & Fitness Studios', 'Yoga/Pilates Studios']
}, {
  id: 'shopping',
  icon: ShoppingBag,
  title: 'Shopping',
  emoji: '🛍️',
  items: ['Shopping Malls & Centers', 'Boutiques & Retail Stores', "Farmers' Markets"]
}, {
  id: 'cultureEntertainment',
  icon: Theater,
  title: 'Culture & Entertainment',
  emoji: '🎭',
  items: ['Movie Theaters', 'Museums & Libraries', 'Theaters & Music Venues']
}, {
  id: 'communityServices',
  icon: Building2,
  title: 'Community Services',
  emoji: '🏛️',
  items: ['Police Stations', 'Fire Stations', 'City Hall / Municipal Offices']
}];

type NeighborhoodCategoryKey = 'education' | 'dailyEssentials' | 'diningLeisure' | 'transportation' | 'parksRecreation' | 'healthWellness' | 'shopping' | 'cultureEntertainment' | 'communityServices';

export default function NeighborhoodStep() {
  const { formData, updateFormData } = useListingForm();
  const value = formData.neighborhoodAmenities;

  const handleToggle = (categoryId: string, item: string, checked: boolean) => {
    const categoryKey = categoryId as NeighborhoodCategoryKey;
    const currentItems = value[categoryKey] || [];
    const updatedItems = checked ? [...currentItems, item] : currentItems.filter(i => i !== item);
    updateFormData({
      neighborhoodAmenities: {
        ...value,
        [categoryKey]: updatedItems
      }
    });
  };

  const isChecked = (categoryId: string, item: string) => {
    const categoryKey = categoryId as NeighborhoodCategoryKey;
    return value[categoryKey]?.includes(item) || false;
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Neighborhood Amenities</h2>
        <p className="text-muted-foreground">
          Select the amenities available near your property to help buyers understand the neighborhood
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenityCategories.map(category => {
          const Icon = category.icon;
          const selectedCount = value[category.id as NeighborhoodCategoryKey]?.length || 0;
          return (
            <div key={category.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    {category.title}
                  </Label>
                  {selectedCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {selectedCount} selected
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {category.items.map(item => (
                  <div key={item} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`${category.id}-${item}`} 
                      checked={isChecked(category.id, item)} 
                      onCheckedChange={checked => handleToggle(category.id, item, checked as boolean)} 
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                    />
                    <Label 
                      htmlFor={`${category.id}-${item}`} 
                      className="text-sm font-normal cursor-pointer leading-tight"
                    >
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
