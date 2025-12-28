import React from 'react';
import { motion } from 'framer-motion';
import { Check, Home, MapPin, Ruler, Sparkles, Trees, ImageIcon } from 'lucide-react';
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
  label: 'Interior',
  icon: Ruler
}, {
  label: 'Exterior',
  icon: Trees
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
              <div className="flex flex-col items-center group cursor-pointer">
                <motion.div 
                  initial={false} 
                  animate={{
                    scale: isCurrent ? 1.1 : 1
                  }}
                  whileHover={{ scale: 1.15 }}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
                    isCompleted 
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/50" 
                      : isCurrent 
                        ? "bg-gradient-to-br from-gold to-gold-dark text-navy shadow-gold/40 ring-4 ring-gold/20 hover:shadow-gold/60" 
                        : "bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/80 hover:shadow-primary/40 hover:shadow-lg"
                  )}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </motion.div>
                <span className={cn(
                  "mt-2 text-sm font-medium hidden sm:block transition-colors duration-200",
                  isCurrent 
                    ? "text-primary font-semibold" 
                    : isCompleted 
                      ? "text-emerald-600 group-hover:text-emerald-500" 
                      : "text-foreground group-hover:text-primary"
                )}>
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