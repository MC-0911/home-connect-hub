import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ThumbnailCarouselProps {
  images: string[];
  title?: string;
}

const FULL_WIDTH_PX = 80;
const COLLAPSED_WIDTH_PX = 60;
const GAP_PX = 8;
const MARGIN_PX = 4;

function Thumbnails({ 
  images, 
  index, 
  setIndex 
}: { 
  images: string[]; 
  index: number; 
  setIndex: (i: number) => void;
}) {
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thumbnailsRef.current) {
      let scrollPosition = 0;
      for (let i = 0; i < index; i++) {
        scrollPosition += COLLAPSED_WIDTH_PX + GAP_PX;
      }

      scrollPosition += MARGIN_PX;

      const containerWidth = thumbnailsRef.current.offsetWidth;
      const centerOffset = containerWidth / 2 - FULL_WIDTH_PX / 2;
      scrollPosition -= centerOffset;

      thumbnailsRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [index]);

  return (
    <div className="w-full flex items-center justify-center py-3">
      <div
        ref={thumbnailsRef}
        className="flex gap-2 h-16 items-center overflow-x-auto scrollbar-hide scroll-smooth px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((url, i) => (
          <motion.div
            key={i}
            onClick={() => setIndex(i)}
            initial={false}
            animate={i === index ? 'active' : 'inactive'}
            variants={{
              active: {
                width: FULL_WIDTH_PX,
                opacity: 1,
                scale: 1.05,
              },
              inactive: {
                width: COLLAPSED_WIDTH_PX,
                opacity: 0.7,
                scale: 1,
              },
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`relative shrink-0 h-full overflow-hidden rounded-lg cursor-pointer ring-2 transition-all ${
              i === index ? 'ring-primary' : 'ring-transparent hover:ring-primary/50'
            }`}
          >
            <img
              src={url}
              alt={`Thumbnail ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FullscreenViewer({
  images,
  index,
  setIndex,
  onClose,
  title,
}: {
  images: string[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex(Math.max(0, index - 1));
      if (e.key === 'ArrowRight') setIndex(Math.min(images.length - 1, index + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, images.length, onClose, setIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/80 text-sm">
        {index + 1} / {images.length}
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <motion.img
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          src={images[index]}
          alt={`${title} - Image ${index + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Navigation buttons */}
      <button
        disabled={index === 0}
        onClick={(e) => {
          e.stopPropagation();
          setIndex(Math.max(0, index - 1));
        }}
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all
          ${index === 0 ? 'opacity-30 cursor-not-allowed bg-white/10' : 'bg-white/20 hover:bg-white/30'}`}
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        disabled={index === images.length - 1}
        onClick={(e) => {
          e.stopPropagation();
          setIndex(Math.min(images.length - 1, index + 1));
        }}
        className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all
          ${index === images.length - 1 ? 'opacity-30 cursor-not-allowed bg-white/10' : 'bg-white/20 hover:bg-white/30'}`}
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Thumbnails */}
      <div className="bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
        <Thumbnails images={images} index={index} setIndex={setIndex} />
      </div>
    </motion.div>
  );
}

export function ThumbnailCarousel({ images, title = 'Property' }: ThumbnailCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);

  useEffect(() => {
    if (!isDragging && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1;
      const targetX = -index * containerWidth;

      animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    }
  }, [index, x, isDragging]);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-full bg-secondary flex items-center justify-center rounded-xl">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full flex flex-col">
        {/* Main carousel with rounded corners */}
        <div className="relative overflow-hidden rounded-xl" ref={containerRef}>
          <motion.div
            className="flex cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, info) => {
              setIsDragging(false);
              const containerWidth = containerRef.current?.offsetWidth || 1;
              const offset = info.offset.x;
              const velocity = info.velocity.x;

              let newIndex = index;

              if (Math.abs(velocity) > 500) {
                newIndex = velocity > 0 ? index - 1 : index + 1;
              } else if (Math.abs(offset) > containerWidth * 0.3) {
                newIndex = offset > 0 ? index - 1 : index + 1;
              }

              newIndex = Math.max(0, Math.min(images.length - 1, newIndex));
              setIndex(newIndex);
            }}
            style={{ x }}
          >
            {images.map((url, i) => (
              <div
                key={i}
                className="relative shrink-0 aspect-[16/10] cursor-pointer"
                style={{ width: containerRef.current?.offsetWidth || '100%' }}
                onClick={() => !isDragging && setIsFullscreen(true)}
              >
                <img
                  src={url}
                  alt={`${title} - Image ${i + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            ))}
          </motion.div>

          {/* Previous Button */}
          <button
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => Math.max(0, i - 1));
            }}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10
              ${index === 0
                ? 'opacity-40 cursor-not-allowed bg-card/50'
                : 'bg-card/90 backdrop-blur-sm hover:scale-110 hover:bg-card opacity-80'
              }`}
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          {/* Next Button */}
          <button
            disabled={index === images.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => Math.min(images.length - 1, i + 1));
            }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10
              ${index === images.length - 1
                ? 'opacity-40 cursor-not-allowed bg-card/50'
                : 'bg-card/90 backdrop-blur-sm hover:scale-110 hover:bg-card opacity-80'
              }`}
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
            {index + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails below the main image */}
        {images.length > 1 && <Thumbnails images={images} index={index} setIndex={setIndex} />}
      </div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {isFullscreen && (
          <FullscreenViewer
            images={images}
            index={index}
            setIndex={setIndex}
            onClose={() => setIsFullscreen(false)}
            title={title}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ThumbnailCarousel;
