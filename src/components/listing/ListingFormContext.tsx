import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ListingFormData {
  // Step 1: Basic Details & Features
  title: string;
  description: string;
  propertyType: string;
  listingType: 'sale' | 'rent';
  price: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  lotSize: string;
  lotSizeUnit: string;
  yearBuilt: string;
  annualTax: string;
  
  // Step 2: Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Step 3: Room & Interior Features
  basement: string;
  flooring: string[];
  rooms: string[];
  indoorFeatures: string[];
  amenities: string[];
  
  // Step 4: Exterior Features
  architecturalStyle: string;
  parking: string[];
  roofingType: string;
  outdoorAmenities: string[];
  views: string[];
  
  // Step 5: Neighborhood
  neighborhoodAmenities: {
    education: string[];
    dailyEssentials: string[];
    diningLeisure: string[];
    transportation: string[];
    parksRecreation: string[];
    healthWellness: string[];
    shopping: string[];
    cultureEntertainment: string[];
    communityServices: string[];
  };
  
  // Step 6: Images
  images: File[];
  imagePreviewUrls: string[];
  existingImageUrls: string[];
}

interface ListingFormContextType {
  formData: ListingFormData;
  updateFormData: (data: Partial<ListingFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  resetForm: () => void;
  editMode: boolean;
  propertyId: string | undefined;
}

export const initialFormData: ListingFormData = {
  title: '',
  description: '',
  propertyType: '',
  listingType: 'sale',
  price: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  bedrooms: '',
  bathrooms: '',
  squareFeet: '',
  lotSize: '',
  lotSizeUnit: 'sqft',
  yearBuilt: '',
  annualTax: '',
  basement: '',
  flooring: [],
  rooms: [],
  indoorFeatures: [],
  amenities: [],
  architecturalStyle: '',
  parking: [],
  roofingType: '',
  outdoorAmenities: [],
  views: [],
  neighborhoodAmenities: {
    education: [],
    dailyEssentials: [],
    diningLeisure: [],
    transportation: [],
    parksRecreation: [],
    healthWellness: [],
    shopping: [],
    cultureEntertainment: [],
    communityServices: [],
  },
  images: [],
  imagePreviewUrls: [],
  existingImageUrls: [],
};

const ListingFormContext = createContext<ListingFormContextType | undefined>(undefined);

interface ListingFormProviderProps {
  children: ReactNode;
  editMode?: boolean;
  propertyId?: string;
  initialData?: Partial<ListingFormData>;
}

export const ListingFormProvider = ({ 
  children, 
  editMode = false, 
  propertyId,
  initialData 
}: ListingFormProviderProps) => {
  const [formData, setFormData] = useState<ListingFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const updateFormData = (data: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  return (
    <ListingFormContext.Provider value={{
      formData,
      updateFormData,
      currentStep,
      setCurrentStep,
      totalSteps,
      resetForm,
      editMode,
      propertyId,
    }}>
      {children}
    </ListingFormContext.Provider>
  );
};

export const useListingForm = () => {
  const context = useContext(ListingFormContext);
  if (!context) {
    throw new Error('useListingForm must be used within a ListingFormProvider');
  }
  return context;
};
