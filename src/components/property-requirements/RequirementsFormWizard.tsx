import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RequirementsFormProvider, useRequirementsForm } from './RequirementsFormContext';
import { BasicRequirementsStep } from './steps/BasicRequirementsStep';
import { LocationBudgetStep } from './steps/LocationBudgetStep';
import { FeaturesAmenitiesStep } from './steps/FeaturesAmenitiesStep';
import { ContactDetailsStep } from './steps/ContactDetailsStep';
import { ArrowLeft, ArrowRight, Send, Check, Home, MapPin, Star, Calendar } from 'lucide-react';
const stepComponents = [BasicRequirementsStep, LocationBudgetStep, FeaturesAmenitiesStep, ContactDetailsStep];
const stepInfo = [{
  icon: Home,
  label: 'Basics'
}, {
  icon: MapPin,
  label: 'Location'
}, {
  icon: Star,
  label: 'Features'
}, {
  icon: Calendar,
  label: 'Contact'
}];
const RequirementsFormContent = () => {
  const {
    formData,
    currentStep,
    setCurrentStep,
    totalSteps,
    resetForm
  } = useRequirementsForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.propertyType) {
          toast({
            title: "Please select a property type",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (formData.minBudget && formData.maxBudget && Number(formData.minBudget) > Number(formData.maxBudget)) {
          toast({
            title: "Minimum budget cannot exceed maximum budget",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        if (!formData.fullName.trim()) {
          toast({
            title: "Please enter your full name",
            variant: "destructive"
          });
          return false;
        }
        if (!formData.email.trim()) {
          toast({
            title: "Please enter your email address",
            variant: "destructive"
          });
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast({
            title: "Please enter a valid email address",
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
      setCurrentStep(currentStep + 1);
    }
  };
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from('buyer_requirements').insert({
        user_id: user?.id || null,
        requirement_type: formData.requirementType,
        property_type: formData.propertyType,
        min_bedrooms: parseInt(formData.minBedrooms) || 0,
        min_bathrooms: parseInt(formData.minBathrooms) || 1,
        preferred_locations: formData.preferredLocations,
        max_distance: formData.maxDistance,
        min_budget: formData.minBudget ? parseFloat(formData.minBudget) : null,
        max_budget: formData.maxBudget ? parseFloat(formData.maxBudget) : null,
        must_have_features: formData.mustHaveFeatures,
        additional_requirements: formData.additionalRequirements || null,
        move_timeline: formData.moveTimeline || null,
        current_situation: formData.currentSituation || null,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        preferred_contact_method: formData.preferredContactMethod,
        marketing_consent: formData.marketingConsent
      });
      if (error) throw error;
      setIsSubmitted(true);
      toast({
        title: "Your requirements have been submitted successfully!"
      });
    } catch (error: any) {
      console.error('Error submitting requirements:', error);
      toast({
        title: "Error submitting requirements",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const CurrentStepComponent = stepComponents[currentStep - 1];
  if (isSubmitted) {
    return <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="text-center py-12 px-6">
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-3xl font-display font-bold text-primary mb-4">
          Thank You!
        </h2>
        <p className="text-lg text-muted-foreground mb-2">
          We're searching for your perfect matches...
        </p>
        <p className="text-muted-foreground mb-8">
          You'll receive your first property matches within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/properties')} className="bg-primary hover:bg-primary/90">
            Browse Properties Now
          </Button>
          <Button variant="outline" onClick={() => {
          resetForm();
          setIsSubmitted(false);
        }}>
            Submit Another Request
          </Button>
        </div>
      </motion.div>;
  }
  return <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {stepInfo.map((step, index) => {
        const StepIcon = step.icon;
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isCurrent = currentStep === stepNumber;
        return <div key={step.label} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all z-10
                    ${isCompleted ? 'bg-accent text-accent-foreground' : ''}
                    ${isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-secondary text-muted-foreground' : ''}
                  `}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5 text-white" />}
                </div>
                <span className={`
                  text-xs mt-2 font-medium hidden sm:block
                  ${isCurrent ? 'text-primary' : 'text-muted-foreground'}
                `}>
                  {step.label}
                </span>
              </div>
              {index < stepInfo.length - 1 && <div className="absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2">
                  <div className={`h-full transition-all ${isCompleted ? 'bg-accent' : 'bg-border'}`} />
                </div>}
            </div>;
      })}
      </div>

      {/* Form Content */}
      <div className="bg-card rounded-xl border p-6 sm:p-8 shadow-md">
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
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep < totalSteps ? <Button onClick={handleNext} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
            Next
            <ArrowRight className="w-4 h-4" />
          </Button> : <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
            {isSubmitting ? <>Submitting...</> : <>
                Find My Perfect Properties
                <Send className="w-4 h-4" />
              </>}
          </Button>}
      </div>
    </div>;
};
export const RequirementsFormWizard = () => {
  return <RequirementsFormProvider>
      <RequirementsFormContent />
    </RequirementsFormProvider>;
};