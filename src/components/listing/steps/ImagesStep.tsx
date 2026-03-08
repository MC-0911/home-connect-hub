import React, { useCallback, useState, useRef } from 'react';
import { useListingForm } from '../ListingFormContext';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type UnifiedImage = 
  | { type: 'existing'; url: string; originalIndex: number }
  | { type: 'new'; url: string; originalIndex: number };

const ImagesStep = () => {
  const { formData, updateFormData } = useListingForm();
  const isMobile = useIsMobile();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  // Build a unified ordered list of all images
  const unifiedImages: UnifiedImage[] = [
    ...formData.existingImageUrls.map((url, i) => ({ type: 'existing' as const, url, originalIndex: i })),
    ...formData.imagePreviewUrls.map((url, i) => ({ type: 'new' as const, url, originalIndex: i })),
  ];

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    updateFormData({
      images: [...formData.images, ...newFiles],
      imagePreviewUrls: [...formData.imagePreviewUrls, ...newPreviews]
    });
  }, [formData.images, formData.imagePreviewUrls, updateFormData]);

  const removeImage = (unifiedIdx: number) => {
    const item = unifiedImages[unifiedIdx];
    if (item.type === 'existing') {
      const newExisting = [...formData.existingImageUrls];
      newExisting.splice(item.originalIndex, 1);
      updateFormData({ existingImageUrls: newExisting });
    } else {
      const newImages = [...formData.images];
      const newPreviews = [...formData.imagePreviewUrls];
      URL.revokeObjectURL(newPreviews[item.originalIndex]);
      newImages.splice(item.originalIndex, 1);
      newPreviews.splice(item.originalIndex, 1);
      updateFormData({ images: newImages, imagePreviewUrls: newPreviews });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 60, 60);
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder the unified list
    const reordered = [...unifiedImages];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Split back into existing and new arrays
    const newExisting: string[] = [];
    const newPreviewUrls: string[] = [];
    const newFiles: File[] = [];

    for (const item of reordered) {
      if (item.type === 'existing') {
        newExisting.push(item.url);
      } else {
        newPreviewUrls.push(item.url);
        newFiles.push(formData.images[item.originalIndex]);
      }
    }

    updateFormData({
      existingImageUrls: newExisting,
      imagePreviewUrls: newPreviewUrls,
      images: newFiles,
    });

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragCounter.current = 0;
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= unifiedImages.length) return;
    const reordered = [...unifiedImages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const newExisting: string[] = [];
    const newPreviewUrls: string[] = [];
    const newFiles: File[] = [];
    for (const item of reordered) {
      if (item.type === 'existing') {
        newExisting.push(item.url);
      } else {
        newPreviewUrls.push(item.url);
        newFiles.push(formData.images[item.originalIndex]);
      }
    }
    updateFormData({
      existingImageUrls: newExisting,
      imagePreviewUrls: newPreviewUrls,
      images: newFiles,
    });
  };

  const totalImages = unifiedImages.length;

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
          {totalImages > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {totalImages} image{totalImages !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Drag to reorder · First image is the cover
                </p>
                <p className="text-sm text-muted-foreground sm:hidden">
                  First image is the cover
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {unifiedImages.map((item, index) => (
                  <div
                    key={`${item.type}-${item.url}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "relative aspect-square group cursor-grab active:cursor-grabbing rounded-lg transition-all duration-200",
                      dragIndex === index && "opacity-40 scale-95",
                      dragOverIndex === index && dragIndex !== index && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                    )}
                  >
                    <img
                      src={item.url}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-border pointer-events-none"
                    />

                    {/* Cover Badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full z-10">
                        Cover
                      </div>
                    )}

                    {/* New Badge */}
                    {item.type === 'new' && index !== 0 && (
                      <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full z-10">
                        New
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors rounded-lg">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalImages === 0 && (
            <div className="rounded-lg p-4 text-center bg-muted/50">
              <p className="text-muted-foreground">
                Add at least one photo of your property. High-quality images help attract more buyers.
              </p>
            </div>
          )}

          {/* Property Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🖼️</span>
              <h3 className="font-medium text-foreground">Property Description</h3>
            </div>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Paint a picture for potential buyers! Describe what makes your home special, the neighborhood, nearby amenities, recent updates, and anything else that would make someone fall in love with your property..."
                className="w-full min-h-[120px] p-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                maxLength={2000}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <p>Pro tip: Highlight unique features and recent renovations</p>
              <p>{formData.description.length} characters</p>
            </div>
          </div>

          {/* Ready Message */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-5 text-center">
            <p className="text-lg font-semibold text-primary mb-2">
              Ready to Go Live? 🎉
            </p>
            <p className="text-sm text-muted-foreground">
              Click "Publish Listing" below to make your property visible to potential buyers.
              You can always edit your listing later if needed.
            </p>
          </div>
    </div>
  );
};

export default ImagesStep;
