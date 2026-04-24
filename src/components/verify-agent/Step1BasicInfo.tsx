import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPERIENCE_OPTIONS } from "@/lib/verification/states";

export const step1Schema = z.object({
  full_name: z.string().trim().min(2, "Required").max(100),
  email: z.string().email(),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20),
  agency_name: z.string().trim().min(2, "Required").max(120),
  years_experience: z.string().optional(),
});

export type Step1Values = z.infer<typeof step1Schema>;

interface Props {
  defaultValues: Partial<Step1Values>;
  email: string;
  onNext: (values: Step1Values) => void;
}

export function Step1BasicInfo({ defaultValues, email, onNext }: Props) {
  const form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email, ...defaultValues },
  });

  return (
    <motion.form
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={form.handleSubmit(onNext)}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" {...form.register("full_name")} placeholder="Jane Doe" />
          {form.formState.errors.full_name && (
            <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" disabled value={email} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...form.register("phone")} placeholder="+1 555 123 4567" />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agency_name">Agency Name</Label>
          <Input id="agency_name" {...form.register("agency_name")} placeholder="Royal Realty" />
          {form.formState.errors.agency_name && (
            <p className="text-xs text-destructive">{form.formState.errors.agency_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Years of Experience (optional)</Label>
          <Select
            defaultValue={defaultValues.years_experience}
            onValueChange={(v) => form.setValue("years_experience", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90"
        >
          Continue
        </Button>
      </div>
    </motion.form>
  );
}
