import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from "lucide-react";

interface GalleryLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  projectTitle?: string;
}

const GalleryLightbox = ({ images, currentIndex, isOpen, onClose, onNavigate, projectTitle }: GalleryLightboxProps) => {
  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
  }, [currentIndex, images.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1);
  }, [currentIndex, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goNext(); // RTL: left = next
      if (e.key === "ArrowRight") goPrev(); // RTL: right = prev
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose, goNext, goPrev]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-primary/95 backdrop-blur-xl" />

        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <div className="flex items-center gap-4">
              {projectTitle && (
                <span className="text-primary-foreground/80 text-sm font-medium hidden md:block">{projectTitle}</span>
              )}
              <span className="text-primary-foreground/50 text-sm font-mono tabular-nums">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={images[currentIndex]}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-20 pb-4 relative">
            {/* Previous */}
            {currentIndex > 0 && (
              <button
                onClick={goPrev}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground/80 hover:bg-primary-foreground/20 transition-all z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-full flex items-center justify-center"
              >
                <img
                  src={images[currentIndex]}
                  alt={`صورة ${currentIndex + 1}`}
                  className="max-w-full max-h-[calc(100vh-120px)] object-contain rounded-lg"
                  style={{ outline: "1px solid rgba(255,255,255,0.08)", outlineOffset: "-1px" }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Next */}
            {currentIndex < images.length - 1 && (
              <button
                onClick={goNext}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground/80 hover:bg-primary-foreground/20 transition-all z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto justify-center py-2 scrollbar-hide">
              {images.slice(
                Math.max(0, currentIndex - 5),
                Math.min(images.length, currentIndex + 6)
              ).map((img, i) => {
                const realIndex = Math.max(0, currentIndex - 5) + i;
                return (
                  <button
                    key={realIndex}
                    onClick={() => onNavigate(realIndex)}
                    className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden transition-all ${
                      realIndex === currentIndex
                        ? "ring-2 ring-accent scale-105"
                        : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GalleryLightbox;
