import { useCallback, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
};

export function BlogCoverImagePicker({ value, onChange, maxSizeMB = 8 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const previewUrl = useMemo(() => {
    if (!value) return "";
    // help avoid browser caching if user re-uploads same file name
    return value.includes("?") ? value : `${value}?t=${Date.now()}`;
  }, [value]);

  const triggerPick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);

        if (!file.type.startsWith("image/")) {
          toast.error("Please select an image file");
          return;
        }

        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
          toast.error(`Image size should be less than ${maxSizeMB}MB`);
          return;
        }

        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
        const objectPath = `covers/${crypto.randomUUID()}.${safeExt}`;

        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(objectPath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Cover image upload failed:", uploadError);
          toast.error("Failed to upload cover image");
          return;
        }

        const { data } = supabase.storage.from("blog-images").getPublicUrl(objectPath);
        onChange(data.publicUrl);
        toast.success("Cover image uploaded");
      } catch (err) {
        console.error("Cover image upload unexpected error:", err);
        toast.error("Failed to upload cover image");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [maxSizeMB, onChange]
  );

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <div className="rounded-lg border bg-muted/20 overflow-hidden">
        {value ? (
          <img
            src={previewUrl}
            alt="Blog cover preview"
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <span>No cover image</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={triggerPick} disabled={isUploading}>
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </Button>

        {value && (
          <Button type="button" variant="outline" onClick={clear} disabled={isUploading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      {/* Keep the resulting URL visible for admins (copy/paste/debug) */}
      <Input value={value || ""} readOnly placeholder="Cover image URL will appear here after upload" />
    </div>
  );
}
