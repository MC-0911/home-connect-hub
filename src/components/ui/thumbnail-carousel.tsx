import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ThumbnailCarouselProps {
  images: string[];
  title?: string;
}

const FULL_WIDTH_PX = 120;
const COLLAPSED_WIDTH_PX = 35;
const GAP_PX = 2;
const MARGIN_PX = 2;

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
    <div className="relative w-full h-16 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />
      
      <div
        ref={thumbnailsRef}
        className="flex gap-[2px] h-12 items-center overflow-x-auto scrollbar-hide scroll-smooth"
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
                marginLeft: MARGIN_PX,
                marginRight: MARGIN_PX,
              },
              inactive: {
                width: COLLAPSED_WIDTH_PX,
                marginLeft: 0,
                marginRight: 0,
              },
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative shrink-0 h-full overflow-hidden rounded cursor-pointer"
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

export function ThumbnailCarousel({ images, title = 'Property' }: ThumbnailCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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
      <div className="relative w-full h-full bg-secondary flex items-center justify-center">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-secondary">
      <div className="relative flex-1 overflow-hidden" ref={containerRef}>
        {/* Main Carousel */}
        <motion.div
          className="flex h-full cursor-grab active:cursor-grabbing"
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

            // If fast swipe, use velocity
            if (Math.abs(velocity) > 500) {
              newIndex = velocity > 0 ? index - 1 : index + 1;
            }
            // Otherwise use offset threshold (30% of container width)
            else if (Math.abs(offset) > containerWidth * 0.3) {
              newIndex = offset > 0 ? index - 1 : index + 1;
            }

            // Clamp index
            newIndex = Math.max(0, Math.min(images.length - 1, newIndex));
            setIndex(newIndex);
          }}
          style={{ x }}
        >
          {images.map((url, i) => (
            <div
              key={i}
              className="relative w-full h-full shrink-0"
              style={{ width: containerRef.current?.offsetWidth || '100%' }}
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
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10
            ${
              index === 0
                ? 'opacity-40 cursor-not-allowed bg-card/50'
                : 'bg-card/90 backdrop-blur-sm hover:scale-110 hover:bg-card opacity-80'
            }`}
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Next Button */}
        <button
          disabled={index === images.length - 1}
          onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10
            ${
              index === images.length - 1
                ? 'opacity-40 cursor-not-allowed bg-card/50'
                : 'bg-card/90 backdrop-blur-sm hover:scale-110 hover:bg-card opacity-80'
            }`}
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-20 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
          {index + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-2">
          <Thumbnails images={images} index={index} setIndex={setIndex} />
        </div>
      )}
    </div>
  );
}

export default ThumbnailCarousel;
