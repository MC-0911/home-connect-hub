import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ListingFormData {
  // Step 1: Basic Details
  title: string;
  description: string;
  propertyType: string;
  listingType: 'sale' | 'rent';
  price: string;
  
  // Step 2: Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Step 3: Property Features
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  lotSize: string;
  yearBuilt: string;
  annualTax: string;
  
  // Step 4: Amenities
  amenities: string[];
  
  // Step 5: Images
  images: File[];
  imagePreviewUrls: string[];
}

interface ListingFormContextType {
  formData: ListingFormData;
  updateFormData: (data: Partial<ListingFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  resetForm: () => void;
}

const initialFormData: ListingFormData = {
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
  yearBuilt: '',
  annualTax: '',
  amenities: [],
  images: [],
  imagePreviewUrls: [],
};

const ListingFormContext = createContext<ListingFormContextType | undefined>(undefined);

export const ListingFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

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
