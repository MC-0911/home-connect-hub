import React, { useCallback } from 'react';
import { useListingForm } from '../ListingFormContext';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImagesStep = () => {
  const { formData, updateFormData } = useListingForm();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    updateFormData({
      images: [...formData.images, ...newFiles],
      imagePreviewUrls: [...formData.imagePreviewUrls, ...newPreviews],
    });
  }, [formData.images, formData.imagePreviewUrls, updateFormData]);

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    const newPreviews = [...formData.imagePreviewUrls];
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    updateFormData({
      images: newImages,
      imagePreviewUrls: newPreviews,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-semibold text-foreground">Property Photos</h2>
        <p className="text-muted-foreground mt-1">Add photos to showcase your property</p>
      </div>

      {/* Upload Area */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          id="image-upload"
        />
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
          <ImagePlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">Drop images here or click to upload</p>
          <p className="text-sm text-muted-foreground mt-1">
            PNG, JPG, WEBP up to 10MB each
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      {formData.imagePreviewUrls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {formData.imagePreviewUrls.length} image{formData.imagePreviewUrls.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-sm text-muted-foreground">
              First image will be the cover photo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {formData.imagePreviewUrls.map((url, index) => (
                <motion.div
                  key={url}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square group"
                >
                  <img
                    src={url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                  
                  {/* Cover Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Cover
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors rounded-lg">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-card/90 text-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                        <GripVertical className="h-3 w-3" />
                        Drag to reorder
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {formData.imagePreviewUrls.length === 0 && (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-muted-foreground">
            Add at least one photo of your property. High-quality images help attract more buyers.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagesStep;
