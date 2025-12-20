import React from 'react';
import { motion } from 'framer-motion';
import { Check, Home, MapPin, Ruler, Sparkles, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}
const steps = [{
  label: 'Basic Info',
  icon: Home
}, {
  label: 'Location',
  icon: MapPin
}, {
  label: 'Features',
  icon: Ruler
}, {
  label: 'Amenities',
  icon: Sparkles
}, {
  label: 'Photos',
  icon: ImageIcon
}];
const StepIndicator = ({
  currentStep,
  totalSteps
}: StepIndicatorProps) => {
  return <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const Icon = step.icon;
        return <React.Fragment key={step.label}>
              <div className="flex flex-col items-center">
                <motion.div initial={false} animate={{
              scale: isCurrent ? 1.1 : 1
            }} className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md", isCompleted ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30" : isCurrent ? "bg-gradient-to-br from-gold to-gold-dark text-primary-foreground shadow-gold/40 ring-4 ring-gold/20" : "bg-muted/50 text-muted-foreground border-2 border-muted-foreground/20")}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </motion.div>
                <span className={cn("mt-2 text-sm font-medium hidden sm:block", isCurrent ? "text-primary" : "text-muted-foreground")}>
                  {step.label}
                </span>
              </div>
              
              {index < totalSteps - 1 && <div className="flex-1 mx-2">
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{
                width: 0
              }} animate={{
                width: isCompleted ? '100%' : '0%'
              }} transition={{
                duration: 0.3
              }} className="h-full bg-primary" />
                  </div>
                </div>}
            </React.Fragment>;
      })}
      </div>
    </div>;
};
export default StepIndicator;