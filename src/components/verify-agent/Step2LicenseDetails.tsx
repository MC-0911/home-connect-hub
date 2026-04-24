import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATE_OPTIONS } from "@/lib/verification/states";
import { uploadVerificationFile } from "@/lib/verification/verification-service";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPT = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

export const step2Schema = z.object({
  license_number: z
    .string()
    .trim()
    .min(3, "Required")
    .max(40)
    .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and dashes only"),
  state: z.string().min(2, "Required"),
  license_expiry: z
    .string()
    .min(1, "Required")
    .refine((v) => new Date(v) > new Date(), "Date must be in the future"),
  license_photo_url: z.string().min(1, "Upload your license"),
  board_membership_url: z.string().optional().nullable(),
  confirm: z.literal(true, {
    errorMap: () => ({ message: "You must confirm" }),
  }),
});

export type Step2Values = z.infer<typeof step2Schema>;

interface Props {
  userId: string;
  defaultValues: Partial<Step2Values>;
  onBack: () => void;
  onNext: (values: Step2Values) => void;
}

export function Step2LicenseDetails({ userId, defaultValues, onBack, onNext }: Props) {
  const form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues,
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [boardFile, setBoardFile] = useState<File | null>(null);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingBoard, setUploadingBoard] = useState(false);

  const handleUpload = useCallback(
    async (file: File, kind: "license" | "board") => {
      if (!ACCEPT.includes(file.type)) {
        toast.error("Only images or PDF allowed");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("File too large (max 5MB)");
        return;
      }
      const setter = kind === "license" ? setUploadingLicense : setUploadingBoard;
      setter(true);
      try {
        const path = await uploadVerificationFile(userId, file, kind);
        if (kind === "license") {
          setLicenseFile(file);
          form.setValue("license_photo_url", path, { shouldValidate: true });
        } else {
          setBoardFile(file);
          form.setValue("board_membership_url", path);
        }
        toast.success(`${kind === "license" ? "License" : "Board card"} uploaded`);
      } catch (e) {
        console.error(e);
        toast.error("Upload failed. Try again.");
      } finally {
        setter(false);
      }
    },
    [userId, form],
  );

  const licenseValue = form.watch("license_photo_url");
  const boardValue = form.watch("board_membership_url");

  return (
    <motion.form
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={form.handleSubmit(onNext)}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="license_number">License Number</Label>
          <Input
            id="license_number"
            placeholder="ABC-123456"
            {...form.register("license_number", {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
              },
            })}
          />
          {form.formState.errors.license_number && (
            <p className="text-xs text-destructive">{form.formState.errors.license_number.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>State / Province</Label>
          <Select
            defaultValue={defaultValues.state}
            onValueChange={(v) => form.setValue("state", v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {STATE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.state && (
            <p className="text-xs text-destructive">{form.formState.errors.state.message}</p>
          )}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="license_expiry">License Expiration Date</Label>
          <Input
            id="license_expiry"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            {...form.register("license_expiry")}
          />
          {form.formState.errors.license_expiry && (
            <p className="text-xs text-destructive">{form.formState.errors.license_expiry.message}</p>
          )}
        </div>
      </div>

      <FileDropzone
        label="License Certificate or Photo ID"
        required
        file={licenseFile}
        uploaded={!!licenseValue}
        uploading={uploadingLicense}
        onFile={(f) => handleUpload(f, "license")}
        onClear={() => {
          setLicenseFile(null);
          form.setValue("license_photo_url", "", { shouldValidate: true });
        }}
        error={form.formState.errors.license_photo_url?.message}
      />

      <FileDropzone
        label="Real Estate Board Membership Card (optional)"
        file={boardFile}
        uploaded={!!boardValue}
        uploading={uploadingBoard}
        onFile={(f) => handleUpload(f, "board")}
        onClear={() => {
          setBoardFile(null);
          form.setValue("board_membership_url", null);
        }}
      />

      <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <Checkbox
          checked={!!form.watch("confirm")}
          onCheckedChange={(v) => form.setValue("confirm", v === true ? true : (false as unknown as true), { shouldValidate: true })}
          className="mt-0.5"
        />
        <span className="text-sm text-foreground">
          I confirm this license is active and valid, and the documents I upload are authentic.
        </span>
      </label>
      {form.formState.errors.confirm && (
        <p className="text-xs text-destructive">{form.formState.errors.confirm.message as string}</p>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90"
        >
          Submit for Verification
        </Button>
      </div>
    </motion.form>
  );
}

interface DropzoneProps {
  label: string;
  required?: boolean;
  file: File | null;
  uploaded: boolean;
  uploading: boolean;
  onFile: (f: File) => void;
  onClear: () => void;
  error?: string;
}

function FileDropzone({ label, required, file, uploaded, uploading, onFile, onClear, error }: DropzoneProps) {
  const [drag, setDrag] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          drag ? "border-accent bg-accent/5" : "border-border hover:border-accent/60"
        }`}
      >
        <input
          type="file"
          accept="image/*,application/pdf"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
            Uploading…
          </div>
        ) : uploaded ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <FileText className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-foreground">{file?.name ?? "Uploaded file"}</p>
                <p className="text-xs text-muted-foreground">Successfully uploaded</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClear(); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <UploadCloud className="h-8 w-8 text-accent" />
            <p><span className="font-medium text-foreground">Click to upload</span> or drag and drop</p>
            <p className="text-xs">PNG, JPG, WEBP or PDF · max 5MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
