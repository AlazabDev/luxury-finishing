import { useState, useRef, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  /** Optional fallback image URL used when `src` fails to load. */
  fallbackSrc?: string;
}

const LazyImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  fallbackSrc,
  srcSet,
  sizes,
  ...props
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [errored, setErrored] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [currentSrcSet, setCurrentSrcSet] = useState<string | undefined>(
    typeof srcSet === "string" ? srcSet : undefined,
  );
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    setCurrentSrc(src);
    setCurrentSrcSet(typeof srcSet === "string" ? srcSet : undefined);
  }, [src, srcSet]);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setCurrentSrcSet(undefined);
      return;
    }
    setErrored(true);
  };

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden bg-muted", placeholderClassName)}
    >
      {/* Static placeholder — no pulse */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-muted transition-opacity duration-500",
          loaded && !errored ? "opacity-0" : "opacity-100",
        )}
      />

      {/* Graceful fallback when image fails to load */}
      {errored && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted/60 text-muted-foreground"
        >
          <ImageOff className="h-6 w-6 opacity-60" strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-wider opacity-70">
            صورة غير متاحة
          </span>
        </div>
      )}

      {inView && !errored && (
        <img
          src={currentSrc}
          srcSet={currentSrcSet}
          sizes={sizes}
          alt={alt}
          className={cn(
            "transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          loading={props.loading ?? "lazy"}
          decoding={props.decoding ?? "async"}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
