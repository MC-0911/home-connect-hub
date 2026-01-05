import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useListingForm, ListingFormProvider, ListingFormData } from './ListingFormContext';
import StepIndicator from './StepIndicator';
import BasicInfoStep from './steps/BasicInfoStep';
import LocationStep from './steps/LocationStep';
import AmenitiesStep from './steps/AmenitiesStep';
import ExteriorFeaturesStep from './steps/ExteriorFeaturesStep';
import NeighborhoodStep from './steps/NeighborhoodStep';
import LandFeaturesStep from './steps/LandFeaturesStep';
import ImagesStep from './steps/ImagesStep';
import SuccessStep from './steps/SuccessStep';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Steps for non-land properties
const regularStepComponents = [BasicInfoStep, LocationStep, AmenitiesStep, ExteriorFeaturesStep, NeighborhoodStep, ImagesStep];
// Steps for land properties (replace Interior, Exterior, Neighborhood with LandFeatures)
const landStepComponents = [BasicInfoStep, LocationStep, LandFeaturesStep, ImagesStep];

const ListingFormContent = ({
  className
}: {
  className?: string;
}) => {
  const {
    formData,
    currentStep,
    setCurrentStep,
    totalSteps,
    resetForm,
    editMode,
    propertyId
  } = useListingForm();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  const isLandProperty = formData.propertyType === 'land';
  const stepComponents = isLandProperty ? landStepComponents : regularStepComponents;
  const actualTotalSteps = isLandProperty ? 4 : 6;
  const CurrentStepComponent = stepComponents[currentStep - 1];
  const validateStep = (step: number): boolean => {
    const isLand = formData.propertyType === 'land';
    
    switch (step) {
      case 1:
        if (!formData.propertyType || !formData.price) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields.",
            variant: "destructive"
          });
          return false;
        }
        if (!isLand && (!formData.bedrooms || !formData.bathrooms || !formData.squareFeet)) {
          toast({
            title: "Missing Features",
            description: "Please provide bedroom, bathroom, and square footage details.",
            variant: "destructive"
          });
          return false;
        }
        if (isLand && !formData.lotSize) {
          toast({
            title: "Missing Lot Size",
            description: "Please provide the lot size for land properties.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
          toast({
            title: "Missing Location",
            description: "Please provide the complete property address.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        return true; // Land features or Interior features are optional
      case 4:
        // For land: this is Images step; for regular: this is Exterior step
        if (isLand) {
          if (formData.images.length === 0 && formData.existingImageUrls.length === 0) {
            toast({
              title: "No Images",
              description: "Please add at least one photo of your property.",
              variant: "destructive"
            });
            return false;
          }
        }
        return true;
      case 5:
        return true; // Neighborhood amenities are optional
      case 6:
        // Images step for regular properties
        if (formData.images.length === 0 && formData.existingImageUrls.length === 0) {
          toast({
            title: "No Images",
            description: "Please add at least one photo of your property.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < actualTotalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  };
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to list your property.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    setIsSubmitting(true);
    try {
      // Upload new images to Supabase Storage
      const newImageUrls: string[] = [];
      for (const file of formData.images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const {
          error: uploadError
        } = await supabase.storage.from('property-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const {
          data: {
            publicUrl
          }
        } = supabase.storage.from('property-images').getPublicUrl(fileName);
        newImageUrls.push(publicUrl);
      }

      // Combine existing and new image URLs
      const allImageUrls = [...formData.existingImageUrls, ...newImageUrls];
      const isLand = formData.propertyType === 'land';
      
      const propertyData: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyType as any,
        listing_type: formData.listingType as any,
        price: parseFloat(formData.price),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : 0,
        square_feet: formData.squareFeet ? parseInt(formData.squareFeet) : 0,
        lot_size: formData.lotSize ? parseInt(formData.lotSize) : null,
        lot_size_unit: formData.lotSizeUnit || 'sqft',
        year_built: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        year_renovated: formData.yearRenovated ? parseInt(formData.yearRenovated) : null,
        parcel_number: formData.parcelNumber || null,
        annual_tax: formData.annualTax ? parseFloat(formData.annualTax) : null,
        amenities: formData.amenities,
        images: allImageUrls,
      };

      if (isLand) {
        // Land-specific fields
        propertyData.zoning_type = formData.zoningType || null;
        propertyData.allowed_uses = formData.allowedUses;
        propertyData.buildable = formData.buildable || null;
        propertyData.can_subdivide = formData.canSubdivide || null;
        propertyData.road_access = formData.roadAccess || null;
        propertyData.utilities_available = formData.utilitiesAvailable;
        propertyData.water_rights = formData.waterRights || null;
        propertyData.topography = formData.topography || null;
        propertyData.land_views = formData.landViews;
        propertyData.fencing = formData.fencing || null;
        propertyData.vegetation = formData.vegetation || null;
        propertyData.distance_to_town = formData.distanceToTown || null;
        propertyData.distance_to_grocery = formData.distanceToGrocery || null;
        propertyData.recreational_features = formData.recreationalFeatures;
        propertyData.land_additional_notes = formData.landAdditionalNotes || null;
      } else {
        // Interior features
        propertyData.basement = formData.basement || null;
        propertyData.flooring = formData.flooring;
        propertyData.rooms = formData.rooms;
        propertyData.indoor_features = formData.indoorFeatures;
        // Exterior features
        propertyData.architectural_style = formData.architecturalStyle || null;
        propertyData.parking = formData.parking;
        propertyData.roofing_type = formData.roofingType || null;
        propertyData.outdoor_amenities = formData.outdoorAmenities;
        propertyData.views = formData.views;
        // Neighborhood amenities
        propertyData.neighborhood_amenities = formData.neighborhoodAmenities;
      }
      if (editMode && propertyId) {
        // Update existing property
        const {
          error: updateError
        } = await supabase.from('properties').update(propertyData).eq('id', propertyId).eq('user_id', user.id);
        if (updateError) throw updateError;
        toast({
          title: "Listing Updated!",
          description: "Your property has been updated successfully."
        });
      } else {
        // Insert new property
        const {
          error: insertError
        } = await supabase.from('properties').insert({
          user_id: user.id,
          ...propertyData
        } as any);
        if (insertError) throw insertError;
        toast({
          title: "Listing Submitted!",
          description: "Your property is under review and will be published once approved."
        });
        setShowSuccess(true);
        resetForm();
        return;
      }
      resetForm();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (showSuccess) {
    return <SuccessStep />;
  }
  return <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto py-[75px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {editMode ? 'Edit Your Property' : 'List Your Property'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {editMode ? 'Update your property details' : 'Complete all steps to publish your listing'}
          </p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={actualTotalSteps} isLandProperty={isLandProperty} />

        <Card className="mt-8">
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.3
            }}>
                <CurrentStepComponent />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < actualTotalSteps ? <Button type="button" onClick={handleNext} className="gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button> : <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  {isSubmitting ? <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editMode ? 'Updating...' : 'Submitting...'}
                    </> : <>
                      <Check className="w-4 h-4" />
                      {editMode ? 'Update Listing' : 'Publish Listing'}
                    </>}
                </Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
interface ListingFormWizardProps {
  editMode?: boolean;
  propertyId?: string;
  initialData?: Partial<ListingFormData>;
}
const ListingFormWizard = ({
  editMode = false,
  propertyId,
  initialData
}: ListingFormWizardProps) => {
  return <ListingFormProvider editMode={editMode} propertyId={propertyId} initialData={initialData}>
      <ListingFormContent className="bg-primary-foreground" />
    </ListingFormProvider>;
};
export default ListingFormWizard;