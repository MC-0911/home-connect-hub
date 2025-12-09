import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRequirementsForm } from "../RequirementsFormContext";
import { Calendar } from "lucide-react";

const timelineOptions = [
  { value: 'immediately', label: 'Immediately' },
  { value: '1-3-months', label: '1-3 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: '6-plus-months', label: '6+ months' },
];

const situationOptions = [
  { value: 'first-time', label: 'First-time buyer' },
  { value: 'renting', label: 'Renting currently' },
  { value: 'selling', label: 'Selling current home' },
  { value: 'investor', label: 'Investor' },
];

export const ContactDetailsStep = () => {
  const { formData, updateFormData } = useRequirementsForm();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-primary">
        <Calendar className="h-6 w-6" />
        <h2 className="text-2xl font-display font-semibold">Final Details</h2>
      </div>

      <div className="space-y-6">
        {/* Timeline & Situation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="moveTimeline" className="text-base font-medium">
              When do you plan to move?
            </Label>
            <Select
              value={formData.moveTimeline}
              onValueChange={(value) => updateFormData({ moveTimeline: value })}
            >
              <SelectTrigger id="moveTimeline" className="bg-background">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {timelineOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="currentSituation" className="text-base font-medium">
              Your situation?
            </Label>
            <Select
              value={formData.currentSituation}
              onValueChange={(value) => updateFormData({ currentSituation: value })}
            >
              <SelectTrigger id="currentSituation" className="bg-background">
                <SelectValue placeholder="Select your situation" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {situationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Contact Information</Label>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => updateFormData({ fullName: e.target.value })}
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>
        </div>

        {/* Preferred Contact Method */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Preferred Contact Method</Label>
          <RadioGroup
            value={formData.preferredContactMethod}
            onValueChange={(value: 'email' | 'phone' | 'whatsapp') => 
              updateFormData({ preferredContactMethod: value })
            }
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="contact-email" />
              <Label htmlFor="contact-email" className="cursor-pointer font-normal">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="phone" id="contact-phone" />
              <Label htmlFor="contact-phone" className="cursor-pointer font-normal">Phone</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="whatsapp" id="contact-whatsapp" />
              <Label htmlFor="contact-whatsapp" className="cursor-pointer font-normal">WhatsApp</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Marketing Consent */}
        <div className="flex items-start space-x-3 p-4 bg-secondary/50 rounded-lg">
          <Checkbox
            id="marketingConsent"
            checked={formData.marketingConsent}
            onCheckedChange={(checked) => updateFormData({ marketingConsent: checked as boolean })}
          />
          <Label 
            htmlFor="marketingConsent" 
            className="cursor-pointer font-normal text-sm leading-relaxed"
          >
            I agree to receive property matches and updates. You can unsubscribe at any time.
          </Label>
        </div>
      </div>
    </div>
  );
};
