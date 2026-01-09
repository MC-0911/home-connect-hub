import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
}

const PropertyImageGallery = ({ images, title }: PropertyImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[16/10] rounded-2xl bg-secondary flex items-center justify-center">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Main Image */}
        <div className="lg:col-span-3 relative aspect-[16/10] rounded-2xl overflow-hidden group">
          <img
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500"
          />
          
          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-card/90 backdrop-blur-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
          >
            <Expand className="w-4 h-4" />
            <span className="text-sm font-medium">View All Photos</span>
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm">
            <span className="text-sm font-medium">{currentIndex + 1} / {images.length}</span>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="hidden lg:flex flex-col gap-3 h-full">
          {images.slice(1, 3).map((image, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx + 1)}
              className={`relative flex-1 rounded-xl overflow-hidden transition-all ${
                currentIndex === idx + 1 ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"
              }`}
            >
              <img
                src={image}
                alt={`${title} - Thumbnail ${idx + 2}`}
                className="w-full h-full object-cover"
              />
              {idx === 1 && images.length > 3 && (
                <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">+{images.length - 3} more</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center hover:bg-card/30 transition-colors"
          >
            <X className="w-6 h-6 text-primary-foreground" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center hover:bg-card/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-primary-foreground" />
          </button>

          <div className="max-w-5xl max-h-[80vh] px-20">
            <img
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>

          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center hover:bg-card/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-primary-foreground" />
          </button>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
            {images.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden transition-all shrink-0 ${
                  currentIndex === idx ? "ring-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"
                }`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyImageGallery;
