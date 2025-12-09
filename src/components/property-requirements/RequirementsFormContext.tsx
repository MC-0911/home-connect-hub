import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface RequirementsFormData {
  // Step 1: Basic Requirements
  requirementType: 'buy' | 'rent' | 'both';
  propertyType: string;
  minBedrooms: string;
  minBathrooms: string;
  
  // Step 2: Location & Budget
  preferredLocations: string[];
  maxDistance: number;
  minBudget: string;
  maxBudget: string;
  
  // Step 3: Features & Amenities
  mustHaveFeatures: string[];
  additionalRequirements: string;
  
  // Step 4: Timeline & Contact
  moveTimeline: string;
  currentSituation: string;
  fullName: string;
  email: string;
  phone: string;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp';
  marketingConsent: boolean;
}

interface RequirementsFormContextType {
  formData: RequirementsFormData;
  updateFormData: (data: Partial<RequirementsFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  resetForm: () => void;
}

const initialFormData: RequirementsFormData = {
  requirementType: 'buy',
  propertyType: '',
  minBedrooms: '1',
  minBathrooms: '1',
  preferredLocations: [],
  maxDistance: 25,
  minBudget: '',
  maxBudget: '',
  mustHaveFeatures: [],
  additionalRequirements: '',
  moveTimeline: '',
  currentSituation: '',
  fullName: '',
  email: '',
  phone: '',
  preferredContactMethod: 'email',
  marketingConsent: false,
};

const RequirementsFormContext = createContext<RequirementsFormContextType | undefined>(undefined);

export const RequirementsFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<RequirementsFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const updateFormData = (data: Partial<RequirementsFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  return (
    <RequirementsFormContext.Provider value={{
      formData,
      updateFormData,
      currentStep,
      setCurrentStep,
      totalSteps,
      resetForm,
    }}>
      {children}
    </RequirementsFormContext.Provider>
  );
};

export const useRequirementsForm = () => {
  const context = useContext(RequirementsFormContext);
  if (!context) {
    throw new Error('useRequirementsForm must be used within a RequirementsFormProvider');
  }
  return context;
};
